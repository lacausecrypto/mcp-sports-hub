import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUPPORTED_SPORTS = [
  "football",
  "basketball",
  "baseball",
  "hockey",
  "rugby",
  "handball",
  "volleyball",
  "american-football",
  "formula-1",
] as const;

const SPORT_ENUM = z.enum(SUPPORTED_SPORTS);
type Sport = (typeof SUPPORTED_SPORTS)[number];

const AUTH_HEADER = "x-apisports-key";

function baseUrl(sport: Sport): string {
  return `https://v3.${sport}.api-sports.io`;
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function register(server: McpServer): void {
  const API_KEY = process.env.API_SPORTS_KEY;

  function headers() {
    return { [AUTH_HEADER]: API_KEY! };
  }

  async function callApi(
    sport: Sport,
    endpoint: string,
    params: Record<string, string | number | boolean | undefined>,
  ) {
    if (!API_KEY) return errorResult("API_SPORTS_KEY env var is required");
    try {
      const url = buildUrl(`${baseUrl(sport)}/${endpoint}`, params);
      const data = await fetchJson(url, { headers: headers() });
      return toolResult(data);
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err));
    }
  }

  const optStr = z.string().optional();
  const optNum = z.number().optional();

  // 1. get_fixtures
  server.tool(
    "apisports_get_fixtures",
    "Get fixtures / matches for a sport. Filter by league, season, date range, team, or live status.",
    {
      sport: SPORT_ENUM.describe("Sport to query"),
      league: optNum.describe("League ID"),
      season: optNum.describe("Season year (e.g. 2023)"),
      date: optStr.describe("Exact date (YYYY-MM-DD)"),
      from: optStr.describe("Start date (YYYY-MM-DD)"),
      to: optStr.describe("End date (YYYY-MM-DD)"),
      team: optNum.describe("Team ID"),
      live: optStr.describe("'all' to get only live fixtures"),
    },
    async (params) => {
      const endpoint = params.sport === "formula-1" ? "races" : "fixtures";
      return callApi(params.sport, endpoint, {
        league: params.league,
        season: params.season,
        date: params.date,
        from: params.from,
        to: params.to,
        team: params.team,
        live: params.live,
      });
    },
  );

  // 2. get_standings
  server.tool(
    "apisports_get_standings",
    "Get league standings / rankings for a sport, league, and season.",
    {
      sport: SPORT_ENUM.describe("Sport to query"),
      league: z.number().describe("League ID"),
      season: z.number().describe("Season year (e.g. 2023)"),
    },
    async (params) => {
      const endpoint =
        params.sport === "formula-1" ? "rankings/races" : "standings";
      return callApi(params.sport, endpoint, {
        league: params.league,
        season: params.season,
      });
    },
  );

  // 3. get_teams
  server.tool(
    "apisports_get_teams",
    "Search for teams by name, country, league, or ID.",
    {
      sport: SPORT_ENUM.describe("Sport to query"),
      id: optNum.describe("Team ID"),
      name: optStr.describe("Team name (search)"),
      league: optNum.describe("League ID"),
      country: optStr.describe("Country name"),
      season: optNum.describe("Season year"),
    },
    async (params) => {
      return callApi(params.sport, "teams", {
        id: params.id,
        name: params.name,
        league: params.league,
        country: params.country,
        season: params.season,
      });
    },
  );

  // 4. get_players
  server.tool(
    "apisports_get_players",
    "Get player information and statistics.",
    {
      sport: SPORT_ENUM.describe("Sport to query"),
      league: optNum.describe("League ID"),
      season: optNum.describe("Season year"),
      team: optNum.describe("Team ID"),
      player_id: optNum.describe("Player ID"),
      page: optNum.describe("Page number for pagination"),
    },
    async (params) => {
      const endpoint = params.sport === "formula-1" ? "drivers" : "players";
      return callApi(params.sport, endpoint, {
        league: params.league,
        season: params.season,
        team: params.team,
        id: params.player_id,
        page: params.page,
      });
    },
  );

  // 5. get_odds
  server.tool(
    "apisports_get_odds",
    "Get betting odds for fixtures. Not available for all sports.",
    {
      sport: SPORT_ENUM.describe("Sport to query"),
      fixture_id: optNum.describe("Fixture ID"),
      league: optNum.describe("League ID"),
      season: optNum.describe("Season year"),
      bookmaker: optNum.describe("Bookmaker ID"),
    },
    async (params) => {
      return callApi(params.sport, "odds", {
        fixture: params.fixture_id,
        league: params.league,
        season: params.season,
        bookmaker: params.bookmaker,
      });
    },
  );

  // 6. get_leagues
  server.tool(
    "apisports_get_leagues",
    "List available leagues / competitions for a sport.",
    {
      sport: SPORT_ENUM.describe("Sport to query"),
      country: optStr.describe("Country name"),
      season: optNum.describe("Season year"),
      id: optNum.describe("League ID"),
    },
    async (params) => {
      const endpoint =
        params.sport === "formula-1" ? "competitions" : "leagues";
      return callApi(params.sport, endpoint, {
        country: params.country,
        season: params.season,
        id: params.id,
      });
    },
  );

  // 7. get_live_scores
  server.tool(
    "apisports_get_live_scores",
    "Get live scores for currently active matches (updated every 15 seconds).",
    {
      sport: SPORT_ENUM.describe("Sport to query"),
      league: optNum.describe("League ID to filter by"),
    },
    async (params) => {
      const endpoint =
        params.sport === "formula-1" ? "races" : "fixtures";
      const apiParams: Record<string, string | number | boolean | undefined> = {
        live: "all",
      };
      if (params.league) apiParams.league = params.league;
      return callApi(params.sport, endpoint, apiParams);
    },
  );

  // 8. get_team_statistics
  server.tool(
    "apisports_get_team_statistics",
    "Get detailed statistics for a team in a given league and season.",
    {
      sport: SPORT_ENUM.describe("Sport to query"),
      league: z.number().describe("League ID"),
      season: z.number().describe("Season year"),
      team: z.number().describe("Team ID"),
    },
    async (params) => {
      return callApi(params.sport, "teams/statistics", {
        league: params.league,
        season: params.season,
        team: params.team,
      });
    },
  );

  // 9. get_head2head
  server.tool(
    "apisports_get_head2head",
    "Get head-to-head results between two teams.",
    {
      sport: SPORT_ENUM.describe("Sport to query"),
      h2h: z
        .string()
        .describe("Head-to-head team IDs in format 'teamId1-teamId2'"),
    },
    async (params) => {
      return callApi(params.sport, "fixtures/headtohead", {
        h2h: params.h2h,
      });
    },
  );

  // 10. get_status
  server.tool(
    "apisports_get_status",
    "Get API account status: current subscription, requests used/remaining, rate limits.",
    {
      sport: SPORT_ENUM.describe(
        "Sport to check status for (each sport has its own quota)",
      ),
    },
    async (params) => {
      return callApi(params.sport, "status", {});
    },
  );
}
