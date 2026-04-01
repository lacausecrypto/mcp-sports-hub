import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

const BASE = "https://statsapi.mlb.com/api/v1";

function mlbUrl(endpoint: string, params?: Record<string, string | number | undefined>): string {
  return buildUrl(`${BASE}/${endpoint}`, params);
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

export function register(server: McpServer): void {
  // 1. get_schedule
  server.tool(
    "mlb_get_schedule",
    "Get the MLB game schedule for a date or date range. Returns games with scores, status, and teams.",
    {
      date: z.string().optional().describe("Single date in YYYY-MM-DD format (e.g. 2024-04-15)"),
      startDate: z.string().optional().describe("Range start date YYYY-MM-DD"),
      endDate: z.string().optional().describe("Range end date YYYY-MM-DD"),
      teamId: z.number().optional().describe("Filter by team ID"),
      sportId: z.number().default(1).describe("Sport ID (1=MLB, 11=AAA, 12=AA, 13=A, 14=A-short)"),
    },
    async ({ date, startDate, endDate, teamId, sportId }) => {
      try {
        const url = mlbUrl("schedule", {
          date,
          startDate,
          endDate,
          teamId: teamId?.toString(),
          sportId: sportId.toString(),
          hydrate: "team,linescore",
        });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. get_game
  server.tool(
    "mlb_get_game",
    "Get detailed game data from the live feed including plays, box score, and line score.",
    {
      game_pk: z.number().describe("The unique game ID (gamePk)"),
    },
    async ({ game_pk }) => {
      try {
        const data = await fetchJson(`${BASE}/game/${game_pk}/feed/live`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. get_game_play_by_play
  server.tool(
    "mlb_get_game_play_by_play",
    "Get play-by-play data for a specific game including all at-bats and pitches.",
    {
      game_pk: z.number().describe("The unique game ID (gamePk)"),
    },
    async ({ game_pk }) => {
      try {
        const data = await fetchJson(`${BASE}/game/${game_pk}/playByPlay`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. get_game_boxscore
  server.tool(
    "mlb_get_game_boxscore",
    "Get the box score for a game with full batting and pitching stats for both teams.",
    {
      game_pk: z.number().describe("The unique game ID (gamePk)"),
    },
    async ({ game_pk }) => {
      try {
        const data = await fetchJson(`${BASE}/game/${game_pk}/boxscore`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. get_game_linescore
  server.tool(
    "mlb_get_game_linescore",
    "Get the line score (inning-by-inning scoring summary) for a game.",
    {
      game_pk: z.number().describe("The unique game ID (gamePk)"),
    },
    async ({ game_pk }) => {
      try {
        const data = await fetchJson(`${BASE}/game/${game_pk}/linescore`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. get_standings
  server.tool(
    "mlb_get_standings",
    "Get league standings with win/loss records, division ranks, and streaks.",
    {
      leagueId: z.string().optional().describe("League ID(s), comma-separated (103=AL, 104=NL). Defaults to both."),
      season: z.string().optional().describe("Season year (e.g. 2024). Defaults to current season."),
      standingsTypes: z.string().default("regularSeason").describe("Standings type: regularSeason, wildCard, divisionLeaders, etc."),
    },
    async ({ leagueId, season, standingsTypes }) => {
      try {
        const url = mlbUrl("standings", {
          leagueId: leagueId ?? "103,104",
          season,
          standingsTypes,
        });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 7. get_teams
  server.tool(
    "mlb_get_teams",
    "List MLB teams with their IDs, names, venues, divisions, and leagues.",
    {
      sportId: z.number().default(1).describe("Sport ID (1=MLB)"),
      season: z.string().optional().describe("Season year"),
    },
    async ({ sportId, season }) => {
      try {
        const url = mlbUrl("teams", {
          sportId: sportId.toString(),
          season,
        });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 8. get_team_roster
  server.tool(
    "mlb_get_team_roster",
    "Get a team's roster with player names, positions, jersey numbers, and status.",
    {
      team_id: z.number().describe("Team ID"),
      rosterType: z.string().default("active").describe("Roster type: active, fullSeason, 40Man, depthChart, etc."),
      season: z.string().optional().describe("Season year"),
    },
    async ({ team_id, rosterType, season }) => {
      try {
        const url = mlbUrl(`teams/${team_id}/roster`, {
          rosterType,
          season,
        });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 9. get_player
  server.tool(
    "mlb_get_player",
    "Get detailed player information including bio, position, and optionally hydrated stats.",
    {
      player_id: z.number().describe("Player ID"),
      hydrate: z.string().optional().describe('Hydration string, e.g. "stats(group=[hitting],type=[season])" to include stats'),
    },
    async ({ player_id, hydrate }) => {
      try {
        const url = mlbUrl(`people/${player_id}`, { hydrate });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 10. get_player_stats
  server.tool(
    "mlb_get_player_stats",
    "Get detailed statistics for a player by stat type and group.",
    {
      player_id: z.number().describe("Player ID"),
      stats_type: z.string().describe('Stat type: "season", "career", "gameLog", "yearByYear", "seasonAdvanced", etc.'),
      group: z.string().describe('Stat group: "hitting", "pitching", "fielding"'),
      season: z.string().optional().describe("Season year (e.g. 2024)"),
    },
    async ({ player_id, stats_type, group, season }) => {
      try {
        const url = mlbUrl(`people/${player_id}/stats`, {
          stats: stats_type,
          group,
          season,
        });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 11. search_players
  server.tool(
    "mlb_search_players",
    "Search for players by name. Returns matching players with their IDs, teams, and positions.",
    {
      names: z.string().describe("Player name(s) to search for"),
      sportId: z.number().default(1).describe("Sport ID (1=MLB)"),
    },
    async ({ names, sportId }) => {
      try {
        const url = mlbUrl("people/search", {
          names,
          sportId: sportId.toString(),
          hydrate: "currentTeam",
        });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 12. get_divisions
  server.tool(
    "mlb_get_divisions",
    "List all MLB divisions with their IDs, names, and associated leagues.",
    {},
    async () => {
      try {
        const url = mlbUrl("divisions", { sportId: "1" });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 13. get_league_leaders
  server.tool(
    "mlb_get_league_leaders",
    "Get league stat leaders for categories like home runs, batting average, ERA, strikeouts, etc.",
    {
      leaderCategories: z.string().describe('Stat category: "homeRuns", "battingAverage", "earnedRunAverage", "strikeouts", "wins", "saves", "stolenBases", etc.'),
      season: z.string().optional().describe("Season year (e.g. 2024)"),
      sportId: z.number().default(1).describe("Sport ID (1=MLB)"),
    },
    async ({ leaderCategories, season, sportId }) => {
      try {
        const url = mlbUrl("stats/leaders", {
          leaderCategories,
          season,
          sportId: sportId.toString(),
        });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
