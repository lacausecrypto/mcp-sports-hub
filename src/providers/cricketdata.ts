import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// CricketData provider — 10 tools
// Base: https://api.cricapi.com/v1/
// Auth: apikey query param
// ---------------------------------------------------------------------------

export function register(server: McpServer): void {
  const API_KEY = process.env.CRICKETDATA_API_KEY;
  const BASE = "https://api.cricapi.com/v1";

  async function callApi(endpoint: string, params: Record<string, string> = {}) {
    if (!API_KEY) throw new Error("CRICKETDATA_API_KEY env var is required. Get a free key at https://cricketdata.org/");
    const url = buildUrl(`${BASE}/${endpoint}`, { apikey: API_KEY, ...params });
    const json = await fetchJson(url) as Record<string, unknown>;
    if (json.status === "failure") {
      throw new Error(`CricketData API failure: ${JSON.stringify(json.info ?? json)}`);
    }
    // Strip echoed API key for security
    const { apikey: _key, ...safe } = json;
    return safe;
  }

  // 1. cricket_get_current_matches
  server.tool(
    "cricket_get_current_matches",
    "Get live and current cricket matches across all formats (Test, ODI, T20, IPL, BBL, etc.)",
    {
      offset: z.string().optional().describe("Pagination offset for results"),
    },
    async ({ offset }) => {
      try {
        const params: Record<string, string> = {};
        if (offset) params.offset = offset;
        const data = await callApi("currentMatches", params);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. cricket_get_match_info
  server.tool(
    "cricket_get_match_info",
    "Get detailed information about a specific cricket match",
    {
      match_id: z.string().describe("The unique match identifier"),
    },
    async ({ match_id }) => {
      try {
        const data = await callApi("match_info", { id: match_id });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. cricket_get_match_scorecard
  server.tool(
    "cricket_get_match_scorecard",
    "Get the full scorecard for a cricket match including batting and bowling details",
    {
      match_id: z.string().describe("The unique match identifier"),
    },
    async ({ match_id }) => {
      try {
        const data = await callApi("match_scorecard", { id: match_id });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. cricket_get_match_bbb
  server.tool(
    "cricket_get_match_bbb",
    "Get ball-by-ball commentary and data for a cricket match",
    {
      match_id: z.string().describe("The unique match identifier"),
    },
    async ({ match_id }) => {
      try {
        const data = await callApi("match_bbb", { id: match_id });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. cricket_get_series
  server.tool(
    "cricket_get_series",
    "List available cricket series and tournaments",
    {
      offset: z.string().optional().describe("Pagination offset for results"),
    },
    async ({ offset }) => {
      try {
        const params: Record<string, string> = {};
        if (offset) params.offset = offset;
        const data = await callApi("series", params);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. cricket_get_series_info
  server.tool(
    "cricket_get_series_info",
    "Get detailed information about a specific cricket series or tournament",
    {
      series_id: z.string().describe("The unique series identifier"),
    },
    async ({ series_id }) => {
      try {
        const data = await callApi("series_info", { id: series_id });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 7. cricket_get_players
  server.tool(
    "cricket_get_players",
    "Search for cricket players by name",
    {
      search: z.string().optional().describe("Player name to search for"),
      offset: z.string().optional().describe("Pagination offset for results"),
    },
    async ({ search, offset }) => {
      try {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (offset) params.offset = offset;
        const data = await callApi("players", params);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 8. cricket_get_player_info
  server.tool(
    "cricket_get_player_info",
    "Get detailed profile and statistics for a specific cricket player",
    {
      player_id: z.string().describe("The unique player identifier"),
    },
    async ({ player_id }) => {
      try {
        const data = await callApi("playerInfo", { id: player_id });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 9. cricket_get_countries
  server.tool(
    "cricket_get_countries",
    "List all cricket-playing countries recognized by CricketData",
    {},
    async () => {
      try {
        const data = await callApi("countries");
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 10. cricket_get_match_list
  server.tool(
    "cricket_get_match_list",
    "Get a list of upcoming and recent cricket matches",
    {
      offset: z.string().optional().describe("Pagination offset for results"),
    },
    async ({ offset }) => {
      try {
        const params: Record<string, string> = {};
        if (offset) params.offset = offset;
        const data = await callApi("matches", params);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
