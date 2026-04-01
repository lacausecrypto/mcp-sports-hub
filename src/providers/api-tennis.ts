import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_BASE = "https://v1.tennis.api-sports.io";
const AUTH_HEADER = "x-apisports-key";

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function register(server: McpServer): void {
  const API_KEY = process.env.API_TENNIS_KEY;

  function headers() {
    return { [AUTH_HEADER]: API_KEY! };
  }

  async function callApi(
    endpoint: string,
    params: Record<string, string | number | boolean | undefined>,
  ) {
    if (!API_KEY) return errorResult("API_TENNIS_KEY env var is required");
    try {
      const url = buildUrl(`${API_BASE}/${endpoint}`, params);
      const data = await fetchJson(url, { headers: headers() });
      return toolResult(data);
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err));
    }
  }

  // 1. get_rankings
  server.tool(
    "apitennis_get_rankings",
    "Get tennis player rankings (ATP, WTA). Optionally search by player name.",
    {
      search: z.string().optional().describe("Player name to search for"),
    },
    async (params) => {
      return callApi("rankings", params);
    },
  );

  // 2. get_seasons
  server.tool(
    "apitennis_get_seasons",
    "Get all available tennis seasons.",
    {},
    async () => {
      return callApi("seasons", {});
    },
  );

  // 3. get_categories
  server.tool(
    "apitennis_get_categories",
    "Get tournament categories (e.g. ATP, WTA, ITF). Optionally filter by category ID.",
    {
      id: z.number().optional().describe("Category ID"),
    },
    async (params) => {
      return callApi("categories", params);
    },
  );

  // 4. get_countries
  server.tool(
    "apitennis_get_countries",
    "List all available countries for tennis data.",
    {},
    async () => {
      return callApi("countries", {});
    },
  );

  // 5. get_leagues
  server.tool(
    "apitennis_get_leagues",
    "Get tennis tournaments and leagues. Filter by ID, country, or season.",
    {
      id: z.number().optional().describe("League/tournament ID"),
      country_id: z.number().optional().describe("Country ID"),
      season: z.number().optional().describe("Season year (e.g. 2024)"),
    },
    async (params) => {
      return callApi("leagues", params);
    },
  );

  // 6. get_fixtures
  server.tool(
    "apitennis_get_fixtures",
    "Get tennis matches/fixtures. Filter by ID, date, league, season, or head-to-head between two players.",
    {
      id: z.number().optional().describe("Fixture ID"),
      date: z.string().optional().describe("Date in YYYY-MM-DD format"),
      league: z.number().optional().describe("League/tournament ID"),
      season: z.number().optional().describe("Season year (e.g. 2024)"),
      h2h: z
        .string()
        .optional()
        .describe(
          "Head-to-head filter: two player IDs separated by a dash (e.g. '52-54')",
        ),
    },
    async (params) => {
      return callApi("fixtures", params);
    },
  );

  // 7. get_live
  server.tool(
    "apitennis_get_live",
    "Get all currently live tennis matches.",
    {},
    async () => {
      return callApi("fixtures", { live: "all" });
    },
  );

  // 8. get_standings
  server.tool(
    "apitennis_get_standings",
    "Get tournament standings for a specific league and season.",
    {
      league: z.number().describe("League/tournament ID"),
      season: z.number().describe("Season year (e.g. 2024)"),
    },
    async (params) => {
      return callApi("standings", params);
    },
  );

  // 9. get_players
  server.tool(
    "apitennis_get_players",
    "Search for tennis players by name, ID, or country.",
    {
      search: z.string().optional().describe("Player name to search for"),
      id: z.number().optional().describe("Player ID"),
      country_id: z.number().optional().describe("Country ID"),
    },
    async (params) => {
      return callApi("players", params);
    },
  );

  // 10. get_head2head
  server.tool(
    "apitennis_get_head2head",
    "Get head-to-head record between two tennis players, including all past matches.",
    {
      h2h: z
        .string()
        .describe("Two player IDs separated by a dash (e.g. '52-54')"),
    },
    async ({ h2h }) => {
      return callApi("fixtures", { h2h });
    },
  );

  // 11. get_statistics
  server.tool(
    "apitennis_get_statistics",
    "Get detailed match statistics for a specific fixture (aces, double faults, break points, etc.).",
    {
      fixture_id: z.number().describe("Fixture ID"),
    },
    async ({ fixture_id }) => {
      return callApi("statistics", { fixture: fixture_id });
    },
  );

  // 12. get_status
  server.tool(
    "apitennis_get_status",
    "Check your API-Tennis account status including subscription plan, request usage, and daily limits.",
    {},
    async () => {
      return callApi("status", {});
    },
  );
}
