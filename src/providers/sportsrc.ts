import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// SportSRC provider — 10 tools
// V1 Base: https://api.sportsrc.org/v1/
// V2 Base: https://api.sportsrc.org/v2/
// Auth: api_key query param (optional V1, required V2)
// ---------------------------------------------------------------------------

export function register(server: McpServer): void {
  const BASE_V1 = "https://api.sportsrc.org/v1";
  const BASE_V2 = "https://api.sportsrc.org/v2";

  function getApiKey(): string | undefined {
    return process.env.SPORTSRC_API_KEY || undefined;
  }

  /** Build a V1 URL with optional api_key. */
  function v1Url(
    path: string,
    params?: Record<string, string | undefined>,
  ): string {
    const apiKey = getApiKey();
    return buildUrl(`${BASE_V1}${path}`, { ...params, api_key: apiKey });
  }

  /** Build a V2 URL — requires api_key. Throws if missing. */
  function v2Url(
    path: string,
    params?: Record<string, string | undefined>,
  ): string {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error(
        "SPORTSRC_API_KEY environment variable is required for V2 endpoints. " +
          "Get a free key at https://sportsrc.org/",
      );
    }
    return buildUrl(`${BASE_V2}${path}`, { ...params, api_key: apiKey });
  }

  // Shared param
  const SportParam = z
    .enum(["football", "basketball", "mma"])
    .optional()
    .describe('Sport filter: "football", "basketball", or "mma"');

  // 1. sportsrc_get_matches
  server.tool(
    "sportsrc_get_matches",
    "Get today's matches or matches for a specific date from SportSRC. Supports filtering by sport and league.",
    {
      sport: SportParam,
      date: z
        .string()
        .optional()
        .describe('Date in YYYY-MM-DD format (e.g. "2024-06-15"). Defaults to today.'),
      league: z
        .string()
        .optional()
        .describe('League identifier to filter by (e.g. "premier-league", "nba", "ufc")'),
    },
    async ({ sport, date, league }) => {
      try {
        const url = v1Url("/matches", { sport, date, league });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. sportsrc_get_match
  server.tool(
    "sportsrc_get_match",
    "Get detailed information about a specific match from SportSRC, including status, score, teams, and events.",
    {
      match_id: z.string().describe("Match ID"),
    },
    async ({ match_id }) => {
      try {
        const url = v1Url(`/matches/${encodeURIComponent(match_id)}`);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. sportsrc_get_live_scores
  server.tool(
    "sportsrc_get_live_scores",
    "Get live scores from SportSRC for matches currently in progress. Optionally filter by sport.",
    {
      sport: SportParam,
    },
    async ({ sport }) => {
      try {
        const url = v1Url("/live", { sport });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. sportsrc_get_leagues
  server.tool(
    "sportsrc_get_leagues",
    "List available leagues and competitions from SportSRC. Optionally filter by sport.",
    {
      sport: SportParam,
    },
    async ({ sport }) => {
      try {
        const url = v1Url("/leagues", { sport });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. sportsrc_get_standings
  server.tool(
    "sportsrc_get_standings",
    "Get league standings/table from SportSRC with points, wins, losses, and goal difference.",
    {
      league_id: z.string().describe("League ID (from sportsrc_get_leagues)"),
      season: z
        .string()
        .optional()
        .describe('Season identifier (e.g. "2024", "2023-2024"). Defaults to current season.'),
    },
    async ({ league_id, season }) => {
      try {
        const url = v1Url("/standings", { league_id, season });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. sportsrc_get_xg_stats (V2)
  server.tool(
    "sportsrc_get_xg_stats",
    "Get expected goals (xG) statistics for a match from SportSRC V2. Includes per-shot xG, cumulative xG, and xG timeline. Requires SPORTSRC_API_KEY.",
    {
      match_id: z.string().describe("Match ID"),
    },
    async ({ match_id }) => {
      try {
        const url = v2Url(`/matches/${encodeURIComponent(match_id)}/xg`);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 7. sportsrc_get_odds (V2)
  server.tool(
    "sportsrc_get_odds",
    "Get betting odds for a match from SportSRC V2. Includes pre-match and live odds from multiple bookmakers. Requires SPORTSRC_API_KEY.",
    {
      match_id: z.string().describe("Match ID"),
    },
    async ({ match_id }) => {
      try {
        const url = v2Url(`/matches/${encodeURIComponent(match_id)}/odds`);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 8. sportsrc_get_lineups (V2)
  server.tool(
    "sportsrc_get_lineups",
    "Get match lineups from SportSRC V2 including starting XI, substitutes, formations, and player positions. Requires SPORTSRC_API_KEY.",
    {
      match_id: z.string().describe("Match ID"),
    },
    async ({ match_id }) => {
      try {
        const url = v2Url(`/matches/${encodeURIComponent(match_id)}/lineups`);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 9. sportsrc_get_momentum (V2)
  server.tool(
    "sportsrc_get_momentum",
    "Get momentum graph data from SportSRC V2. Shows minute-by-minute momentum shifts and pressure periods. Requires SPORTSRC_API_KEY.",
    {
      match_id: z.string().describe("Match ID"),
    },
    async ({ match_id }) => {
      try {
        const url = v2Url(`/matches/${encodeURIComponent(match_id)}/momentum`);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 10. sportsrc_get_schedule
  server.tool(
    "sportsrc_get_schedule",
    "Get upcoming match schedule from SportSRC. Optionally filter by sport and number of days ahead.",
    {
      sport: SportParam,
      days_ahead: z
        .number()
        .int()
        .min(1)
        .max(30)
        .optional()
        .describe("Number of days ahead to look (1-30)"),
    },
    async ({ sport, days_ahead }) => {
      try {
        const url = v1Url("/schedule", {
          sport,
          days_ahead: days_ahead?.toString(),
        });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
