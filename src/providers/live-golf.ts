import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Live Golf API provider — 8 tools
// Base: https://api.livegolfapi.com/v1/
// Auth: x-api-key header
// ---------------------------------------------------------------------------

const BASE = "https://api.livegolfapi.com/v1";

export function register(server: McpServer): void {
  function getKey(): string {
    const key = process.env.LIVE_GOLF_API_KEY;
    if (!key) throw new Error("LIVE_GOLF_API_KEY env var is required");
    return key;
  }

  function headers(): Record<string, string> {
    return { "x-api-key": getKey() };
  }

  // 1. livegolf_get_tournaments
  server.tool(
    "livegolf_get_tournaments",
    "List golf tournaments, optionally filtered by tour or season.",
    {
      tour: z.string().optional().describe("Tour filter (e.g. pga, european)"),
      season: z.string().optional().describe("Season year filter"),
    },
    async ({ tour, season }) => {
      try {
        const url = buildUrl(`${BASE}/tournaments`, { tour, season });
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. livegolf_get_tournament
  server.tool(
    "livegolf_get_tournament",
    "Get details for a specific golf tournament.",
    {
      tournament_id: z.string().describe("Tournament identifier"),
    },
    async ({ tournament_id }) => {
      try {
        const url = `${BASE}/tournaments/${encodeURIComponent(tournament_id)}`;
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. livegolf_get_leaderboard
  server.tool(
    "livegolf_get_leaderboard",
    "Get the live or final leaderboard for a tournament.",
    {
      tournament_id: z.string().describe("Tournament identifier"),
    },
    async ({ tournament_id }) => {
      try {
        const url = `${BASE}/tournaments/${encodeURIComponent(tournament_id)}/leaderboard`;
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. livegolf_get_players
  server.tool(
    "livegolf_get_players",
    "Search or list golf players.",
    {
      search: z.string().optional().describe("Search by player name"),
      tour: z.string().optional().describe("Filter by tour"),
    },
    async ({ search, tour }) => {
      try {
        const url = buildUrl(`${BASE}/players`, { search, tour });
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. livegolf_get_player
  server.tool(
    "livegolf_get_player",
    "Get detailed info for a specific golf player.",
    {
      player_id: z.string().describe("Player identifier"),
    },
    async ({ player_id }) => {
      try {
        const url = `${BASE}/players/${encodeURIComponent(player_id)}`;
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. livegolf_get_player_stats
  server.tool(
    "livegolf_get_player_stats",
    "Get statistics for a specific golf player, optionally for a given season.",
    {
      player_id: z.string().describe("Player identifier"),
      season: z.string().optional().describe("Season year filter"),
    },
    async ({ player_id, season }) => {
      try {
        const url = buildUrl(`${BASE}/players/${encodeURIComponent(player_id)}/stats`, { season });
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 7. livegolf_get_rankings
  server.tool(
    "livegolf_get_rankings",
    "Get golf world rankings, optionally filtered by tour with pagination.",
    {
      tour: z.string().optional().describe("Filter by tour"),
      page: z.number().optional().describe("Page number for pagination"),
    },
    async ({ tour, page }) => {
      try {
        const url = buildUrl(`${BASE}/rankings`, { tour, page });
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 8. livegolf_get_schedule
  server.tool(
    "livegolf_get_schedule",
    "Get the tournament schedule for a tour and/or season.",
    {
      tour: z.string().optional().describe("Filter by tour"),
      season: z.string().optional().describe("Season year filter"),
    },
    async ({ tour, season }) => {
      try {
        const url = buildUrl(`${BASE}/schedule`, { tour, season });
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
