import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// SportDevs provider — 12 tools
// Base: https://{sport}.sportdevs.com/
// Auth: Authorization: Bearer {key}
// Sports: rugby, volleyball, handball
// Uses PostgREST-style query filters (eq.VALUE)
// ---------------------------------------------------------------------------

export function register(server: McpServer): void {
  const API_KEY = process.env.SPORTDEVS_API_KEY;

  const SPORTS = ["rugby", "volleyball", "handball"] as const;
  type Sport = (typeof SPORTS)[number];
  const sportEnum = z.enum(SPORTS);

  async function apiRequest(sport: Sport, path: string, params?: Record<string, string>) {
    if (!API_KEY) throw new Error("SPORTDEVS_API_KEY env var is required.");
    const base = `https://${sport}.sportdevs.com`;
    const url = buildUrl(`${base}${path}`, params);
    return fetchJson(url, { headers: { Authorization: `Bearer ${API_KEY}` } });
  }

  // 1. sportdevs_get_matches
  server.tool(
    "sportdevs_get_matches",
    "Get matches filtered by date, league, team, or live status",
    {
      sport: sportEnum,
      date: z.string().optional().describe("Date filter (YYYY-MM-DD)"),
      league_id: z.number().optional().describe("Filter by league ID"),
      team_id: z.number().optional().describe("Filter by team ID"),
      live: z.boolean().optional().describe("Only return live matches"),
    },
    async ({ sport, date, league_id, team_id, live }) => {
      try {
        const params: Record<string, string> = {};
        if (date) params.date = date;
        if (league_id !== undefined) params.league_id = `eq.${league_id}`;
        if (team_id !== undefined) params.team_id = `eq.${team_id}`;
        if (live) params.live = "eq.true";
        const data = await apiRequest(sport, "/matches", params);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. sportdevs_get_match_details
  server.tool(
    "sportdevs_get_match_details",
    "Get full details for a specific match",
    {
      sport: sportEnum,
      match_id: z.number().describe("Match ID"),
    },
    async ({ sport, match_id }) => {
      try {
        const data = await apiRequest(sport, "/matches", { id: `eq.${match_id}` });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. sportdevs_get_match_lineups
  server.tool(
    "sportdevs_get_match_lineups",
    "Get lineups for a specific match",
    {
      sport: sportEnum,
      match_id: z.number().describe("Match ID"),
    },
    async ({ sport, match_id }) => {
      try {
        const data = await apiRequest(sport, "/lineups", { match_id: `eq.${match_id}` });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. sportdevs_get_match_statistics
  server.tool(
    "sportdevs_get_match_statistics",
    "Get statistics for a specific match",
    {
      sport: sportEnum,
      match_id: z.number().describe("Match ID"),
    },
    async ({ sport, match_id }) => {
      try {
        const data = await apiRequest(sport, "/match-statistics", { match_id: `eq.${match_id}` });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. sportdevs_get_standings
  server.tool(
    "sportdevs_get_standings",
    "Get league standings, optionally filtered by season",
    {
      sport: sportEnum,
      league_id: z.number().describe("League ID"),
      season_id: z.number().optional().describe("Season ID"),
    },
    async ({ sport, league_id, season_id }) => {
      try {
        const params: Record<string, string> = { league_id: `eq.${league_id}` };
        if (season_id !== undefined) params.season_id = `eq.${season_id}`;
        const data = await apiRequest(sport, "/standings", params);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. sportdevs_get_teams
  server.tool(
    "sportdevs_get_teams",
    "List teams, optionally filtered by league or country",
    {
      sport: sportEnum,
      league_id: z.number().optional().describe("Filter by league ID"),
      country: z.string().optional().describe("Filter by country name"),
    },
    async ({ sport, league_id, country }) => {
      try {
        const params: Record<string, string> = {};
        if (league_id !== undefined) params.league_id = `eq.${league_id}`;
        if (country) params.country = `eq.${country}`;
        const data = await apiRequest(sport, "/teams", params);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 7. sportdevs_get_team
  server.tool(
    "sportdevs_get_team",
    "Get detailed information for a specific team",
    {
      sport: sportEnum,
      team_id: z.number().describe("Team ID"),
    },
    async ({ sport, team_id }) => {
      try {
        const data = await apiRequest(sport, "/teams", { id: `eq.${team_id}` });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 8. sportdevs_get_players
  server.tool(
    "sportdevs_get_players",
    "List players, optionally filtered by team",
    {
      sport: sportEnum,
      team_id: z.number().optional().describe("Filter by team ID"),
    },
    async ({ sport, team_id }) => {
      try {
        const params: Record<string, string> = {};
        if (team_id !== undefined) params.team_id = `eq.${team_id}`;
        const data = await apiRequest(sport, "/players", params);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 9. sportdevs_get_player
  server.tool(
    "sportdevs_get_player",
    "Get detailed information for a specific player",
    {
      sport: sportEnum,
      player_id: z.number().describe("Player ID"),
    },
    async ({ sport, player_id }) => {
      try {
        const data = await apiRequest(sport, "/players", { id: `eq.${player_id}` });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 10. sportdevs_get_leagues
  server.tool(
    "sportdevs_get_leagues",
    "List available leagues, optionally filtered by country",
    {
      sport: sportEnum,
      country: z.string().optional().describe("Filter by country name"),
    },
    async ({ sport, country }) => {
      try {
        const params: Record<string, string> = {};
        if (country) params.country = `eq.${country}`;
        const data = await apiRequest(sport, "/leagues", params);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 11. sportdevs_get_livescores
  server.tool(
    "sportdevs_get_livescores",
    "Get all currently live scores for a sport",
    {
      sport: sportEnum,
    },
    async ({ sport }) => {
      try {
        const data = await apiRequest(sport, "/livescores");
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 12. sportdevs_get_odds
  server.tool(
    "sportdevs_get_odds",
    "Get betting odds for a specific match",
    {
      sport: sportEnum,
      match_id: z.number().describe("Match ID"),
    },
    async ({ sport, match_id }) => {
      try {
        const data = await apiRequest(sport, "/odds", { match_id: `eq.${match_id}` });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
