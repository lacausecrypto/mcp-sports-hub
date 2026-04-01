import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// SportsDataIO provider — 12 tools
// Base: https://api.sportsdata.io/v3/{sport}/  (v4 for soccer)
// Auth: key query param
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Sport configuration (ported in full from source)
// ---------------------------------------------------------------------------

interface SportConfig {
  baseUrl: string;
  /** Some sports use a different date format in the URL */
  dateFormat: "YYYY-MM-DD" | "YYYY-MMM-DD";
  /** Endpoint path overrides per action (defaults provided below) */
  endpoints?: Partial<Record<string, string>>;
  /** Whether this sport supports the given endpoint at all */
  unsupported?: string[];
}

const SPORT_CONFIG: Record<string, SportConfig> = {
  nfl: {
    baseUrl: "https://api.sportsdata.io/v3/nfl",
    dateFormat: "YYYY-MMM-DD",
  },
  nba: {
    baseUrl: "https://api.sportsdata.io/v3/nba",
    dateFormat: "YYYY-MMM-DD",
  },
  mlb: {
    baseUrl: "https://api.sportsdata.io/v3/mlb",
    dateFormat: "YYYY-MMM-DD",
  },
  nhl: {
    baseUrl: "https://api.sportsdata.io/v3/nhl",
    dateFormat: "YYYY-MMM-DD",
  },
  soccer: {
    baseUrl: "https://api.sportsdata.io/v4/soccer",
    dateFormat: "YYYY-MM-DD",
    endpoints: {
      games_by_date: "scores/json/GamesByDate/{date}",
      standings: "scores/json/Standings/{season}",
      teams: "scores/json/Teams",
      player: "scores/json/Player/{player_id}",
      player_stats_by_season: "stats/json/PlayerSeasonStats/{season}",
      injuries: "scores/json/Injuries",
      news: "scores/json/News",
      schedules: "scores/json/Schedule/{season}",
      scores_by_date: "scores/json/GamesByDate/{date}",
      odds_by_date: "odds/json/GameOddsByDate/{date}",
      dfs_slates: "projections/json/DfsSlatesByDate/{date}",
      active_players: "scores/json/ActivePlayers",
    },
  },
  mma: {
    baseUrl: "https://api.sportsdata.io/v3/mma",
    dateFormat: "YYYY-MM-DD",
    endpoints: {
      games_by_date: "scores/json/Schedule/{season}",
      standings: "scores/json/Fighters",
      teams: "scores/json/Leagues",
      player: "scores/json/Fighter/{player_id}",
      player_stats_by_season: "stats/json/FighterInfo/{player_id}",
      schedules: "scores/json/Schedule/{season}",
      scores_by_date: "scores/json/Schedule/{season}",
      active_players: "scores/json/Fighters",
    },
    unsupported: ["injuries", "dfs_slates", "odds_by_date", "news"],
  },
  golf: {
    baseUrl: "https://api.sportsdata.io/v3/golf",
    dateFormat: "YYYY-MM-DD",
    endpoints: {
      games_by_date: "scores/json/Tournaments/{season}",
      standings: "scores/json/Tournaments/{season}",
      teams: "scores/json/Players",
      player: "scores/json/Player/{player_id}",
      player_stats_by_season: "stats/json/PlayerSeasonStats/{season}",
      injuries: "scores/json/Injuries",
      news: "scores/json/News",
      schedules: "scores/json/Tournaments/{season}",
      scores_by_date: "scores/json/Tournaments/{season}",
      active_players: "scores/json/Players",
    },
    unsupported: ["odds_by_date"],
  },
  nascar: {
    baseUrl: "https://api.sportsdata.io/v3/nascar",
    dateFormat: "YYYY-MM-DD",
    endpoints: {
      games_by_date: "scores/json/RacesByDate/{date}",
      standings: "scores/json/DriverStandings/{season}",
      teams: "scores/json/Drivers",
      player: "scores/json/Driver/{player_id}",
      player_stats_by_season: "stats/json/DriverSeasonStats/{season}",
      schedules: "scores/json/Series/{season}",
      scores_by_date: "scores/json/RacesByDate/{date}",
      active_players: "scores/json/Drivers",
    },
    unsupported: ["injuries", "odds_by_date", "dfs_slates"],
  },
  tennis: {
    baseUrl: "https://api.sportsdata.io/v3/tennis",
    dateFormat: "YYYY-MM-DD",
    endpoints: {
      games_by_date: "scores/json/MatchesByDate/{date}",
      standings: "scores/json/PlayerRankings",
      teams: "scores/json/Players",
      player: "scores/json/Player/{player_id}",
      player_stats_by_season: "stats/json/PlayerSeasonStats/{season}",
      schedules: "scores/json/Competitions/{season}",
      scores_by_date: "scores/json/MatchesByDate/{date}",
      active_players: "scores/json/Players",
    },
    unsupported: ["injuries", "dfs_slates"],
  },
};

// Default endpoints for the "big 4" team sports (NFL, NBA, MLB, NHL)
const DEFAULT_ENDPOINTS: Record<string, string> = {
  games_by_date: "scores/json/GamesByDate/{date}",
  standings: "scores/json/Standings/{season}",
  teams: "scores/json/Teams",
  player: "scores/json/Player/{player_id}",
  player_stats_by_season: "stats/json/PlayerSeasonStats/{season}",
  injuries: "scores/json/Injuries",
  news: "scores/json/News",
  schedules: "scores/json/Schedules/{season}",
  scores_by_date: "scores/json/ScoresByDate/{date}",
  odds_by_date: "odds/json/GameOddsByDate/{date}",
  dfs_slates: "projections/json/DfsSlatesByDate/{date}",
  active_players: "scores/json/ActivePlayers",
};

const SPORTS = ["nfl", "nba", "mlb", "nhl", "soccer", "mma", "golf", "nascar", "tennis"] as const;
type Sport = (typeof SPORTS)[number];
const sportEnum = z.enum(SPORTS);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MONTH_ABBR = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function formatDate(date: string, format: "YYYY-MM-DD" | "YYYY-MMM-DD"): string {
  if (format === "YYYY-MM-DD") return date;
  const parts = date.split("-");
  if (parts.length !== 3) return date;
  const monthIndex = parseInt(parts[1], 10) - 1;
  if (monthIndex < 0 || monthIndex > 11) return date;
  return `${parts[0]}-${MONTH_ABBR[monthIndex]}-${parts[2]}`;
}

function getEndpointPath(sport: Sport, action: string): string {
  const config = SPORT_CONFIG[sport];
  if (config.unsupported?.includes(action)) {
    throw new Error(`The "${action}" endpoint is not supported for ${sport.toUpperCase()}.`);
  }
  return config.endpoints?.[action] ?? DEFAULT_ENDPOINTS[action];
}

// ---------------------------------------------------------------------------
// Provider registration
// ---------------------------------------------------------------------------

export function register(server: McpServer): void {
  const API_KEY = process.env.SPORTSDATA_IO_KEY;

  function sdBuildUrl(sport: Sport, action: string, params: Record<string, string>): string {
    if (!API_KEY) throw new Error("SPORTSDATA_IO_KEY env var is required. Get a free key at https://sportsdata.io/");
    const config = SPORT_CONFIG[sport];
    let path = getEndpointPath(sport, action);

    // Replace path parameters
    for (const [key, value] of Object.entries(params)) {
      if (key === "date") {
        path = path.replace("{date}", formatDate(value, config.dateFormat));
      } else {
        path = path.replace(`{${key}}`, value);
      }
    }

    return `${config.baseUrl}/${path}?key=${API_KEY}`;
  }

  async function apiRequest(sport: Sport, action: string, params: Record<string, string>) {
    const url = sdBuildUrl(sport, action, params);
    return fetchJson(url);
  }

  function sdFormatResult(data: unknown): string {
    if (data === null || data === undefined) return "No data returned.";
    return JSON.stringify(data, null, 2);
  }

  function sdToolResult(data: unknown) {
    return { content: [{ type: "text" as const, text: sdFormatResult(data) }] };
  }

  // 1. sportsdata_get_games_by_date
  server.tool(
    "sportsdata_get_games_by_date",
    "Get games/events scheduled for a specific date",
    {
      sport: sportEnum,
      date: z.string().describe("Date in YYYY-MM-DD format"),
    },
    async ({ sport, date }) => {
      try {
        const data = await apiRequest(sport, "games_by_date", { date });
        return sdToolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. sportsdata_get_standings
  server.tool(
    "sportsdata_get_standings",
    "Get standings for a sport and season",
    {
      sport: sportEnum,
      season: z.string().describe("Season identifier, e.g. '2024', '2024REG', '2024POST'"),
    },
    async ({ sport, season }) => {
      try {
        const data = await apiRequest(sport, "standings", { season });
        return sdToolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. sportsdata_get_teams
  server.tool(
    "sportsdata_get_teams",
    "List all teams for a sport",
    {
      sport: sportEnum,
    },
    async ({ sport }) => {
      try {
        const data = await apiRequest(sport, "teams", {});
        return sdToolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. sportsdata_get_player
  server.tool(
    "sportsdata_get_player",
    "Get player information by player ID",
    {
      sport: sportEnum,
      player_id: z.string().describe("The player's unique ID"),
    },
    async ({ sport, player_id }) => {
      try {
        const data = await apiRequest(sport, "player", { player_id });
        return sdToolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. sportsdata_get_player_stats_by_season
  server.tool(
    "sportsdata_get_player_stats_by_season",
    "Get player season statistics",
    {
      sport: sportEnum,
      season: z.string().describe("Season identifier, e.g. '2024', '2024REG'"),
      player_id: z.string().describe("The player's unique ID"),
    },
    async ({ sport, season, player_id }) => {
      try {
        const data = await apiRequest(sport, "player_stats_by_season", { season, player_id });
        return sdToolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. sportsdata_get_injuries
  server.tool(
    "sportsdata_get_injuries",
    "Get current injury reports for a sport",
    {
      sport: sportEnum,
    },
    async ({ sport }) => {
      try {
        const data = await apiRequest(sport, "injuries", {});
        return sdToolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 7. sportsdata_get_news
  server.tool(
    "sportsdata_get_news",
    "Get latest news for a sport",
    {
      sport: sportEnum,
    },
    async ({ sport }) => {
      try {
        const data = await apiRequest(sport, "news", {});
        return sdToolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 8. sportsdata_get_schedules
  server.tool(
    "sportsdata_get_schedules",
    "Get the full season schedule for a sport",
    {
      sport: sportEnum,
      season: z.string().describe("Season identifier, e.g. '2024', '2024REG'"),
    },
    async ({ sport, season }) => {
      try {
        const data = await apiRequest(sport, "schedules", { season });
        return sdToolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 9. sportsdata_get_scores_by_date
  server.tool(
    "sportsdata_get_scores_by_date",
    "Get scores for games on a specific date",
    {
      sport: sportEnum,
      date: z.string().describe("Date in YYYY-MM-DD format"),
    },
    async ({ sport, date }) => {
      try {
        const data = await apiRequest(sport, "scores_by_date", { date });
        return sdToolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 10. sportsdata_get_odds_by_date
  server.tool(
    "sportsdata_get_odds_by_date",
    "Get betting odds for games on a specific date",
    {
      sport: sportEnum,
      date: z.string().describe("Date in YYYY-MM-DD format"),
    },
    async ({ sport, date }) => {
      try {
        const data = await apiRequest(sport, "odds_by_date", { date });
        return sdToolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 11. sportsdata_get_dfs_slates
  server.tool(
    "sportsdata_get_dfs_slates",
    "Get DFS (Daily Fantasy Sports) slates for a specific date",
    {
      sport: sportEnum,
      date: z.string().describe("Date in YYYY-MM-DD format"),
    },
    async ({ sport, date }) => {
      try {
        const data = await apiRequest(sport, "dfs_slates", { date });
        return sdToolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 12. sportsdata_get_active_players
  server.tool(
    "sportsdata_get_active_players",
    "Get all active players for a sport",
    {
      sport: sportEnum,
    },
    async ({ sport }) => {
      try {
        const data = await apiRequest(sport, "active_players", {});
        return sdToolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
