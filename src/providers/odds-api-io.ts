import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Odds API IO provider — 10 tools
// Base: https://api.odds-api.io/v1/
// Auth: X-Api-Key header
// ---------------------------------------------------------------------------

const BASE = "https://api.odds-api.io/v1";

export function register(server: McpServer): void {
  function getKey(): string {
    const key = process.env.ODDS_API_IO_KEY;
    if (!key) throw new Error("ODDS_API_IO_KEY env var is required");
    return key;
  }

  function headers(): Record<string, string> {
    return { "X-Api-Key": getKey() };
  }

  // 1. oddsio_get_sports
  server.tool(
    "oddsio_get_sports",
    "List all available sports from Odds API IO.",
    {},
    async () => {
      try {
        const data = await fetchJson(`${BASE}/sports`, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. oddsio_get_leagues
  server.tool(
    "oddsio_get_leagues",
    "List leagues for a given sport.",
    {
      sport_id: z.string().describe("Sport identifier"),
    },
    async ({ sport_id }) => {
      try {
        const url = `${BASE}/sports/${encodeURIComponent(sport_id)}/leagues`;
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. oddsio_get_events
  server.tool(
    "oddsio_get_events",
    "Get events, optionally filtered by sport, league, or date.",
    {
      sport_id: z.string().optional().describe("Filter by sport ID"),
      league_id: z.string().optional().describe("Filter by league ID"),
      date: z.string().optional().describe("Filter by date (YYYY-MM-DD)"),
    },
    async ({ sport_id, league_id, date }) => {
      try {
        const url = buildUrl(`${BASE}/events`, { sport_id, league_id, date });
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. oddsio_get_event
  server.tool(
    "oddsio_get_event",
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

  // 5. oddsio_get_odds
  server.tool(
    "oddsio_get_odds",
    "Get odds for a specific event, optionally filtered by market.",
    {
      event_id: z.string().describe("Event identifier"),
      market: z.string().optional().describe("Market type filter"),
    },
    async ({ event_id, market }) => {
      try {
        const url = buildUrl(`${BASE}/events/${encodeURIComponent(event_id)}/odds`, { market });
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. oddsio_get_prematch_odds
  server.tool(
    "oddsio_get_prematch_odds",
    "Get pre-match odds, optionally filtered by sport, league, or bookmaker.",
    {
      sport_id: z.string().optional().describe("Filter by sport ID"),
      league_id: z.string().optional().describe("Filter by league ID"),
      bookmaker: z.string().optional().describe("Filter by bookmaker"),
    },
    async ({ sport_id, league_id, bookmaker }) => {
      try {
        const url = buildUrl(`${BASE}/odds/prematch`, { sport_id, league_id, bookmaker });
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 7. oddsio_get_live_odds
  server.tool(
    "oddsio_get_live_odds",
    "Get live in-play odds, optionally filtered by sport.",
    {
      sport_id: z.string().optional().describe("Filter by sport ID"),
    },
    async ({ sport_id }) => {
      try {
        const url = buildUrl(`${BASE}/odds/live`, { sport_id });
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 8. oddsio_get_value_bets
  server.tool(
    "oddsio_get_value_bets",
    "Find value bets where bookmaker odds exceed estimated probability.",
    {
      sport_id: z.string().optional().describe("Filter by sport ID"),
    },
    async ({ sport_id }) => {
      try {
        const url = buildUrl(`${BASE}/value-bets`, { sport_id });
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 9. oddsio_get_arbitrage
  server.tool(
    "oddsio_get_arbitrage",
    "Find arbitrage opportunities across bookmakers.",
    {
      sport_id: z.string().optional().describe("Filter by sport ID"),
    },
    async ({ sport_id }) => {
      try {
        const url = buildUrl(`${BASE}/arbitrage`, { sport_id });
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 10. oddsio_get_bookmakers
  server.tool(
    "oddsio_get_bookmakers",
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
}
