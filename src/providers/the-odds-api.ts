import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// The Odds API provider — 9 tools
// Base: https://api.the-odds-api.com/v4/
// Auth: apiKey query param
// ---------------------------------------------------------------------------

export function register(server: McpServer): void {
  const API_KEY = process.env.THE_ODDS_API_KEY;
  const BASE = "https://api.the-odds-api.com/v4";

  // Usage tracking (mirrors original)
  let lastUsage = { requestsRemaining: "unknown", requestsUsed: "unknown" };

  async function apiRequest(path: string, params: Record<string, string | undefined> = {}) {
    if (!API_KEY) throw new Error("THE_ODDS_API_KEY env var is required. Get a free key at https://the-odds-api.com/");

    const url = buildUrl(`${BASE}${path}`, { apiKey: API_KEY, ...params });

    // Use raw fetch for usage header tracking, but with timeout
    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "mcp-sports-hub/1.1.0" },
      signal: AbortSignal.timeout(15_000),
    });

    // Extract usage from headers
    lastUsage = {
      requestsRemaining: response.headers.get("x-requests-remaining") ?? "unknown",
      requestsUsed: response.headers.get("x-requests-used") ?? "unknown",
    };

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`API error ${response.status}: ${body}`);
    }

    return response.json();
  }

  function formatUsage(): string {
    const parts: string[] = [];
    if (lastUsage.requestsUsed !== "unknown") parts.push(`Requests used: ${lastUsage.requestsUsed}`);
    if (lastUsage.requestsRemaining !== "unknown") parts.push(`Requests remaining: ${lastUsage.requestsRemaining}`);
    return parts.length > 0 ? `\n\n---\nAPI Usage: ${parts.join(" | ")}` : "";
  }

  function oddsResult(data: unknown) {
    return {
      content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) + formatUsage() }],
    };
  }

  // 1. odds_get_sports
  server.tool(
    "odds_get_sports",
    "List all available sports and tournaments from The Odds API (70+ sports). Returns sport keys needed for other tools.",
    {},
    async () => {
      try {
        const data = await apiRequest("/sports");
        return oddsResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. odds_get_odds
  server.tool(
    "odds_get_odds",
    "Get pre-match and live odds for a sport. Returns odds from 40+ bookmakers with moneylines, spreads, and totals.",
    {
      sport_key: z.string().describe('Sport key, e.g. "americanfootball_nfl", "basketball_nba", "soccer_epl"'),
      regions: z.string().describe('Comma-separated regions: us, eu, uk, au. E.g. "us" or "us,eu"'),
      markets: z.string().optional().describe('Comma-separated markets: h2h, spreads, totals. Default: "h2h"'),
      oddsFormat: z.enum(["american", "decimal"]).optional().describe('Odds format: "american" or "decimal". Default: "decimal"'),
      bookmakers: z.string().optional().describe('Comma-separated bookmaker keys to filter, e.g. "draftkings,fanduel"'),
    },
    async ({ sport_key, regions, markets, oddsFormat, bookmakers }) => {
      try {
        const data = await apiRequest(`/sports/${encodeURIComponent(sport_key)}/odds`, {
          regions, markets, oddsFormat, bookmakers,
        });
        return oddsResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. odds_get_event_odds
  server.tool(
    "odds_get_event_odds",
    "Get odds for a specific event by event ID. Use get_events or get_odds first to find event IDs.",
    {
      sport_key: z.string().describe("Sport key"),
      event_id: z.string().describe("Event ID from get_events or get_odds"),
      regions: z.string().describe("Comma-separated regions: us, eu, uk, au"),
      markets: z.string().optional().describe('Comma-separated markets: h2h, spreads, totals. Default: "h2h"'),
      oddsFormat: z.enum(["american", "decimal"]).optional().describe('Odds format. Default: "decimal"'),
    },
    async ({ sport_key, event_id, regions, markets, oddsFormat }) => {
      try {
        const data = await apiRequest(
          `/sports/${encodeURIComponent(sport_key)}/events/${encodeURIComponent(event_id)}/odds`,
          { regions, markets, oddsFormat },
        );
        return oddsResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. odds_get_scores
  server.tool(
    "odds_get_scores",
    "Get live and recently completed scores for a sport. Use daysFrom to include recently completed games.",
    {
      sport_key: z.string().describe("Sport key"),
      daysFrom: z.number().int().min(1).max(3).optional().describe("Number of days in the past to include completed games (1-3)"),
    },
    async ({ sport_key, daysFrom }) => {
      try {
        const data = await apiRequest(`/sports/${encodeURIComponent(sport_key)}/scores`, {
          daysFrom: daysFrom?.toString(),
        });
        return oddsResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. odds_get_events
  server.tool(
    "odds_get_events",
    "Get upcoming and live events for a sport. Returns event IDs needed for get_event_odds and get_player_props.",
    {
      sport_key: z.string().describe("Sport key"),
      dateFormat: z.string().optional().describe('Date format: "iso" (default) or "unix"'),
    },
    async ({ sport_key, dateFormat }) => {
      try {
        const data = await apiRequest(`/sports/${encodeURIComponent(sport_key)}/events`, {
          dateFormat,
        });
        return oddsResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. odds_get_historical_odds
  server.tool(
    "odds_get_historical_odds",
    "Get historical odds for a sport at a specific point in time. Useful for backtesting and analysis.",
    {
      sport_key: z.string().describe("Sport key"),
      regions: z.string().describe("Comma-separated regions: us, eu, uk, au"),
      date: z.string().describe('ISO 8601 date string, e.g. "2024-01-15T12:00:00Z"'),
      markets: z.string().optional().describe("Comma-separated markets: h2h, spreads, totals"),
      oddsFormat: z.enum(["american", "decimal"]).optional().describe('Odds format. Default: "decimal"'),
    },
    async ({ sport_key, regions, date, markets, oddsFormat }) => {
      try {
        const data = await apiRequest(`/historical/sports/${encodeURIComponent(sport_key)}/odds`, {
          regions, date, markets, oddsFormat,
        });
        return oddsResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 7. odds_get_historical_events
  server.tool(
    "odds_get_historical_events",
    "Get historical events for a sport at a specific date. Returns events that were available at that point in time.",
    {
      sport_key: z.string().describe("Sport key"),
      date: z.string().describe('ISO 8601 date string, e.g. "2024-01-15T12:00:00Z"'),
    },
    async ({ sport_key, date }) => {
      try {
        const data = await apiRequest(`/historical/sports/${encodeURIComponent(sport_key)}/events`, {
          date,
        });
        return oddsResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 8. odds_get_player_props
  server.tool(
    "odds_get_player_props",
    "Get player prop odds for a specific event. Markets include player_points, player_rebounds, player_assists, player_threes, etc.",
    {
      sport_key: z.string().describe("Sport key"),
      event_id: z.string().describe("Event ID from get_events"),
      regions: z.string().describe("Comma-separated regions: us, eu, uk, au"),
      markets: z.string().describe('Comma-separated player prop markets, e.g. "player_points,player_rebounds,player_assists"'),
      oddsFormat: z.enum(["american", "decimal"]).optional().describe('Odds format. Default: "decimal"'),
    },
    async ({ sport_key, event_id, regions, markets, oddsFormat }) => {
      try {
        const data = await apiRequest(
          `/sports/${encodeURIComponent(sport_key)}/events/${encodeURIComponent(event_id)}/odds`,
          { regions, markets, oddsFormat },
        );
        return oddsResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 9. odds_check_usage
  server.tool(
    "odds_check_usage",
    "Check your API usage (requests used and remaining). Makes a lightweight call to the sports endpoint to read usage headers.",
    {},
    async () => {
      try {
        await apiRequest("/sports");
        const text =
          `API Usage Report\n` +
          `================\n` +
          `Requests used:      ${lastUsage.requestsUsed}\n` +
          `Requests remaining: ${lastUsage.requestsRemaining}\n` +
          `Monthly limit:      500 (free tier)`;
        return { content: [{ type: "text" as const, text }] };
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
