import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_URL = "https://api.balldontlie.io/v1";

const SUPPORTED_SPORTS = ["nba", "nfl", "mlb", "nhl"] as const;
const SportSchema = z
  .enum(SUPPORTED_SPORTS)
  .describe("Sport league: nba, nfl, mlb, or nhl");

const CursorSchema = z
  .number()
  .optional()
  .describe("Pagination cursor returned from a previous request");

const PerPageSchema = z
  .number()
  .min(1)
  .max(100)
  .optional()
  .describe("Number of results per page (1-100)");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build a URL that supports array query params (e.g. dates[], team_ids[]).
 */
function buildArrayUrl(
  base: string,
  params: Record<string, string | string[] | number | number[] | undefined>,
): string {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const v of value) {
        url.searchParams.append(`${key}[]`, String(v));
      }
    } else {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function register(server: McpServer): void {
  const API_KEY = process.env.BALLDONTLIE_API_KEY;

  function headers() {
    return { Authorization: `Bearer ${API_KEY}` };
  }

  async function callApi(
    sport: string,
    path: string,
    params: Record<string, string | string[] | number | number[] | undefined> = {},
  ) {
    if (!API_KEY) return errorResult("BALLDONTLIE_API_KEY env var is required");
    try {
      const url = buildArrayUrl(`${BASE_URL}/${sport}/${path}`, params);
      const data = await fetchJson(url, { headers: headers() });
      return toolResult(data);
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err));
    }
  }

  // 1. get_players
  server.tool(
    "bdl_get_players",
    "Search or list players for a given sport. Supports pagination and name search.",
    {
      sport: SportSchema,
      search: z.string().optional().describe("Search by player name"),
      cursor: CursorSchema,
      per_page: PerPageSchema,
    },
    async ({ sport, search, cursor, per_page }) => {
      return callApi(sport, "players", { search, cursor, per_page });
    },
  );

  // 2. get_player_by_id
  server.tool(
    "bdl_get_player_by_id",
    "Get detailed information about a specific player by their ID.",
    {
      sport: SportSchema,
      player_id: z.number().describe("The player's unique ID"),
    },
    async ({ sport, player_id }) => {
      return callApi(sport, `players/${player_id}`);
    },
  );

  // 3. get_teams
  server.tool(
    "bdl_get_teams",
    "List teams for a given sport. Optionally filter by conference or division.",
    {
      sport: SportSchema,
      conference: z.string().optional().describe("Filter by conference (e.g. East, West, AFC, NFC)"),
      division: z.string().optional().describe("Filter by division (e.g. Atlantic, Central, Southeast)"),
    },
    async ({ sport, conference, division }) => {
      return callApi(sport, "teams", { conference, division });
    },
  );

  // 4. get_games
  server.tool(
    "bdl_get_games",
    "Get games for a sport. Filter by dates, seasons, or team IDs. Supports pagination.",
    {
      sport: SportSchema,
      dates: z
        .array(z.string())
        .optional()
        .describe("Filter by game dates (YYYY-MM-DD format)"),
      seasons: z
        .array(z.number())
        .optional()
        .describe("Filter by season years (e.g. [2023, 2024])"),
      team_ids: z
        .array(z.number())
        .optional()
        .describe("Filter by team IDs"),
      cursor: CursorSchema,
      per_page: PerPageSchema,
    },
    async ({ sport, dates, seasons, team_ids, cursor, per_page }) => {
      return callApi(sport, "games", { dates, seasons, team_ids, cursor, per_page });
    },
  );

  // 5. get_game_by_id
  server.tool(
    "bdl_get_game_by_id",
    "Get detailed information about a specific game by its ID.",
    {
      sport: SportSchema,
      game_id: z.number().describe("The game's unique ID"),
    },
    async ({ sport, game_id }) => {
      return callApi(sport, `games/${game_id}`);
    },
  );

  // 6. get_stats
  server.tool(
    "bdl_get_stats",
    "Get player game stats. Filter by player IDs, game IDs, or seasons. Supports pagination.",
    {
      sport: SportSchema,
      player_ids: z
        .array(z.number())
        .optional()
        .describe("Filter by player IDs"),
      game_ids: z
        .array(z.number())
        .optional()
        .describe("Filter by game IDs"),
      seasons: z
        .array(z.number())
        .optional()
        .describe("Filter by season years"),
      cursor: CursorSchema,
      per_page: PerPageSchema,
    },
    async ({ sport, player_ids, game_ids, seasons, cursor, per_page }) => {
      return callApi(sport, "stats", { player_ids, game_ids, seasons, cursor, per_page });
    },
  );

  // 7. get_season_averages
  server.tool(
    "bdl_get_season_averages",
    "Get season averages for one or more players in a specific season.",
    {
      sport: SportSchema,
      season: z.number().describe("The season year (e.g. 2023)"),
      player_ids: z
        .array(z.number())
        .min(1)
        .describe("One or more player IDs to get averages for"),
    },
    async ({ sport, season, player_ids }) => {
      return callApi(sport, "season_averages", { season, player_ids });
    },
  );

  // 8. get_box_scores
  server.tool(
    "bdl_get_box_scores",
    "Get box scores for all games on a specific date.",
    {
      sport: SportSchema,
      date: z
        .string()
        .describe("The date to get box scores for (YYYY-MM-DD format)"),
    },
    async ({ sport, date }) => {
      return callApi(sport, "box_scores", { date });
    },
  );

  // 9. get_standings
  server.tool(
    "bdl_get_standings",
    "Get current or historical standings for a sport and season.",
    {
      sport: SportSchema,
      season: z.number().describe("The season year (e.g. 2023)"),
    },
    async ({ sport, season }) => {
      return callApi(sport, "standings", { season });
    },
  );

  // 10. get_leaders
  server.tool(
    "bdl_get_leaders",
    "Get statistical leaders for a sport, season, and stat category.",
    {
      sport: SportSchema,
      season: z.number().describe("The season year (e.g. 2023)"),
      stat_type: z
        .string()
        .describe(
          "The stat category (e.g. pts, reb, ast for NBA; passing_yards, rushing_yards for NFL)",
        ),
    },
    async ({ sport, season, stat_type }) => {
      return callApi(sport, "leaders", { season, stat_type });
    },
  );
}
