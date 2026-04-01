import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// EntitySport Cricket provider — 12 tools
// Base: https://rest.entitysport.com/v2/
// Auth: query param `token`
// ---------------------------------------------------------------------------

const BASE = "https://rest.entitysport.com/v2";

export function register(server: McpServer): void {
  function getToken(): string {
    const key = process.env.ENTITY_SPORT_KEY;
    if (!key) throw new Error("ENTITY_SPORT_KEY env var is required");
    return key;
  }

  function apiUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined | null>,
  ): string {
    return buildUrl(`${BASE}${path}`, { token: getToken(), ...params });
  }

  // 1. entitycricket_get_matches
  server.tool(
    "entitycricket_get_matches",
    "List cricket matches with optional status, date, and pagination filters.",
    {
      status: z.string().optional().describe("Match status filter (e.g. live, completed, upcoming)"),
      date: z.string().optional().describe("Filter by date (YYYY-MM-DD)"),
      paged: z.number().optional().describe("Page number"),
      per_page: z.number().optional().describe("Results per page"),
    },
    async ({ status, date, paged, per_page }) => {
      try {
        const url = apiUrl("/matches", { status, date, paged, per_page });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. entitycricket_get_match
  server.tool(
    "entitycricket_get_match",
    "Get detailed information about a specific cricket match.",
    {
      match_id: z.string().describe("Match identifier"),
    },
    async ({ match_id }) => {
      try {
        const url = apiUrl(`/matches/${encodeURIComponent(match_id)}/info`);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. entitycricket_get_match_scorecard
  server.tool(
    "entitycricket_get_match_scorecard",
    "Get the full scorecard for a cricket match.",
    {
      match_id: z.string().describe("Match identifier"),
    },
    async ({ match_id }) => {
      try {
        const url = apiUrl(`/matches/${encodeURIComponent(match_id)}/scorecard`);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. entitycricket_get_match_commentary
  server.tool(
    "entitycricket_get_match_commentary",
    "Get ball-by-ball commentary for a specific inning of a match.",
    {
      match_id: z.string().describe("Match identifier"),
      inning: z.number().describe("Inning number (1, 2, 3, or 4)"),
    },
    async ({ match_id, inning }) => {
      try {
        const url = apiUrl(`/matches/${encodeURIComponent(match_id)}/innings/${inning}/commentary`);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. entitycricket_get_competitions
  server.tool(
    "entitycricket_get_competitions",
    "List cricket competitions/tournaments with optional status filter.",
    {
      status: z.string().optional().describe("Competition status filter"),
      paged: z.number().optional().describe("Page number"),
    },
    async ({ status, paged }) => {
      try {
        const url = apiUrl("/competitions", { status, paged });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. entitycricket_get_competition
  server.tool(
    "entitycricket_get_competition",
    "Get details for a specific cricket competition.",
    {
      competition_id: z.string().describe("Competition identifier"),
    },
    async ({ competition_id }) => {
      try {
        const url = apiUrl(`/competitions/${encodeURIComponent(competition_id)}`);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 7. entitycricket_get_competition_standings
  server.tool(
    "entitycricket_get_competition_standings",
    "Get standings/points table for a cricket competition.",
    {
      competition_id: z.string().describe("Competition identifier"),
    },
    async ({ competition_id }) => {
      try {
        const url = apiUrl(`/competitions/${encodeURIComponent(competition_id)}/standings`);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 8. entitycricket_get_teams
  server.tool(
    "entitycricket_get_teams",
    "List cricket teams with optional pagination.",
    {
      paged: z.number().optional().describe("Page number"),
    },
    async ({ paged }) => {
      try {
        const url = apiUrl("/teams", { paged });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 9. entitycricket_get_team
  server.tool(
    "entitycricket_get_team",
    "Get details for a specific cricket team.",
    {
      team_id: z.string().describe("Team identifier"),
    },
    async ({ team_id }) => {
      try {
        const url = apiUrl(`/teams/${encodeURIComponent(team_id)}`);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 10. entitycricket_get_players
  server.tool(
    "entitycricket_get_players",
    "List cricket players with optional pagination.",
    {
      paged: z.number().optional().describe("Page number"),
    },
    async ({ paged }) => {
      try {
        const url = apiUrl("/players", { paged });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 11. entitycricket_get_player
  server.tool(
    "entitycricket_get_player",
    "Get detailed info for a specific cricket player.",
    {
      player_id: z.string().describe("Player identifier"),
    },
    async ({ player_id }) => {
      try {
        const url = apiUrl(`/players/${encodeURIComponent(player_id)}`);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 12. entitycricket_get_venues
  server.tool(
    "entitycricket_get_venues",
    "List cricket venues/grounds with optional pagination.",
    {
      paged: z.number().optional().describe("Page number"),
    },
    async ({ paged }) => {
      try {
        const url = apiUrl("/venues", { paged });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
