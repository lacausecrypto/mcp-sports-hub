import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

const BASE = "https://api-web.nhle.com/v1";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function currentSeasonTag(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  // NHL season spans two calendar years; if before July, season started last year
  const startYear = month < 7 ? year - 1 : year;
  return `${startYear}${startYear + 1}`;
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

export function register(server: McpServer): void {
  // 1. get_schedule
  server.tool(
    "nhl_get_schedule",
    "Get the NHL schedule for a given date. Returns all games, start times, teams, and venues.",
    {
      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .describe("Date in YYYY-MM-DD format (defaults to today)"),
    },
    async ({ date }) => {
      try {
        const d = date ?? todayISO();
        const data = await fetchJson(`${BASE}/schedule/${d}`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. get_scores
  server.tool(
    "nhl_get_scores",
    "Get live and final scores for today's NHL games.",
    {},
    async () => {
      try {
        const data = await fetchJson(`${BASE}/score/now`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. get_standings
  server.tool(
    "nhl_get_standings",
    "Get NHL standings. Optionally filter by date or season.",
    {
      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .describe("Date in YYYY-MM-DD format (defaults to today)"),
      season: z
        .string()
        .regex(/^\d{8}$/)
        .optional()
        .describe('Season identifier, e.g. "20232024"'),
    },
    async ({ date, season }) => {
      try {
        let url = `${BASE}/standings/${date ?? todayISO()}`;
        if (season) url += `?season=${season}`;
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. get_game_boxscore
  server.tool(
    "nhl_get_game_boxscore",
    "Get the box score for a specific NHL game. Includes goals, assists, shots, saves, and other stats.",
    {
      game_id: z
        .number()
        .int()
        .describe("NHL game ID (e.g. 2023020001)"),
    },
    async ({ game_id }) => {
      try {
        const data = await fetchJson(`${BASE}/gamecenter/${game_id}/boxscore`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. get_game_play_by_play
  server.tool(
    "nhl_get_game_play_by_play",
    "Get the full play-by-play feed for an NHL game. Contains every event (shots, goals, penalties, faceoffs, etc.).",
    {
      game_id: z
        .number()
        .int()
        .describe("NHL game ID (e.g. 2023020001)"),
    },
    async ({ game_id }) => {
      try {
        const data = await fetchJson(`${BASE}/gamecenter/${game_id}/play-by-play`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. get_game_landing
  server.tool(
    "nhl_get_game_landing",
    "Get the game landing page data for an NHL game. Includes summary, three stars, scoring plays, and more.",
    {
      game_id: z
        .number()
        .int()
        .describe("NHL game ID (e.g. 2023020001)"),
    },
    async ({ game_id }) => {
      try {
        const data = await fetchJson(`${BASE}/gamecenter/${game_id}/landing`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 7. get_team_roster
  server.tool(
    "nhl_get_team_roster",
    "Get the roster for an NHL team. Returns forwards, defensemen, and goalies with jersey numbers and positions.",
    {
      team_abbrev: z
        .string()
        .min(2)
        .max(3)
        .describe('Three-letter team abbreviation (e.g. "TOR", "MTL", "BOS")'),
      season: z
        .string()
        .regex(/^\d{8}$/)
        .optional()
        .describe('Season identifier, e.g. "20232024" (defaults to current season)'),
    },
    async ({ team_abbrev, season }) => {
      try {
        const s = season ?? currentSeasonTag();
        const data = await fetchJson(`${BASE}/roster/${team_abbrev.toUpperCase()}/${s}`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 8. get_team_schedule
  server.tool(
    "nhl_get_team_schedule",
    "Get the monthly schedule for an NHL team.",
    {
      team_abbrev: z
        .string()
        .min(2)
        .max(3)
        .describe('Three-letter team abbreviation (e.g. "TOR", "MTL", "BOS")'),
      month: z
        .string()
        .regex(/^\d{4}-\d{2}$/)
        .optional()
        .describe("Month in YYYY-MM format (defaults to current month)"),
    },
    async ({ team_abbrev, month }) => {
      try {
        const m = month ?? currentMonth();
        const data = await fetchJson(
          `${BASE}/club-schedule/${team_abbrev.toUpperCase()}/month/${m}`,
        );
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 9. get_team_stats
  server.tool(
    "nhl_get_team_stats",
    "Get current-season stats for an NHL team (goals, shots, power play, penalty kill, etc.).",
    {
      team_abbrev: z
        .string()
        .min(2)
        .max(3)
        .describe('Three-letter team abbreviation (e.g. "TOR", "MTL", "BOS")'),
    },
    async ({ team_abbrev }) => {
      try {
        const data = await fetchJson(
          `${BASE}/club-stats/${team_abbrev.toUpperCase()}/now`,
        );
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 10. get_player
  server.tool(
    "nhl_get_player",
    "Get detailed information about an NHL player -- bio, career stats, current season stats, awards.",
    {
      player_id: z
        .number()
        .int()
        .describe("NHL player ID (e.g. 8478402 for Connor McDavid)"),
    },
    async ({ player_id }) => {
      try {
        const data = await fetchJson(`${BASE}/player/${player_id}/landing`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 11. get_player_game_log
  server.tool(
    "nhl_get_player_game_log",
    "Get the game-by-game stats log for an NHL player in a given season.",
    {
      player_id: z
        .number()
        .int()
        .describe("NHL player ID (e.g. 8478402)"),
      season: z
        .string()
        .regex(/^\d{8}$/)
        .optional()
        .describe('Season identifier, e.g. "20232024" (defaults to current season)'),
      game_type: z
        .number()
        .int()
        .min(2)
        .max(3)
        .optional()
        .describe("Game type: 2 = regular season (default), 3 = playoffs"),
    },
    async ({ player_id, season, game_type }) => {
      try {
        const s = season ?? currentSeasonTag();
        const gt = game_type ?? 2;
        const data = await fetchJson(`${BASE}/player/${player_id}/game-log/${s}/${gt}`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 12. get_stat_leaders
  server.tool(
    "nhl_get_stat_leaders",
    "Get the NHL stat leaders for a given category (points, goals, assists, wins, etc.).",
    {
      category: z
        .string()
        .optional()
        .describe(
          'Stat category: "points", "goals", "assists", "plusMinus", "gaa", "savePctg", etc. (defaults to "points")',
        ),
      season: z
        .string()
        .regex(/^\d{8}$/)
        .optional()
        .describe('Season identifier, e.g. "20232024"'),
    },
    async ({ category, season }) => {
      try {
        let url = `${BASE}/skater-stats-leaders/current`;
        const params: string[] = [];
        if (category) params.push(`categories=${category}`);
        if (season) params.push(`season=${season}`);
        if (params.length) url += `?${params.join("&")}`;
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 13. get_draft
  server.tool(
    "nhl_get_draft",
    "Get the current NHL draft rankings and prospect information.",
    {},
    async () => {
      try {
        const data = await fetchJson(`${BASE}/draft/rankings/now`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
