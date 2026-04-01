import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// College Football Data (CFBD) provider — 14 tools
// Base: https://apinext.collegefootballdata.com/
// Auth: Bearer token via Authorization header
// ---------------------------------------------------------------------------

const BASE = "https://apinext.collegefootballdata.com";

export function register(server: McpServer): void {
  const API_KEY = process.env.CFBD_API_KEY;

  function authHeaders(): Record<string, string> {
    if (!API_KEY) throw new Error("CFBD_API_KEY env var is required. Get a free key at https://collegefootballdata.com/");
    return { Authorization: `Bearer ${API_KEY}` };
  }

  async function cfbdFetch(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<unknown> {
    const url = buildUrl(`${BASE}${path}`, params);
    return fetchJson(url, { headers: authHeaders() });
  }

  // 1. cfbd_get_games
  server.tool(
    "cfbd_get_games",
    "List college football games. Filter by year, season type, week, team, or conference.",
    {
      year: z.number().int().describe("Season year (e.g. 2024)"),
      season_type: z
        .enum(["regular", "postseason"])
        .optional()
        .describe('Season type: "regular" or "postseason"'),
      week: z.number().int().optional().describe("Week number"),
      team: z.string().optional().describe("Team name filter"),
      conference: z.string().optional().describe("Conference abbreviation (e.g. SEC, B1G, ACC)"),
    },
    async ({ year, season_type, week, team, conference }) => {
      try {
        const data = await cfbdFetch("/games", {
          year,
          seasonType: season_type,
          week,
          team,
          conference,
        });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. cfbd_get_game
  server.tool(
    "cfbd_get_game",
    "Get detailed information about a specific college football game by ID.",
    {
      game_id: z.number().int().describe("CFBD game ID"),
    },
    async ({ game_id }) => {
      try {
        const data = await cfbdFetch("/games", { id: game_id });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. cfbd_get_teams
  server.tool(
    "cfbd_get_teams",
    "List college football teams, optionally filtered by conference.",
    {
      conference: z.string().optional().describe("Conference abbreviation (e.g. SEC, B1G, ACC)"),
    },
    async ({ conference }) => {
      try {
        const data = await cfbdFetch("/teams", { conference });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. cfbd_get_team
  server.tool(
    "cfbd_get_team",
    "Get details for a specific college football team by name.",
    {
      team_name: z.string().describe("Team name (e.g. Alabama, Ohio State, Clemson)"),
    },
    async ({ team_name }) => {
      try {
        const data = await cfbdFetch("/teams", { team: team_name });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. cfbd_get_rankings
  server.tool(
    "cfbd_get_rankings",
    "Get college football poll rankings (AP, Coaches, CFP) for a given year and week.",
    {
      year: z.number().int().describe("Season year (e.g. 2024)"),
      week: z.number().int().optional().describe("Week number"),
      season_type: z
        .enum(["regular", "postseason"])
        .optional()
        .describe('Season type: "regular" or "postseason"'),
    },
    async ({ year, week, season_type }) => {
      try {
        const data = await cfbdFetch("/rankings", {
          year,
          week,
          seasonType: season_type,
        });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. cfbd_get_standings
  server.tool(
    "cfbd_get_standings",
    "Get college football team records/standings for a season.",
    {
      year: z.number().int().describe("Season year (e.g. 2024)"),
      team: z.string().optional().describe("Team name filter"),
      conference: z.string().optional().describe("Conference abbreviation"),
    },
    async ({ year, team, conference }) => {
      try {
        const data = await cfbdFetch("/records", { year, team, conference });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 7. cfbd_get_drives
  server.tool(
    "cfbd_get_drives",
    "Get drive data for college football games. Filter by year, team, game, or week.",
    {
      year: z.number().int().describe("Season year (e.g. 2024)"),
      team: z.string().optional().describe("Team name filter"),
      game_id: z.number().int().optional().describe("Specific game ID"),
      week: z.number().int().optional().describe("Week number"),
    },
    async ({ year, team, game_id, week }) => {
      try {
        const data = await cfbdFetch("/drives", {
          year,
          team,
          gameId: game_id,
          week,
        });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 8. cfbd_get_plays
  server.tool(
    "cfbd_get_plays",
    "Get play-by-play data for college football. Requires year and week.",
    {
      year: z.number().int().describe("Season year (e.g. 2024)"),
      week: z.number().int().describe("Week number"),
      team: z.string().optional().describe("Team name filter"),
      play_type: z.string().optional().describe("Play type filter (e.g. Pass, Rush, Kickoff)"),
    },
    async ({ year, week, team, play_type }) => {
      try {
        const data = await cfbdFetch("/plays", {
          year,
          week,
          team,
          playType: play_type,
        });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 9. cfbd_get_player_stats
  server.tool(
    "cfbd_get_player_stats",
    "Get player season statistics for college football.",
    {
      year: z.number().int().describe("Season year (e.g. 2024)"),
      team: z.string().optional().describe("Team name filter"),
      conference: z.string().optional().describe("Conference abbreviation"),
      category: z
        .string()
        .optional()
        .describe("Stat category (e.g. passing, rushing, receiving, defensive)"),
    },
    async ({ year, team, conference, category }) => {
      try {
        const data = await cfbdFetch("/stats/player/season", {
          year,
          team,
          conference,
          category,
        });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 10. cfbd_get_team_stats
  server.tool(
    "cfbd_get_team_stats",
    "Get team season statistics for college football.",
    {
      year: z.number().int().describe("Season year (e.g. 2024)"),
      team: z.string().optional().describe("Team name filter"),
      conference: z.string().optional().describe("Conference abbreviation"),
    },
    async ({ year, team, conference }) => {
      try {
        const data = await cfbdFetch("/stats/season", { year, team, conference });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 11. cfbd_get_recruiting
  server.tool(
    "cfbd_get_recruiting",
    "Get college football recruiting rankings and player data.",
    {
      year: z.number().int().describe("Recruiting class year (e.g. 2024)"),
      team: z.string().optional().describe("Team name filter"),
      classification: z
        .string()
        .optional()
        .describe("Recruit classification (e.g. HighSchool, JUCO, PrepSchool)"),
    },
    async ({ year, team, classification }) => {
      try {
        const data = await cfbdFetch("/recruiting/players", {
          year,
          team,
          classification,
        });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 12. cfbd_get_betting_lines
  server.tool(
    "cfbd_get_betting_lines",
    "Get betting lines and spreads for college football games.",
    {
      year: z.number().int().describe("Season year (e.g. 2024)"),
      week: z.number().int().optional().describe("Week number"),
      team: z.string().optional().describe("Team name filter"),
      conference: z.string().optional().describe("Conference abbreviation"),
    },
    async ({ year, week, team, conference }) => {
      try {
        const data = await cfbdFetch("/lines", { year, week, team, conference });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 13. cfbd_get_conferences
  server.tool(
    "cfbd_get_conferences",
    "List all college football conferences.",
    {},
    async () => {
      try {
        const data = await cfbdFetch("/conferences");
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 14. cfbd_get_venues
  server.tool(
    "cfbd_get_venues",
    "List all college football venues/stadiums.",
    {},
    async () => {
      try {
        const data = await cfbdFetch("/venues");
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
