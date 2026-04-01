import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BASE_URL = "https://api.sportmonks.com/v3";

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function register(server: McpServer): void {
  const API_KEY = process.env.SPORTMONKS_API_KEY;

  function headers() {
    return {
      Authorization: API_KEY!,
      Accept: "application/json",
    };
  }

  async function callApi(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ) {
    if (!API_KEY) return errorResult("SPORTMONKS_API_KEY env var is required");
    try {
      const url = buildUrl(`${BASE_URL}${path}`, params);
      const data = await fetchJson(url, { headers: headers() });
      return toolResult(data);
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err));
    }
  }

  // 1. get_leagues
  server.tool(
    "sportmonks_get_leagues",
    "List available football leagues. Use 'include' to embed related data (e.g. 'country', 'seasons').",
    {
      include: z.string().optional().describe("Comma-separated includes (e.g. 'country,seasons')"),
      page: z.number().int().positive().optional().describe("Page number for pagination"),
    },
    async ({ include, page }) => {
      return callApi("/football/leagues", { include, page });
    },
  );

  // 2. get_fixtures
  server.tool(
    "sportmonks_get_fixtures",
    "Get football fixtures filtered by league, season, date, or team. Use 'include' for nested data like scores, events, lineups.",
    {
      league_id: z.number().int().optional().describe("Filter by league ID"),
      season_id: z.number().int().optional().describe("Filter by season ID"),
      date: z.string().optional().describe("Filter by date (YYYY-MM-DD)"),
      team_id: z.number().int().optional().describe("Filter by team ID"),
      include: z.string().optional().describe("Comma-separated includes (e.g. 'scores,events,lineups,participants')"),
      page: z.number().int().positive().optional().describe("Page number for pagination"),
    },
    async ({ league_id, season_id, date, team_id, include, page }) => {
      let path = "/football/fixtures";
      const params: Record<string, string | number | undefined> = { include, page };

      if (date) {
        path = `/football/fixtures/date/${date}`;
      }

      if (league_id) params["filters[league_id]"] = league_id;
      if (season_id) params["filters[season_id]"] = season_id;
      if (team_id) params["filters[team_id]"] = team_id;

      return callApi(path, params);
    },
  );

  // 3. get_fixture_by_id
  server.tool(
    "sportmonks_get_fixture_by_id",
    "Get detailed information about a specific fixture by its ID.",
    {
      fixture_id: z.number().int().describe("The fixture ID"),
      include: z.string().optional().describe("Comma-separated includes (e.g. 'scores,events,lineups,statistics,participants')"),
    },
    async ({ fixture_id, include }) => {
      return callApi(`/football/fixtures/${fixture_id}`, { include });
    },
  );

  // 4. get_livescores
  server.tool(
    "sportmonks_get_livescores",
    "Get current live scores for ongoing football matches.",
    {
      include: z.string().optional().describe("Comma-separated includes (e.g. 'scores,events,lineups,participants')"),
    },
    async ({ include }) => {
      return callApi("/football/livescores/inplay", { include });
    },
  );

  // 5. get_standings
  server.tool(
    "sportmonks_get_standings",
    "Get league standings for a specific season.",
    {
      season_id: z.number().int().describe("The season ID"),
      include: z.string().optional().describe("Comma-separated includes (e.g. 'participant,details,form')"),
    },
    async ({ season_id, include }) => {
      return callApi(`/football/standings/seasons/${season_id}`, { include });
    },
  );

  // 6. get_teams
  server.tool(
    "sportmonks_get_teams",
    "List football teams, optionally filtered by country.",
    {
      country_id: z.number().int().optional().describe("Filter by country ID"),
      include: z.string().optional().describe("Comma-separated includes (e.g. 'country,venue,coaches')"),
      page: z.number().int().positive().optional().describe("Page number for pagination"),
    },
    async ({ country_id, include, page }) => {
      let path = "/football/teams";
      if (country_id) path = `/football/teams/countries/${country_id}`;
      return callApi(path, { include, page });
    },
  );

  // 7. get_team_by_id
  server.tool(
    "sportmonks_get_team_by_id",
    "Get detailed information about a specific team.",
    {
      team_id: z.number().int().describe("The team ID"),
      include: z.string().optional().describe("Comma-separated includes (e.g. 'country,venue,coaches,players')"),
    },
    async ({ team_id, include }) => {
      return callApi(`/football/teams/${team_id}`, { include });
    },
  );

  // 8. get_players
  server.tool(
    "sportmonks_get_players",
    "Search for football players by name or filter by country.",
    {
      search: z.string().optional().describe("Search query for player name"),
      country_id: z.number().int().optional().describe("Filter by country ID"),
      include: z.string().optional().describe("Comma-separated includes (e.g. 'country,teams,position')"),
      page: z.number().int().positive().optional().describe("Page number for pagination"),
    },
    async ({ search, country_id, include, page }) => {
      let path = "/football/players";

      if (search) {
        path = `/football/players/search/${encodeURIComponent(search)}`;
      } else if (country_id) {
        path = `/football/players/countries/${country_id}`;
      }

      return callApi(path, { include, page });
    },
  );

  // 9. get_player_by_id
  server.tool(
    "sportmonks_get_player_by_id",
    "Get detailed information about a specific player.",
    {
      player_id: z.number().int().describe("The player ID"),
      include: z.string().optional().describe("Comma-separated includes (e.g. 'country,teams,position,statistics')"),
    },
    async ({ player_id, include }) => {
      return callApi(`/football/players/${player_id}`, { include });
    },
  );

  // 10. get_topscorers
  server.tool(
    "sportmonks_get_topscorers",
    "Get top scorers for a specific season.",
    {
      season_id: z.number().int().describe("The season ID"),
      include: z.string().optional().describe("Comma-separated includes (e.g. 'participant,player')"),
    },
    async ({ season_id, include }) => {
      return callApi(`/football/topscorers/seasons/${season_id}`, { include });
    },
  );

  // 11. get_seasons
  server.tool(
    "sportmonks_get_seasons",
    "List available seasons, optionally filtered by league.",
    {
      league_id: z.number().int().optional().describe("Filter by league ID"),
      page: z.number().int().positive().optional().describe("Page number for pagination"),
    },
    async ({ league_id, page }) => {
      const params: Record<string, string | number | undefined> = { page };
      if (league_id) params["filters[league_id]"] = league_id;
      return callApi("/football/seasons", params);
    },
  );

  // 12. get_countries
  server.tool(
    "sportmonks_get_countries",
    "List all available countries.",
    {},
    async () => {
      return callApi("/football/countries");
    },
  );
}
