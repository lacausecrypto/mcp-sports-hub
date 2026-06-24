import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buildUrl, fetchJson, pathSegment, safe, toolResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Highlightly (unified multi-sport API) — 6 tools
// Base: https://sports.highlightly.net/{sport}/{endpoint}
// Auth: x-rapidapi-key header (env HIGHLIGHTLY_API_KEY). Free Basic = 100/day,
//   no credit card. Net-new value vs other providers: verified VIDEO HIGHLIGHTS
//   clips + pre-match predictions + aggregated odds from 100+ bookmakers.
// ---------------------------------------------------------------------------

const BASE = "https://sports.highlightly.net";

const sport = z
  .enum(["football", "basketball", "hockey", "baseball", "american-football", "cricket", "rugby", "handball", "volleyball"])
  .describe('Sport (e.g. "football" = soccer, "basketball", "hockey", ...)');

export function register(server: McpServer): void {
  const KEY = process.env.HIGHLIGHTLY_API_KEY;

  function headers(): Record<string, string> {
    if (!KEY) {
      throw new Error(
        "HIGHLIGHTLY_API_KEY env var is required. Get a free key (100 req/day, no credit card) at https://highlightly.net/.",
      );
    }
    return { "x-rapidapi-key": KEY };
  }

  const get = (sportPath: string, endpoint: string, params?: Record<string, string | number | undefined>) =>
    fetchJson(buildUrl(`${BASE}/${pathSegment(sportPath)}/${endpoint}`, params), { headers: headers() });

  // 1. leagues
  server.tool(
    "highlightly_get_leagues",
    "List leagues/competitions for a sport, optionally filtered by country or season.",
    {
      sport,
      country: z.string().optional().describe("Filter by country name"),
      season: z.number().int().optional().describe("Filter by season year"),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.number().int().min(0).optional(),
    },
    safe(async ({ sport, country, season, limit, offset }) =>
      toolResult(await get(sport, "leagues", { countryName: country, season, limit, offset })),
    ),
  );

  // 2. matches
  server.tool(
    "highlightly_get_matches",
    "Get matches/fixtures for a sport, filtered by date, league or season.",
    {
      sport,
      date: z.string().optional().describe("Date YYYY-MM-DD"),
      league_id: z.number().int().optional().describe("League id (from highlightly_get_leagues)"),
      season: z.number().int().optional().describe("Season year"),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.number().int().min(0).optional(),
    },
    safe(async ({ sport, date, league_id, season, limit, offset }) =>
      toolResult(await get(sport, "matches", { date, leagueId: league_id, season, limit, offset })),
    ),
  );

  // 3. standings
  server.tool(
    "highlightly_get_standings",
    "Get league standings/table for a sport. Requires a league id and season.",
    {
      sport,
      league_id: z.number().int().describe("League id (from highlightly_get_leagues)"),
      season: z.number().int().describe("Season year"),
    },
    safe(async ({ sport, league_id, season }) =>
      toolResult(await get(sport, "standings", { leagueId: league_id, season })),
    ),
  );

  // 4. highlights — video clips (the distinctive feature)
  server.tool(
    "highlightly_get_highlights",
    "Get video highlight clips for a sport, filtered by league or a specific match.",
    {
      sport,
      league_id: z.number().int().optional().describe("League id"),
      match_id: z.number().int().optional().describe("Match id (from highlightly_get_matches)"),
      season: z.number().int().optional().describe("Season year"),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.number().int().min(0).optional(),
    },
    safe(async ({ sport, league_id, match_id, season, limit, offset }) =>
      toolResult(await get(sport, "highlights", { leagueId: league_id, matchId: match_id, season, limit, offset })),
    ),
  );

  // 5. odds — aggregated bookmaker odds
  server.tool(
    "highlightly_get_odds",
    "Get pre-match/live odds aggregated from 100+ bookmakers for a sport, by match or league.",
    {
      sport,
      match_id: z.number().int().optional().describe("Match id"),
      league_id: z.number().int().optional().describe("League id"),
    },
    safe(async ({ sport, match_id, league_id }) =>
      toolResult(await get(sport, "odds", { matchId: match_id, leagueId: league_id })),
    ),
  );

  // 6. head-to-head
  server.tool(
    "highlightly_get_head_to_head",
    "Get head-to-head history between two teams for a sport.",
    {
      sport,
      team_id_1: z.number().int().describe("First team id"),
      team_id_2: z.number().int().describe("Second team id"),
    },
    safe(async ({ sport, team_id_1, team_id_2 }) =>
      toolResult(await get(sport, "head-2-head", { teamIdOne: team_id_1, teamIdTwo: team_id_2 })),
    ),
  );
}
