import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buildUrl, fetchJson, pathSegment, safe, toolResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// OpenDota (Dota 2 analytics) — 11 tools
// Base: https://api.opendota.com/api
// Auth: none for the free tier (~60 req/min, 50k req/month, IP-based).
//   REST/JSON, stable, public. Wraps/enriches Valve's Steam Web API.
// Complements PandaScore (which covers Dota 2 schedules/odds) with deep
//   match / player / hero analytics.
// ---------------------------------------------------------------------------

const BASE = "https://api.opendota.com/api";

export function register(server: McpServer): void {
  // 1. pro matches — recent professional matches
  server.tool(
    "opendota_get_pro_matches",
    "Get recent professional Dota 2 matches (teams, league, duration, winner). Use a match_id with opendota_get_match for full detail.",
    {},
    safe(async () => toolResult(await fetchJson(`${BASE}/proMatches`))),
  );

  // 2. match detail
  server.tool(
    "opendota_get_match",
    "Get full detail for a Dota 2 match: players, heroes, K/D/A, items, gold/xp, objectives.",
    {
      match_id: z.number().int().positive().describe("Match id (e.g. from opendota_get_pro_matches)"),
    },
    safe(async ({ match_id }) => toolResult(await fetchJson(`${BASE}/matches/${pathSegment(match_id)}`))),
  );

  // 3. player profile
  server.tool(
    "opendota_get_player",
    "Get a player's profile and aggregate stats by Steam32 account id (rank, MMR estimate, profile).",
    {
      account_id: z.number().int().positive().describe("Steam32 account id (from opendota_search_players)"),
    },
    safe(async ({ account_id }) => toolResult(await fetchJson(`${BASE}/players/${pathSegment(account_id)}`))),
  );

  // 4. player recent matches
  server.tool(
    "opendota_get_player_matches",
    "Get a player's recent matches (hero, result, K/D/A, duration). Use `limit` to cap the list.",
    {
      account_id: z.number().int().positive().describe("Steam32 account id"),
      limit: z.number().int().min(1).max(100).optional().describe("Max matches (default 20)"),
    },
    safe(async ({ account_id, limit }) =>
      toolResult(
        await fetchJson(buildUrl(`${BASE}/players/${pathSegment(account_id)}/matches`, { limit: limit ?? 20 })),
      ),
    ),
  );

  // 5. player win/loss
  server.tool(
    "opendota_get_player_win_loss",
    "Get a player's overall win/loss record.",
    {
      account_id: z.number().int().positive().describe("Steam32 account id"),
    },
    safe(async ({ account_id }) => toolResult(await fetchJson(`${BASE}/players/${pathSegment(account_id)}/wl`))),
  );

  // 6. player heroes
  server.tool(
    "opendota_get_player_heroes",
    "Get a player's per-hero stats (games, win rate, last played).",
    {
      account_id: z.number().int().positive().describe("Steam32 account id"),
    },
    safe(async ({ account_id }) => toolResult(await fetchJson(`${BASE}/players/${pathSegment(account_id)}/heroes`))),
  );

  // 7. hero stats — meta
  server.tool(
    "opendota_get_hero_stats",
    "Get hero stats / current meta: per-bracket pick and win counts for every hero.",
    {},
    safe(async () => toolResult(await fetchJson(`${BASE}/heroStats`))),
  );

  // 8. heroes — directory
  server.tool(
    "opendota_get_heroes",
    "List all Dota 2 heroes with id, name, primary attribute and roles.",
    {},
    safe(async () => toolResult(await fetchJson(`${BASE}/heroes`))),
  );

  // 9. pro teams
  server.tool(
    "opendota_get_pro_teams",
    "List professional Dota 2 teams with rating, wins/losses and last match time.",
    {},
    safe(async () => toolResult(await fetchJson(`${BASE}/teams`))),
  );

  // 10. pro leagues
  server.tool(
    "opendota_get_pro_leagues",
    "List Dota 2 leagues / tournaments with id, name and tier.",
    {},
    safe(async () => toolResult(await fetchJson(`${BASE}/leagues`))),
  );

  // 11. search players
  server.tool(
    "opendota_search_players",
    "Search for Dota 2 players by persona name. Returns account_id values for use with the player tools.",
    {
      query: z.string().min(1).describe("Player persona name to search"),
    },
    // /search is a heavy DB query on OpenDota's side and can take 20-30s; allow extra time.
    safe(async ({ query }) =>
      toolResult(await fetchJson(buildUrl(`${BASE}/search`, { q: query }), { timeoutMs: 30_000 })),
    ),
  );
}
