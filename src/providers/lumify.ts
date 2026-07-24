import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, pathSegment, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Lumify provider — 14 tools
// Base: https://lumify.ai/v1
// Auth: Authorization: Bearer lmfy-...  (LUMIFY_API_KEY)
// Docs: https://lumify.ai/docs/guides   OpenAPI: https://lumify.ai/openapi.json
//
// Agent-ready sports intelligence: schedules, live scores, odds + line
// movement, public betting splits, and AI bet intelligence (confidence
// scores, signals, narratives) across MLB, NFL, NBA, NHL, NCAAF, NCAAB,
// tennis, and soccer. A free trial key is available at https://lumify.ai.
// ---------------------------------------------------------------------------

const BASE_URL = "https://lumify.ai/v1";

// Common query-param types reused across tools.
const LimitSchema = z
  .number()
  .int()
  .min(1)
  .max(100)
  .optional()
  .describe("Max results to return (default 25)");

const AfterIdSchema = z
  .number()
  .int()
  .optional()
  .describe("Pagination cursor: return records with id greater than this value");

const BookmakerSchema = z
  .string()
  .optional()
  .describe('Bookmaker filter (default "pinnacle"). Accepted: pinnacle, fanduel, draftkings, betmgm, caesars');

export function register(server: McpServer): void {
  const API_KEY = process.env.LUMIFY_API_KEY;

  async function callApi(
    path: string,
    params: Record<string, string | number | boolean | undefined> = {},
  ) {
    if (!API_KEY) {
      return errorResult("LUMIFY_API_KEY env var is required. Get a free trial key at https://lumify.ai");
    }
    try {
      const url = buildUrl(`${BASE_URL}${path}`, params);
      const data = await fetchJson(url, { headers: { Authorization: `Bearer ${API_KEY}` } });
      return toolResult(data);
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err));
    }
  }

  // 1. get_sports
  server.tool(
    "lumify_get_sports",
    "List sports and leagues Lumify covers (MLB, NFL, NBA, NHL, NCAAF, NCAAB, tennis, soccer). Returns the sport/league slugs used by other tools.",
    {
      active_only: z.boolean().optional().describe("Return only active sports (default true)"),
    },
    async ({ active_only }) => callApi("/sports", { active_only }),
  );

  // 2. get_seasons
  server.tool(
    "lumify_get_seasons",
    "List seasons, optionally filtered by sport. Returns season IDs usable as season_id in lumify_get_events.",
    {
      sport: z.string().optional().describe('Sport slug, e.g. "nfl", "nba", "mlb"'),
      current_only: z.boolean().optional().describe("Return only the current/active season(s)"),
    },
    async ({ sport, current_only }) => callApi("/seasons", { sport, current_only }),
  );

  // 3. get_events
  server.tool(
    "lumify_get_events",
    "List events (schedules, live, and completed). Filter by sport, league, status, and date range. Returns event IDs needed by the odds/score/splits/intelligence tools.",
    {
      sport: z.string().optional().describe('Sport slug: nfl, nba, mlb, nhl, tennis, soccer, ncaaf, ncaab'),
      league: z.string().optional().describe('League slug, e.g. "nba", "atp", "fifa_world_cup"'),
      status: z.string().optional().describe('Event status: scheduled | inprogress | final | postponed | canceled'),
      date: z.string().optional().describe("UTC date YYYY-MM-DD (single day)"),
      from: z.string().optional().describe("UTC start date YYYY-MM-DD"),
      to: z.string().optional().describe("UTC end date YYYY-MM-DD (inclusive)"),
      season_id: z.number().int().optional().describe("Filter by season ID (see lumify_get_seasons)"),
      team_id: z.number().int().optional().describe("Filter to events where this team participates (see lumify_get_teams)"),
      include_scores: z.boolean().optional().describe("Inline participants + scores in each event. Intended for small result sets (<= 20)"),
      has_recommend: z.boolean().optional().describe("Return only events with at least one recommended bet"),
      sort: z.enum(["time", "status"]).optional().describe('Sort order: "time" (chronological, default) or "status" (Live first)'),
      after_id: AfterIdSchema,
      limit: LimitSchema,
    },
    async (args) => callApi("/events", args),
  );

  // 4. get_event
  server.tool(
    "lumify_get_event",
    "Get a single event by ID, optionally inlining current odds and AI bet intelligence.",
    {
      event_id: z.number().int().describe("Lumify event ID (from lumify_get_events)"),
      include_odds: z.boolean().optional().describe("Inline current odds in the response"),
      include_intelligence: z.boolean().optional().describe("Inline AI bet intelligence in the response"),
      bookmaker: BookmakerSchema,
    },
    async ({ event_id, include_odds, include_intelligence, bookmaker }) =>
      callApi(`/events/${pathSegment(event_id)}`, { include_odds, include_intelligence, bookmaker }),
  );

  // 5. get_event_score
  server.tool(
    "lumify_get_event_score",
    "Get the current or final score for an event, including period/inning breakdown where available.",
    {
      event_id: z.number().int().describe("Lumify event ID"),
    },
    async ({ event_id }) => callApi(`/events/${pathSegment(event_id)}/score`),
  );

  // 6. get_event_odds
  server.tool(
    "lumify_get_event_odds",
    "Get current betting odds (moneyline, spread, total) for an event from the requested bookmaker.",
    {
      event_id: z.number().int().describe("Lumify event ID"),
      bookmaker: BookmakerSchema,
    },
    async ({ event_id, bookmaker }) => callApi(`/events/${pathSegment(event_id)}/odds`, { bookmaker }),
  );

  // 7. get_odds_history
  server.tool(
    "lumify_get_odds_history",
    "Get line-movement history for an event — how the odds have moved over time for the requested bookmaker.",
    {
      event_id: z.number().int().describe("Lumify event ID"),
      bookmaker: BookmakerSchema,
      limit: LimitSchema,
    },
    async ({ event_id, bookmaker, limit }) =>
      callApi(`/events/${pathSegment(event_id)}/odds/history`, { bookmaker, limit }),
  );

  // 8. get_betting_splits
  server.tool(
    "lumify_get_betting_splits",
    "Get public betting splits for an event — the share of bets and handle on each side (money vs. tickets).",
    {
      event_id: z.number().int().describe("Lumify event ID"),
    },
    async ({ event_id }) => callApi(`/events/${pathSegment(event_id)}/splits`),
  );

  // 9. get_bet_intelligence
  server.tool(
    "lumify_get_bet_intelligence",
    "Get Lumify AI bet intelligence for an event: confidence scores, detected signals, and a natural-language narrative explaining the recommendation.",
    {
      event_id: z.number().int().describe("Lumify event ID"),
      bookmaker: BookmakerSchema,
    },
    async ({ event_id, bookmaker }) => callApi(`/events/${pathSegment(event_id)}/intelligence`, { bookmaker }),
  );

  // 10. get_teams
  server.tool(
    "lumify_get_teams",
    "List or search teams. Filter by sport, league, conference, division, or country; search by name with q.",
    {
      sport: z.string().optional().describe('Sport slug, e.g. "nba" or "nhl"'),
      league: z.string().optional().describe('League slug, e.g. "nba"'),
      conference: z.string().optional().describe("Conference filter"),
      division: z.string().optional().describe("Division filter"),
      country: z.string().optional().describe('ISO 3166-1 alpha-3 country code, e.g. "USA"'),
      q: z.string().optional().describe("Team name search (partial match)"),
      active: z.boolean().optional().describe("Filter by active status"),
      after_id: AfterIdSchema,
      limit: LimitSchema,
    },
    async (args) => callApi("/teams", args),
  );

  // 11. get_team
  server.tool(
    "lumify_get_team",
    "Get a single team by ID.",
    {
      team_id: z.number().int().describe("Lumify team ID (from lumify_get_teams)"),
    },
    async ({ team_id }) => callApi(`/teams/${pathSegment(team_id)}`),
  );

  // 12. get_players
  server.tool(
    "lumify_get_players",
    "List or search players. Filter by sport, country, active/ranked status; search by name with q.",
    {
      sport: z.string().optional().describe('Sport slug, e.g. "tennis" or "mlb"'),
      q: z.string().optional().describe("Name search (partial match)"),
      country: z.string().optional().describe('ISO 3166-1 alpha-3 country code, e.g. "USA"'),
      active: z.boolean().optional().describe("Filter by active status"),
      ranked: z.boolean().optional().describe("If true, only players with a (tennis) ranking"),
      after_id: AfterIdSchema,
      limit: LimitSchema,
    },
    async (args) => callApi("/players", args),
  );

  // 13. get_player
  server.tool(
    "lumify_get_player",
    "Get a single player by ID.",
    {
      player_id: z.number().int().describe("Lumify player ID (from lumify_get_players)"),
    },
    async ({ player_id }) => callApi(`/players/${pathSegment(player_id)}`),
  );

  // 14. get_player_events
  server.tool(
    "lumify_get_player_events",
    "List a player's events (past and upcoming). Filter by status and date range.",
    {
      player_id: z.number().int().describe("Lumify player ID"),
      status: z.string().optional().describe('Event status: scheduled | inprogress | final'),
      from: z.string().optional().describe("UTC start date YYYY-MM-DD"),
      to: z.string().optional().describe("UTC end date YYYY-MM-DD (inclusive)"),
      after_id: AfterIdSchema,
      limit: LimitSchema,
    },
    async ({ player_id, status, from, to, after_id, limit }) =>
      callApi(`/players/${pathSegment(player_id)}/events`, { status, from, to, after_id, limit }),
  );
}
