import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Sports Game Odds provider — 10 tools
// Base: https://api.sportsgameodds.com/v2/
// Auth: x-api-key header
// ---------------------------------------------------------------------------

const BASE = "https://api.sportsgameodds.com/v2";

export function register(server: McpServer): void {
  function getKey(): string {
    const key = process.env.SPORTS_GAME_ODDS_KEY;
    if (!key) throw new Error("SPORTS_GAME_ODDS_KEY env var is required");
    return key;
  }

  function headers(): Record<string, string> {
    return { "x-api-key": getKey() };
  }

  // 1. sgo_get_leagues
  server.tool(
    "sgo_get_leagues",
    "List all available leagues from Sports Game Odds.",
    {},
    async () => {
      try {
        const data = await fetchJson(`${BASE}/leagues`, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. sgo_get_events
  server.tool(
    "sgo_get_events",
    "Get events with optional league, date, and status filters.",
    {
      league: z.string().optional().describe("Filter by league identifier"),
      date: z.string().optional().describe("Filter by date (YYYY-MM-DD)"),
      status: z.string().optional().describe("Filter by event status"),
    },
    async ({ league, date, status }) => {
      try {
        const url = buildUrl(`${BASE}/events`, { league, date, status });
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. sgo_get_event
  server.tool(
    "sgo_get_event",
    "Get details for a specific event by ID.",
    {
      event_id: z.string().describe("Event identifier"),
    },
    async ({ event_id }) => {
      try {
        const url = `${BASE}/events/${encodeURIComponent(event_id)}`;
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. sgo_get_odds
  server.tool(
    "sgo_get_odds",
    "Get odds for a specific event, optionally filtered by market type or bookmaker.",
    {
      event_id: z.string().describe("Event identifier"),
      market_type: z.string().optional().describe("Filter by market type"),
      bookmaker: z.string().optional().describe("Filter by bookmaker"),
    },
    async ({ event_id, market_type, bookmaker }) => {
      try {
        const url = buildUrl(`${BASE}/events/${encodeURIComponent(event_id)}/odds`, {
          market_type,
          bookmaker,
        });
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. sgo_get_player_props
  server.tool(
    "sgo_get_player_props",
    "Get player prop odds for a specific event.",
    {
      event_id: z.string().describe("Event identifier"),
    },
    async ({ event_id }) => {
      try {
        const url = `${BASE}/events/${encodeURIComponent(event_id)}/player-props`;
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. sgo_get_scores
  server.tool(
    "sgo_get_scores",
    "Get scores with optional league and date filters.",
    {
      league: z.string().optional().describe("Filter by league identifier"),
      date: z.string().optional().describe("Filter by date (YYYY-MM-DD)"),
    },
    async ({ league, date }) => {
      try {
        const url = buildUrl(`${BASE}/scores`, { league, date });
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 7. sgo_get_bookmakers
  server.tool(
    "sgo_get_bookmakers",
    "List all available bookmakers.",
    {},
    async () => {
      try {
        const data = await fetchJson(`${BASE}/bookmakers`, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 8. sgo_get_markets
  server.tool(
    "sgo_get_markets",
    "List available betting markets, optionally filtered by league.",
    {
      league: z.string().optional().describe("Filter by league identifier"),
    },
    async ({ league }) => {
      try {
        const url = buildUrl(`${BASE}/markets`, { league });
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 9. sgo_get_teams
  server.tool(
    "sgo_get_teams",
    "List teams, optionally filtered by league.",
    {
      league: z.string().optional().describe("Filter by league identifier"),
    },
    async ({ league }) => {
      try {
        const url = buildUrl(`${BASE}/teams`, { league });
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 10. sgo_get_standings
  server.tool(
    "sgo_get_standings",
    "Get league standings, optionally filtered by league and season.",
    {
      league: z.string().optional().describe("Filter by league identifier"),
      season: z.string().optional().describe("Season year filter"),
    },
    async ({ league, season }) => {
      try {
        const url = buildUrl(`${BASE}/standings`, { league, season });
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
