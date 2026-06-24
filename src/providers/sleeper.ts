import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buildUrl, fetchJson, pathSegment, safe, toolResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Sleeper (fantasy football) — 10 tools
// Base: https://api.sleeper.app/v1
// Auth: none, read-only. No signup. Soft limit ~1000 req/min (IP block above).
// NFL only for player metadata. The /players/nfl dump is ~14MB and per the docs
//   should be fetched at most once/day — we cache it for 24h and never return it
//   whole (search_players filters it; trending enriches names from it).
// ---------------------------------------------------------------------------

const BASE = "https://api.sleeper.app/v1";
const PLAYERS_TTL = 86_400; // 24h — the players dump is large and rarely changes

type Player = Record<string, unknown> & {
  player_id?: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  team?: string | null;
  position?: string | null;
  status?: string | null;
  injury_status?: string | null;
  depth_chart_order?: number | null;
};

async function loadPlayers(): Promise<Record<string, Player>> {
  return (await fetchJson(`${BASE}/players/nfl`, { cacheTtl: PLAYERS_TTL })) as Record<string, Player>;
}

function playerName(p: Player): string {
  return (p.full_name || [p.first_name, p.last_name].filter(Boolean).join(" ") || p.player_id || "").trim();
}

// Trim a player to the useful fields so we never dump the whole record set.
function slimPlayer(p: Player) {
  return {
    player_id: p.player_id,
    name: playerName(p),
    team: p.team ?? null,
    position: p.position ?? null,
    fantasy_positions: p.fantasy_positions ?? null,
    age: p.age ?? null,
    status: p.status ?? null,
    injury_status: p.injury_status ?? null,
    depth_chart_order: p.depth_chart_order ?? null,
    college: p.college ?? null,
    number: p.number ?? null,
  };
}

export function register(server: McpServer): void {
  // 1. NFL state — current season / week
  server.tool(
    "sleeper_get_nfl_state",
    "Get the current NFL season, week, and season type (pre/regular/post/off) as tracked by Sleeper.",
    {},
    safe(async () => toolResult(await fetchJson(`${BASE}/state/nfl`))),
  );

  // 2. search players — filters the cached player dump, returns slim records
  server.tool(
    "sleeper_search_players",
    "Search the Sleeper NFL player database by name (and optionally team/position). Returns slim records with injury status, depth-chart order, team and position. The full player set is cached for 24h.",
    {
      query: z.string().min(1).describe("Name (full or partial), case-insensitive"),
      team: z.string().optional().describe("Filter by team abbreviation (e.g. KC, BUF)"),
      position: z.string().optional().describe("Filter by position (e.g. QB, RB, WR, TE)"),
      limit: z.number().int().min(1).max(100).optional().describe("Max results (default 25)"),
    },
    safe(async ({ query, team, position, limit }) => {
      const players = await loadPlayers();
      const q = query.toLowerCase();
      const t = team?.toUpperCase();
      const pos = position?.toUpperCase();
      const max = limit ?? 25;
      const matches: ReturnType<typeof slimPlayer>[] = [];
      for (const p of Object.values(players)) {
        if (!playerName(p).toLowerCase().includes(q)) continue;
        if (t && (p.team ?? "").toUpperCase() !== t) continue;
        if (pos && (p.position ?? "").toUpperCase() !== pos) continue;
        matches.push(slimPlayer(p));
        if (matches.length >= max) break;
      }
      return toolResult({ count: matches.length, players: matches });
    }),
  );

  // 3. trending players — most added/dropped, name-enriched
  server.tool(
    "sleeper_get_trending_players",
    "Get the most-added or most-dropped NFL players over a lookback window, enriched with names/teams/positions. Doubles as a crude buzz signal.",
    {
      type: z.enum(["add", "drop"]).describe("'add' (most added) or 'drop' (most dropped)"),
      lookback_hours: z.number().int().min(1).max(168).optional().describe("Lookback window in hours (default 24)"),
      limit: z.number().int().min(1).max(100).optional().describe("Max results (default 25)"),
    },
    safe(async ({ type, lookback_hours, limit }) => {
      const trending = (await fetchJson(
        buildUrl(`${BASE}/players/nfl/trending/${pathSegment(type)}`, {
          lookback_hours: lookback_hours ?? 24,
          limit: limit ?? 25,
        }),
      )) as Array<{ player_id: string; count: number }>;
      const players = await loadPlayers();
      const enriched = trending.map((t) => ({
        count: t.count,
        ...slimPlayer(players[t.player_id] ?? { player_id: t.player_id }),
      }));
      return toolResult({ type, count: enriched.length, players: enriched });
    }),
  );

  // 4. user — profile by username or user id
  server.tool(
    "sleeper_get_user",
    "Get a Sleeper user (profile, user_id, display name) by username or numeric user id.",
    {
      username_or_id: z.string().min(1).describe("Sleeper username or numeric user id"),
    },
    safe(async ({ username_or_id }) =>
      toolResult(await fetchJson(`${BASE}/user/${pathSegment(username_or_id)}`)),
    ),
  );

  // 5. user leagues — all NFL leagues a user is in for a season
  server.tool(
    "sleeper_get_user_leagues",
    "List the NFL leagues a user belongs to for a given season. Use the user_id from sleeper_get_user.",
    {
      user_id: z.string().min(1).describe("Numeric user id (from sleeper_get_user)"),
      season: z.string().min(4).describe("Season year, e.g. \"2025\""),
    },
    safe(async ({ user_id, season }) =>
      toolResult(await fetchJson(`${BASE}/user/${pathSegment(user_id)}/leagues/nfl/${pathSegment(season)}`)),
    ),
  );

  // 6. league — league detail
  server.tool(
    "sleeper_get_league",
    "Get details for a Sleeper league (settings, scoring, roster positions, status).",
    {
      league_id: z.string().min(1).describe("League id (from sleeper_get_user_leagues)"),
    },
    safe(async ({ league_id }) =>
      toolResult(await fetchJson(`${BASE}/league/${pathSegment(league_id)}`)),
    ),
  );

  // 7. league rosters
  server.tool(
    "sleeper_get_league_rosters",
    "Get all rosters in a league (owners, player_ids, wins/losses, points).",
    {
      league_id: z.string().min(1).describe("League id"),
    },
    safe(async ({ league_id }) =>
      toolResult(await fetchJson(`${BASE}/league/${pathSegment(league_id)}/rosters`)),
    ),
  );

  // 8. league users
  server.tool(
    "sleeper_get_league_users",
    "Get all users (managers) in a league with display names and team names.",
    {
      league_id: z.string().min(1).describe("League id"),
    },
    safe(async ({ league_id }) =>
      toolResult(await fetchJson(`${BASE}/league/${pathSegment(league_id)}/users`)),
    ),
  );

  // 9. league matchups for a week
  server.tool(
    "sleeper_get_league_matchups",
    "Get the matchups for a league in a given week (roster_id, points, starters).",
    {
      league_id: z.string().min(1).describe("League id"),
      week: z.number().int().min(1).max(22).describe("NFL week number"),
    },
    safe(async ({ league_id, week }) =>
      toolResult(await fetchJson(`${BASE}/league/${pathSegment(league_id)}/matchups/${pathSegment(week)}`)),
    ),
  );

  // 10. draft picks
  server.tool(
    "sleeper_get_draft_picks",
    "Get all picks for a draft (round, pick number, roster, player_id, metadata). Get a draft_id from sleeper_get_league (draft_id) or the league's drafts.",
    {
      draft_id: z.string().min(1).describe("Draft id"),
    },
    safe(async ({ draft_id }) =>
      toolResult(await fetchJson(`${BASE}/draft/${pathSegment(draft_id)}/picks`)),
    ),
  );
}
