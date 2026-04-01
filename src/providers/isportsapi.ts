import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// iSportsAPI provider — 10 tools (football + basketball)
// Base: https://api.isportsapi.com/sport/
// Auth: query param `api_key`
// ---------------------------------------------------------------------------

const BASE = "https://api.isportsapi.com/sport";

export function register(server: McpServer): void {
  function getKey(): string {
    const key = process.env.ISPORTSAPI_KEY;
    if (!key) throw new Error("ISPORTSAPI_KEY env var is required");
    return key;
  }

  function apiUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined | null>,
  ): string {
    return buildUrl(`${BASE}${path}`, { api_key: getKey(), ...params });
  }

  // ---- Football (Soccer) ----

  // 1. isports_get_football_matches
  server.tool(
    "isports_get_football_matches",
    "Get football (soccer) matches with optional date, league, and status filters.",
    {
      date: z.string().optional().describe("Filter by date (YYYY-MM-DD)"),
      league_id: z.string().optional().describe("Filter by league ID"),
      status: z.string().optional().describe("Filter by match status"),
    },
    async ({ date, league_id, status }) => {
      try {
        const url = apiUrl("/football/matches", { date, league_id, status });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. isports_get_football_match
  server.tool(
    "isports_get_football_match",
    "Get details for a specific football match.",
    {
      match_id: z.string().describe("Match identifier"),
    },
    async ({ match_id }) => {
      try {
        const url = apiUrl(`/football/matches/${encodeURIComponent(match_id)}`);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. isports_get_football_leagues
  server.tool(
    "isports_get_football_leagues",
    "List all available football leagues.",
    {},
    async () => {
      try {
        const url = apiUrl("/football/leagues");
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. isports_get_football_standings
  server.tool(
    "isports_get_football_standings",
    "Get standings for a football league, optionally for a specific season.",
    {
      league_id: z.string().describe("League identifier"),
      season: z.string().optional().describe("Season year filter"),
    },
    async ({ league_id, season }) => {
      try {
        const url = apiUrl("/football/standings", { league_id, season });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. isports_get_football_teams
  server.tool(
    "isports_get_football_teams",
    "List football teams, optionally filtered by league.",
    {
      league_id: z.string().optional().describe("Filter by league ID"),
    },
    async ({ league_id }) => {
      try {
        const url = apiUrl("/football/teams", { league_id });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // ---- Basketball ----

  // 6. isports_get_basketball_matches
  server.tool(
    "isports_get_basketball_matches",
    "Get basketball matches with optional date, league, and status filters.",
    {
      date: z.string().optional().describe("Filter by date (YYYY-MM-DD)"),
      league_id: z.string().optional().describe("Filter by league ID"),
      status: z.string().optional().describe("Filter by match status"),
    },
    async ({ date, league_id, status }) => {
      try {
        const url = apiUrl("/basketball/matches", { date, league_id, status });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 7. isports_get_basketball_match
  server.tool(
    "isports_get_basketball_match",
    "Get details for a specific basketball match.",
    {
      match_id: z.string().describe("Match identifier"),
    },
    async ({ match_id }) => {
      try {
        const url = apiUrl(`/basketball/matches/${encodeURIComponent(match_id)}`);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 8. isports_get_basketball_leagues
  server.tool(
    "isports_get_basketball_leagues",
    "List all available basketball leagues.",
    {},
    async () => {
      try {
        const url = apiUrl("/basketball/leagues");
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 9. isports_get_basketball_standings
  server.tool(
    "isports_get_basketball_standings",
    "Get standings for a basketball league, optionally for a specific season.",
    {
      league_id: z.string().describe("League identifier"),
      season: z.string().optional().describe("Season year filter"),
    },
    async ({ league_id, season }) => {
      try {
        const url = apiUrl("/basketball/standings", { league_id, season });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 10. isports_get_basketball_teams
  server.tool(
    "isports_get_basketball_teams",
    "List basketball teams, optionally filtered by league.",
    {
      league_id: z.string().optional().describe("Filter by league ID"),
    },
    async ({ league_id }) => {
      try {
        const url = apiUrl("/basketball/teams", { league_id });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
