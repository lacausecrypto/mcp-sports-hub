import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buildUrl, errorResult, fetchJson, toolResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Squiggle (AFL — Australian Football League) — 6 tools
// Base: https://api.squiggle.com.au/
// Auth: none. Squiggle requires an honest User-Agent identifying the client;
//       our shared User-Agent (mcp-sports-hub/<version>) satisfies this.
// API uses semicolon-separated query params:
//   ?q=<resource>;year=YYYY;round=N;teamid=...
// ---------------------------------------------------------------------------

const BASE = "https://api.squiggle.com.au/";

// Squiggle uses semicolons as the query-param separator, not "&". URL.searchParams
// would join with "&" which the API tolerates, but we mirror the documented
// idiom for clarity and correctness.
function squiggleUrl(params: Record<string, string | number | undefined>): string {
  // buildUrl gives us "key=value" pairs already URL-encoded; we then swap
  // the separator. Easier than manually encoding.
  const url = buildUrl(BASE, params);
  return url.replace("&", ";").replace(/&/g, ";");
}

export function register(server: McpServer): void {
  // 1. squiggle_get_teams — all AFL teams (current and historic)
  server.tool(
    "squiggle_get_teams",
    "List all AFL teams in the Squiggle database (current and historic), with id, abbreviation, debut/retirement years, and logo path.",
    {},
    async () => {
      try {
        const data = await fetchJson(squiggleUrl({ q: "teams" }));
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. squiggle_get_games — fixtures and results, filterable
  server.tool(
    "squiggle_get_games",
    "Get AFL games with optional filters. Returns home/away teams, scores, completion status, venue, and time.",
    {
      year: z.number().int().min(1897).max(2099).optional().describe("Season year (e.g. 2024)"),
      round: z.number().int().positive().optional().describe("Round number"),
      team: z.number().int().positive().optional().describe("Team id (use squiggle_get_teams to list)"),
      complete: z
        .number()
        .int()
        .min(0)
        .max(100)
        .optional()
        .describe("Completion % filter (100 = finished games only)"),
    },
    async ({ year, round, team, complete }) => {
      try {
        const data = await fetchJson(
          squiggleUrl({ q: "games", year, round, teamid: team, complete }),
        );
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. squiggle_get_ladder — projected ladder by tipping model
  server.tool(
    "squiggle_get_ladder",
    "Get the projected AFL ladder for a given year and round, by prediction model. Each model gives its own projected wins / mean rank.",
    {
      year: z.number().int().min(2014).max(2099).describe("Season year"),
      round: z.number().int().positive().describe("Round number"),
      source: z.number().int().positive().optional().describe("Model source id (use squiggle_get_sources)"),
    },
    async ({ year, round, source }) => {
      try {
        const data = await fetchJson(squiggleUrl({ q: "ladder", year, round, source }));
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. squiggle_get_standings — actual ladder (wins, losses, percentage, points)
  server.tool(
    "squiggle_get_standings",
    "Get the actual AFL ladder/standings (wins, losses, draws, points, percentage) for a year and round.",
    {
      year: z.number().int().min(1897).max(2099).describe("Season year"),
      round: z.number().int().positive().optional().describe("Round number (defaults to current)"),
    },
    async ({ year, round }) => {
      try {
        const data = await fetchJson(squiggleUrl({ q: "standings", year, round }));
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. squiggle_get_tips — predictions / tips per game per source
  server.tool(
    "squiggle_get_tips",
    "Get game-level tips/predictions from one or all Squiggle prediction models. Each tip includes margin, confidence, and post-hoc correctness when known.",
    {
      year: z.number().int().min(2014).max(2099).optional().describe("Season year"),
      round: z.number().int().positive().optional().describe("Round number"),
      source: z.number().int().positive().optional().describe("Model source id"),
      game: z.number().int().positive().optional().describe("Specific game id"),
    },
    async ({ year, round, source, game }) => {
      try {
        const data = await fetchJson(
          squiggleUrl({ q: "tips", year, round, source, gameid: game }),
        );
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. squiggle_get_sources — list of prediction model sources
  server.tool(
    "squiggle_get_sources",
    "List the prediction model sources contributing to Squiggle (Squiggle, MoS, FiveThirtyEight, etc.). Use the returned ids with tips and ladder tools.",
    {},
    async () => {
      try {
        const data = await fetchJson(squiggleUrl({ q: "sources" }));
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
