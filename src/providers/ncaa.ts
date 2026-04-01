import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// NCAA API provider — 8 tools
// Base: https://ncaa-api.henrygd.me/
// Auth: None
// ---------------------------------------------------------------------------

const BASE = "https://ncaa-api.henrygd.me";

/** Build a path from non-empty segments. */
function pathJoin(...segments: (string | undefined)[]): string {
  return segments.filter((s) => s !== undefined && s !== "").join("/");
}

export function register(server: McpServer): void {
  // 1. ncaa_get_scoreboard
  server.tool(
    "ncaa_get_scoreboard",
    "Get the NCAA scoreboard for a sport and division. Returns games with scores, status, and basic info.",
    {
      sport: z.string().describe('Sport name, e.g. "football", "basketball", "baseball", "soccer", "hockey", "lacrosse"'),
      division: z.string().describe('Division code, e.g. "fbs", "fcs", "d1", "d2", "d3"'),
      date: z.string().optional().describe("Date in YYYY/MM/DD format (e.g. 2024/01/15). Defaults to today."),
    },
    async ({ sport, division, date }) => {
      try {
        const path = pathJoin("scoreboard", sport, division, date);
        const data = await fetchJson(`${BASE}/${path}`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. ncaa_get_game
  server.tool(
    "ncaa_get_game",
    "Get detailed information about a specific NCAA game, including play-by-play, box score, and stats.",
    {
      sport: z.string().describe('Sport name, e.g. "football", "basketball"'),
      game_id: z.string().describe("NCAA game ID"),
    },
    async ({ sport, game_id }) => {
      try {
        const data = await fetchJson(`${BASE}/game/${sport}/${game_id}`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. ncaa_get_rankings
  server.tool(
    "ncaa_get_rankings",
    "Get NCAA rankings/polls (AP, Coaches, CFP, etc.) for a sport.",
    {
      sport: z.string().describe('Sport name, e.g. "football", "basketball"'),
      division: z.string().optional().describe('Division code, e.g. "fbs", "d1"'),
      poll: z.string().optional().describe('Poll name, e.g. "ap", "coaches", "cfp"'),
      year: z.string().optional().describe("Year (e.g. 2024)"),
      week: z.string().optional().describe("Week number"),
    },
    async ({ sport, division, poll, year, week }) => {
      try {
        const path = pathJoin("rankings", sport, division, poll, year, week);
        const data = await fetchJson(`${BASE}/${path}`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. ncaa_get_standings
  server.tool(
    "ncaa_get_standings",
    "Get NCAA standings for a sport and division, optionally for a specific year.",
    {
      sport: z.string().describe('Sport name, e.g. "football", "basketball"'),
      division: z.string().optional().describe('Division code, e.g. "fbs", "d1"'),
      year: z.string().optional().describe("Year (e.g. 2024)"),
    },
    async ({ sport, division, year }) => {
      try {
        const path = pathJoin("standings", sport, division, year);
        const data = await fetchJson(`${BASE}/${path}`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. ncaa_get_teams
  server.tool(
    "ncaa_get_teams",
    "Get NCAA teams in a division, optionally filtered by conference.",
    {
      sport: z.string().describe('Sport name, e.g. "football", "basketball"'),
      division: z.string().describe('Division code, e.g. "fbs", "d1"'),
      conference_id: z.string().optional().describe("Conference ID to filter by"),
    },
    async ({ sport, division, conference_id }) => {
      try {
        let url = `${BASE}/teams/${sport}/${division}`;
        if (conference_id) url += `?conference=${conference_id}`;
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. ncaa_get_schedule
  server.tool(
    "ncaa_get_schedule",
    "Get a team's NCAA schedule for a season.",
    {
      sport: z.string().describe('Sport name, e.g. "football", "basketball"'),
      team_id: z.string().describe("NCAA team ID"),
      year: z.string().optional().describe("Year (e.g. 2024)"),
    },
    async ({ sport, team_id, year }) => {
      try {
        const path = pathJoin("schedule", sport, team_id, year);
        const data = await fetchJson(`${BASE}/${path}`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 7. ncaa_get_stats
  server.tool(
    "ncaa_get_stats",
    "Get player or team statistics for an NCAA sport/division.",
    {
      sport: z.string().describe('Sport name, e.g. "football", "basketball"'),
      division: z.string().describe('Division code, e.g. "fbs", "d1"'),
      stat_type: z.string().optional().describe('Stat type: "individual" or "team"'),
      year: z.string().optional().describe("Year (e.g. 2024)"),
    },
    async ({ sport, division, stat_type, year }) => {
      try {
        const path = pathJoin("stats", sport, division, stat_type, year);
        const data = await fetchJson(`${BASE}/${path}`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 8. ncaa_get_news
  server.tool(
    "ncaa_get_news",
    "Get the latest NCAA news, optionally filtered by sport.",
    {
      sport: z.string().optional().describe('Sport name, e.g. "football", "basketball". Omit for all sports.'),
    },
    async ({ sport }) => {
      try {
        const path = pathJoin("news", sport);
        const data = await fetchJson(`${BASE}/${path}`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
