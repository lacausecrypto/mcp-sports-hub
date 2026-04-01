import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

const BASE = "https://site.api.espn.com/apis/site/v2/sports";

function espnUrl(
  sport: string,
  league: string,
  endpoint: string,
  params?: Record<string, string | undefined>,
): string {
  return buildUrl(`${BASE}/${sport}/${league}/${endpoint}`, params);
}

// ---------------------------------------------------------------------------
// Shared Zod schemas
// ---------------------------------------------------------------------------

const SportParam = z
  .string()
  .describe(
    'Sport code, e.g. "football", "basketball", "baseball", "hockey", "soccer", "mma", "golf", "tennis", "racing"',
  );

const LeagueParam = z
  .string()
  .describe(
    'League code, e.g. "nfl", "nba", "mlb", "nhl", "wnba", "college-football", "mens-college-basketball", "eng.1", "usa.1", "ufc", "pga", "atp", "f1"',
  );

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

export function register(server: McpServer): void {
  // 1. get_scoreboard
  server.tool(
    "espn_get_scoreboard",
    "Get live or date-specific scores for a sport/league. Returns current scoreboard with game status, scores, and basic game info.",
    {
      sport: SportParam,
      league: LeagueParam,
      dates: z
        .string()
        .optional()
        .describe("Date filter in YYYYMMDD format (e.g. 20240115)"),
      limit: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Maximum number of events to return"),
    },
    async ({ sport, league, dates, limit }) => {
      try {
        const url = espnUrl(sport, league, "scoreboard", {
          dates,
          limit: limit?.toString(),
        });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. get_standings
  server.tool(
    "espn_get_standings",
    "Get league standings. Returns conference/division standings with team records, win/loss, and ranking info.",
    {
      sport: SportParam,
      league: LeagueParam,
      season: z
        .string()
        .optional()
        .describe('Season year (e.g. "2024")'),
      group: z
        .string()
        .optional()
        .describe("Group, conference, or division filter ID"),
    },
    async ({ sport, league, season, group }) => {
      try {
        const url = espnUrl(sport, league, "standings", { season, group });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. get_teams
  server.tool(
    "espn_get_teams",
    "List all teams in a league. Returns team names, IDs, abbreviations, logos, and locations.",
    {
      sport: SportParam,
      league: LeagueParam,
      limit: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Maximum number of teams to return"),
    },
    async ({ sport, league, limit }) => {
      try {
        const url = espnUrl(sport, league, "teams", {
          limit: limit?.toString(),
        });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. get_team_details
  server.tool(
    "espn_get_team_details",
    "Get detailed information about a specific team, including record, stats, venue, and next event.",
    {
      sport: SportParam,
      league: LeagueParam,
      team_id: z.string().describe("ESPN team ID"),
    },
    async ({ sport, league, team_id }) => {
      try {
        const url = espnUrl(sport, league, `teams/${team_id}`, {});
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. get_team_roster
  server.tool(
    "espn_get_team_roster",
    "Get the full roster for a specific team, including player names, positions, jersey numbers, and basic stats.",
    {
      sport: SportParam,
      league: LeagueParam,
      team_id: z.string().describe("ESPN team ID"),
    },
    async ({ sport, league, team_id }) => {
      try {
        const url = espnUrl(sport, league, `teams/${team_id}/roster`, {});
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. get_team_schedule
  server.tool(
    "espn_get_team_schedule",
    "Get a team's schedule for a season, including past results and upcoming games.",
    {
      sport: SportParam,
      league: LeagueParam,
      team_id: z.string().describe("ESPN team ID"),
      season: z
        .string()
        .optional()
        .describe('Season year (e.g. "2024")'),
    },
    async ({ sport, league, team_id, season }) => {
      try {
        const url = espnUrl(sport, league, `teams/${team_id}/schedule`, {
          season,
        });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 7. get_event_summary
  server.tool(
    "espn_get_event_summary",
    "Get a detailed summary of a specific event/game, including play-by-play, box score, leaders, and game info.",
    {
      sport: SportParam,
      league: LeagueParam,
      event_id: z.string().describe("ESPN event ID"),
    },
    async ({ sport, league, event_id }) => {
      try {
        const url = espnUrl(sport, league, "summary", { event: event_id });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 8. get_athlete
  server.tool(
    "espn_get_athlete",
    "Get information about a specific athlete, including bio, stats, and career history.",
    {
      sport: SportParam,
      league: LeagueParam,
      athlete_id: z.string().describe("ESPN athlete ID"),
    },
    async ({ sport, league, athlete_id }) => {
      try {
        const url = espnUrl(sport, league, `athletes/${athlete_id}`, {});
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 9. get_news
  server.tool(
    "espn_get_news",
    "Get the latest news articles for a sport/league, including headlines, descriptions, and links.",
    {
      sport: SportParam,
      league: LeagueParam,
      limit: z
        .number()
        .int()
        .positive()
        .optional()
        .describe("Maximum number of articles to return"),
    },
    async ({ sport, league, limit }) => {
      try {
        const url = espnUrl(sport, league, "news", {
          limit: limit?.toString(),
        });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 10. get_seasons
  server.tool(
    "espn_get_seasons",
    "Get available seasons for a sport/league, including season types (preseason, regular, postseason) and date ranges.",
    {
      sport: SportParam,
      league: LeagueParam,
    },
    async ({ sport, league }) => {
      try {
        const url = espnUrl(sport, league, "seasons", {});
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
