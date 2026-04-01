import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_BASE = "https://v3.football.api-sports.io";
const AUTH_HEADER = "x-apisports-key";

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function register(server: McpServer): void {
  const API_KEY = process.env.API_FOOTBALL_KEY;

  function headers() {
    return { [AUTH_HEADER]: API_KEY! };
  }

  async function callApi(
    endpoint: string,
    params: Record<string, string | number | boolean | undefined>,
  ) {
    if (!API_KEY) return errorResult("API_FOOTBALL_KEY env var is required");
    try {
      const url = buildUrl(`${API_BASE}/${endpoint}`, params);
      const data = await fetchJson(url, { headers: headers() });
      return toolResult(data);
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err));
    }
  }

  // 1. get_fixtures
  server.tool(
    "apifootball_get_fixtures",
    "Get football fixtures/matches. Filter by league, team, date range, live status, round, or status. At least one filter is recommended.",
    {
      id: z.number().optional().describe("Fixture ID"),
      league: z.number().optional().describe("League ID"),
      season: z.number().optional().describe("Season year (e.g. 2024)"),
      team: z.number().optional().describe("Team ID"),
      date: z.string().optional().describe("Date in YYYY-MM-DD format"),
      from: z.string().optional().describe("Start date (YYYY-MM-DD)"),
      to: z.string().optional().describe("End date (YYYY-MM-DD)"),
      live: z.string().optional().describe("Live fixtures filter: 'all' or league IDs separated by dashes (e.g. '39-61')"),
      round: z.string().optional().describe("Round name (e.g. 'Regular Season - 1')"),
      status: z.string().optional().describe("Fixture status short code (e.g. NS, 1H, HT, 2H, FT)"),
    },
    async (params) => {
      return callApi("fixtures", params);
    },
  );

  // 2. get_fixture_events
  server.tool(
    "apifootball_get_fixture_events",
    "Get events for a specific fixture (goals, cards, substitutions, VAR decisions).",
    {
      fixture_id: z.number().describe("Fixture ID"),
    },
    async ({ fixture_id }) => {
      return callApi("fixtures/events", { fixture: fixture_id });
    },
  );

  // 3. get_fixture_lineups
  server.tool(
    "apifootball_get_fixture_lineups",
    "Get starting lineups and substitutes for a specific fixture.",
    {
      fixture_id: z.number().describe("Fixture ID"),
    },
    async ({ fixture_id }) => {
      return callApi("fixtures/lineups", { fixture: fixture_id });
    },
  );

  // 4. get_fixture_statistics
  server.tool(
    "apifootball_get_fixture_statistics",
    "Get match statistics for a specific fixture (shots, possession, corners, fouls, etc.).",
    {
      fixture_id: z.number().describe("Fixture ID"),
    },
    async ({ fixture_id }) => {
      return callApi("fixtures/statistics", { fixture: fixture_id });
    },
  );

  // 5. get_standings
  server.tool(
    "apifootball_get_standings",
    "Get league standings/table for a specific league and season.",
    {
      league: z.number().describe("League ID"),
      season: z.number().describe("Season year (e.g. 2024)"),
    },
    async (params) => {
      return callApi("standings", params);
    },
  );

  // 6. get_teams
  server.tool(
    "apifootball_get_teams",
    "Search for teams by name, country, league, or ID.",
    {
      id: z.number().optional().describe("Team ID"),
      name: z.string().optional().describe("Team name (search)"),
      league: z.number().optional().describe("League ID"),
      season: z.number().optional().describe("Season year"),
      country: z.string().optional().describe("Country name"),
    },
    async (params) => {
      return callApi("teams", params);
    },
  );

  // 7. get_players
  server.tool(
    "apifootball_get_players",
    "Get player statistics. Search by name or filter by team/league/season. Results are paginated (25 per page).",
    {
      id: z.number().optional().describe("Player ID"),
      team: z.number().optional().describe("Team ID"),
      league: z.number().optional().describe("League ID"),
      season: z.number().optional().describe("Season year"),
      search: z.string().optional().describe("Player name to search (min 3 characters)"),
      page: z.number().optional().describe("Page number for pagination"),
    },
    async (params) => {
      return callApi("players", params);
    },
  );

  // 8. get_top_scorers
  server.tool(
    "apifootball_get_top_scorers",
    "Get the top scorers for a specific league and season.",
    {
      league: z.number().describe("League ID"),
      season: z.number().describe("Season year (e.g. 2024)"),
    },
    async (params) => {
      return callApi("players/topscorers", params);
    },
  );

  // 9. get_transfers
  server.tool(
    "apifootball_get_transfers",
    "Get transfer history for a player or team. At least one parameter is required.",
    {
      player: z.number().optional().describe("Player ID"),
      team: z.number().optional().describe("Team ID"),
    },
    async (params) => {
      return callApi("transfers", params);
    },
  );

  // 10. get_injuries
  server.tool(
    "apifootball_get_injuries",
    "Get injury and suspension reports. Filter by league, team, fixture, player, or date.",
    {
      league: z.number().optional().describe("League ID"),
      season: z.number().optional().describe("Season year"),
      fixture: z.number().optional().describe("Fixture ID"),
      team: z.number().optional().describe("Team ID"),
      player: z.number().optional().describe("Player ID"),
      date: z.string().optional().describe("Date in YYYY-MM-DD format"),
    },
    async (params) => {
      return callApi("injuries", params);
    },
  );

  // 11. get_predictions
  server.tool(
    "apifootball_get_predictions",
    "Get AI-generated predictions for a specific fixture including win probabilities, advice, and comparison stats.",
    {
      fixture_id: z.number().describe("Fixture ID"),
    },
    async ({ fixture_id }) => {
      return callApi("predictions", { fixture: fixture_id });
    },
  );

  // 12. get_odds
  server.tool(
    "apifootball_get_odds",
    "Get pre-match betting odds. Filter by fixture, league, season, bookmaker, or bet type.",
    {
      fixture: z.number().optional().describe("Fixture ID"),
      league: z.number().optional().describe("League ID"),
      season: z.number().optional().describe("Season year"),
      bookmaker: z.number().optional().describe("Bookmaker ID"),
      bet: z.number().optional().describe("Bet type ID"),
    },
    async (params) => {
      return callApi("odds", params);
    },
  );

  // 13. get_leagues
  server.tool(
    "apifootball_get_leagues",
    "List available leagues and cups. Filter by name, country, season, or current status. Over 960 competitions covered.",
    {
      id: z.number().optional().describe("League ID"),
      name: z.string().optional().describe("League name (search)"),
      country: z.string().optional().describe("Country name"),
      season: z.number().optional().describe("Season year"),
      current: z.boolean().optional().describe("Only current/active leagues"),
    },
    async (params) => {
      return callApi("leagues", params);
    },
  );

  // 14. get_countries
  server.tool(
    "apifootball_get_countries",
    "List all available countries with their codes and flags.",
    {},
    async () => {
      return callApi("countries", {});
    },
  );

  // 15. get_status
  server.tool(
    "apifootball_get_status",
    "Get your API-Football account status including subscription plan, request usage, and limits.",
    {},
    async () => {
      return callApi("status", {});
    },
  );
}
