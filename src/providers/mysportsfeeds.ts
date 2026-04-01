import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// MySportsFeeds provider — 12 tools
// Base: https://api.mysportsfeeds.com/v2.1/pull/
// Auth: Basic Auth (base64 of user:pass)
// ---------------------------------------------------------------------------

const BASE = "https://api.mysportsfeeds.com/v2.1/pull";

export function register(server: McpServer): void {
  function getAuth(): string {
    const user = process.env.MYSPORTSFEEDS_USER;
    const pass = process.env.MYSPORTSFEEDS_PASS;
    if (!user || !pass) {
      throw new Error("MYSPORTSFEEDS_USER and MYSPORTSFEEDS_PASS env vars are required");
    }
    return "Basic " + Buffer.from(`${user}:${pass}`).toString("base64");
  }

  function headers(): Record<string, string> {
    return { Authorization: getAuth() };
  }

  // 1. msf_get_games
  server.tool(
    "msf_get_games",
    "Get games for a sport and season, optionally filtered by date.",
    {
      sport: z.string().describe("Sport slug (e.g. nfl, nba, mlb, nhl)"),
      season: z.string().describe("Season slug (e.g. 2024-regular, 2024-playoff)"),
      date: z.string().optional().describe("Filter by date (YYYYMMDD)"),
    },
    async ({ sport, season, date }) => {
      try {
        const url = buildUrl(`${BASE}/${sport}/${season}/games.json`, { date });
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. msf_get_game_boxscore
  server.tool(
    "msf_get_game_boxscore",
    "Get box score for a specific game.",
    {
      sport: z.string().describe("Sport slug"),
      season: z.string().describe("Season slug"),
      game_id: z.string().describe("Game identifier"),
    },
    async ({ sport, season, game_id }) => {
      try {
        const url = `${BASE}/${sport}/${season}/games/${encodeURIComponent(game_id)}/boxscore.json`;
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. msf_get_game_playbyplay
  server.tool(
    "msf_get_game_playbyplay",
    "Get play-by-play data for a specific game.",
    {
      sport: z.string().describe("Sport slug"),
      season: z.string().describe("Season slug"),
      game_id: z.string().describe("Game identifier"),
    },
    async ({ sport, season, game_id }) => {
      try {
        const url = `${BASE}/${sport}/${season}/games/${encodeURIComponent(game_id)}/playbyplay.json`;
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. msf_get_standings
  server.tool(
    "msf_get_standings",
    "Get standings for a sport and season.",
    {
      sport: z.string().describe("Sport slug"),
      season: z.string().describe("Season slug"),
    },
    async ({ sport, season }) => {
      try {
        const url = `${BASE}/${sport}/${season}/standings.json`;
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. msf_get_player_stats
  server.tool(
    "msf_get_player_stats",
    "Get player stats for a sport and season, optionally filtered by player.",
    {
      sport: z.string().describe("Sport slug"),
      season: z.string().describe("Season slug"),
      player: z.string().optional().describe("Player slug or ID to filter"),
    },
    async ({ sport, season, player }) => {
      try {
        const url = buildUrl(`${BASE}/${sport}/${season}/player_stats_totals.json`, { player });
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. msf_get_roster
  server.tool(
    "msf_get_roster",
    "Get the roster for a specific team.",
    {
      sport: z.string().describe("Sport slug"),
      season: z.string().describe("Season slug"),
      team: z.string().describe("Team slug or abbreviation"),
    },
    async ({ sport, season, team }) => {
      try {
        const url = buildUrl(`${BASE}/${sport}/${season}/roster_players.json`, { team });
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 7. msf_get_injuries
  server.tool(
    "msf_get_injuries",
    "Get current injury reports for a sport and season.",
    {
      sport: z.string().describe("Sport slug"),
      season: z.string().describe("Season slug"),
    },
    async ({ sport, season }) => {
      try {
        const url = `${BASE}/${sport}/${season}/injuries.json`;
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 8. msf_get_daily_dfs
  server.tool(
    "msf_get_daily_dfs",
    "Get daily fantasy sports (DFS) data for a specific date.",
    {
      sport: z.string().describe("Sport slug"),
      season: z.string().describe("Season slug"),
      date: z.string().describe("Date (YYYYMMDD)"),
    },
    async ({ sport, season, date }) => {
      try {
        const url = `${BASE}/${sport}/${season}/date/${date}/dfs.json`;
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 9. msf_get_odds_gamelines
  server.tool(
    "msf_get_odds_gamelines",
    "Get betting odds and game lines for a sport and season, optionally by date.",
    {
      sport: z.string().describe("Sport slug"),
      season: z.string().describe("Season slug"),
      date: z.string().optional().describe("Filter by date (YYYYMMDD)"),
    },
    async ({ sport, season, date }) => {
      try {
        const url = buildUrl(`${BASE}/${sport}/${season}/odds_gamelines.json`, { date });
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 10. msf_get_lineups
  server.tool(
    "msf_get_lineups",
    "Get expected or confirmed lineups, optionally filtered by date.",
    {
      sport: z.string().describe("Sport slug"),
      season: z.string().describe("Season slug"),
      date: z.string().optional().describe("Filter by date (YYYYMMDD)"),
    },
    async ({ sport, season, date }) => {
      try {
        const url = buildUrl(`${BASE}/${sport}/${season}/daily_lineups.json`, { date });
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 11. msf_get_schedule
  server.tool(
    "msf_get_schedule",
    "Get the full season schedule for a sport.",
    {
      sport: z.string().describe("Sport slug"),
      season: z.string().describe("Season slug"),
    },
    async ({ sport, season }) => {
      try {
        const url = `${BASE}/${sport}/${season}/games.json`;
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 12. msf_get_players
  server.tool(
    "msf_get_players",
    "List or search players for a sport and season.",
    {
      sport: z.string().describe("Sport slug"),
      season: z.string().describe("Season slug"),
      search: z.string().optional().describe("Search by player name"),
    },
    async ({ sport, season, search }) => {
      try {
        const url = buildUrl(`${BASE}/${sport}/${season}/players.json`, { search });
        const data = await fetchJson(url, { headers: headers() });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
