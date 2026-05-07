import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buildUrl, errorResult, fetchJson, toolResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// SportSRC provider — 7 tools (V1 only — V2 endpoints require a paid key
// and a different host scheme; we left them out until that's documented).
//
// Base: https://api.sportsrc.org/
// Auth: none (free tier). SPORTSRC_API_KEY is reserved but not required for
//       any of the V1 endpoints below.
//
// Real contract (verified May 2026):
//   ?data=sports
//   ?data=matches&category=<sport>
//   ?data=detail&id=<match_id>&category=<sport>
//   ?data=results&category=leagues
//   ?data=results&category=scores&league=<league_id>
//   ?data=results&category=tables&league=<league_id>
// ---------------------------------------------------------------------------

const BASE = "https://api.sportsrc.org/";

const SportParam = z
  .string()
  .describe('Sport id (use sportsrc_get_sports to list). E.g. "football", "basketball", "mma".');

const LeagueIdParam = z
  .string()
  .describe('League id (use sportsrc_get_leagues to list). E.g. "PL", "CL", "BL1".');

export function register(server: McpServer): void {
  async function call(params: Record<string, string | number | undefined>) {
    const url = buildUrl(BASE, params);
    return fetchJson(url);
  }

  // 1. sports list
  server.tool(
    "sportsrc_get_sports",
    "List sport categories supported by SportSRC. Returns ids you can pass to other tools.",
    {},
    async () => {
      try {
        const data = await call({ data: "sports" });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. matches by sport
  server.tool(
    "sportsrc_get_matches",
    "List matches for a sport. Returns live, upcoming, and recently finished matches with team info.",
    {
      category: SportParam,
    },
    async ({ category }) => {
      try {
        const data = await call({ data: "matches", category });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. match detail
  server.tool(
    "sportsrc_get_match",
    "Get detailed match information including streams, venue, and lineups.",
    {
      match_id: z.string().describe("Match id (from sportsrc_get_matches results)"),
      category: SportParam,
    },
    async ({ match_id, category }) => {
      try {
        const data = await call({ data: "detail", id: match_id, category });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. leagues list (football only — sportsrc /results/leagues is football-scoped)
  server.tool(
    "sportsrc_get_leagues",
    "List football leagues/competitions supported by SportSRC. Returns league ids you can pass to scores and tables tools.",
    {},
    async () => {
      try {
        const data = await call({ data: "results", category: "leagues" });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. league scores (results) for a specific league
  server.tool(
    "sportsrc_get_league_scores",
    "Get scores / recent results for a specific football league.",
    {
      league: LeagueIdParam,
    },
    async ({ league }) => {
      try {
        const data = await call({ data: "results", category: "scores", league });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. league table (standings) for a specific league
  server.tool(
    "sportsrc_get_table",
    "Get the standings table for a specific football league.",
    {
      league: LeagueIdParam,
    },
    async ({ league }) => {
      try {
        const data = await call({ data: "results", category: "tables", league });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 7. live matches across a sport (matches, filtered client-side; SportSRC has
  // no separate /live endpoint in V1 — return matches and let the LLM filter
  // by status field).
  server.tool(
    "sportsrc_get_live",
    "Convenience: get the matches feed for a sport. Filter the returned `data` array client-side by `status` for live games.",
    {
      category: SportParam,
    },
    async ({ category }) => {
      try {
        const data = await call({ data: "matches", category });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
