import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// TheSportsDB provider — 13 tools
// Base: https://www.thesportsdb.com/api/v1/json/{key}/
// Auth: key in URL path (defaults to test key "3")
// ---------------------------------------------------------------------------

export function register(server: McpServer): void {
  const API_KEY = process.env.THESPORTSDB_API_KEY || "3";
  const BASE = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;

  async function apiRequest(endpoint: string, params: Record<string, string> = {}) {
    const url = buildUrl(`${BASE}/${endpoint}.php`, params);
    return fetchJson(url);
  }

  function formatResult(data: unknown): string {
    if (data === null || data === undefined) return "No results found.";
    return JSON.stringify(data, null, 2);
  }

  function sdbResult(data: unknown) {
    return { content: [{ type: "text" as const, text: formatResult(data) }] };
  }

  // 1. sportsdb_search_teams
  server.tool(
    "sportsdb_search_teams",
    "Search teams by name. Returns matching teams with basic info, badges, and stadium details.",
    { team_name: z.string().describe("Team name to search for") },
    async ({ team_name }) => {
      try {
        const data = await apiRequest("searchteams", { t: team_name });
        return sdbResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. sportsdb_search_players
  server.tool(
    "sportsdb_search_players",
    "Search players by name, or list all players on a team. Provide either player_name or team_name (or both).",
    {
      player_name: z.string().optional().describe("Player name to search for"),
      team_name: z.string().optional().describe("Team name to list players from"),
    },
    async ({ player_name, team_name }) => {
      try {
        if (!player_name && !team_name) {
          return errorResult("Provide at least player_name or team_name.");
        }
        const params: Record<string, string> = {};
        if (player_name) params.p = player_name;
        if (team_name) params.t = team_name;
        const data = await apiRequest("searchplayers", params);
        return sdbResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. sportsdb_get_team_details
  server.tool(
    "sportsdb_get_team_details",
    "Get full details for a team by its TheSportsDB ID. Includes description, stadium, badges, social links, and more.",
    { team_id: z.string().describe("TheSportsDB team ID") },
    async ({ team_id }) => {
      try {
        const data = await apiRequest("lookupteam", { id: team_id });
        return sdbResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. sportsdb_get_player_details
  server.tool(
    "sportsdb_get_player_details",
    "Get full details for a player by their TheSportsDB ID. Includes biography, position, stats, and images.",
    { player_id: z.string().describe("TheSportsDB player ID") },
    async ({ player_id }) => {
      try {
        const data = await apiRequest("lookupplayer", { id: player_id });
        return sdbResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. sportsdb_get_league_list
  server.tool(
    "sportsdb_get_league_list",
    "List all leagues, optionally filtered by country and/or sport.",
    {
      country: z.string().optional().describe("Country name to filter by (e.g. 'England')"),
      sport: z.string().optional().describe("Sport name to filter by (e.g. 'Soccer')"),
    },
    async ({ country, sport }) => {
      try {
        let data: unknown;
        if (country) {
          const params: Record<string, string> = { c: country };
          if (sport) params.s = sport;
          data = await apiRequest("search_all_leagues", params);
        } else if (sport) {
          data = await apiRequest("search_all_leagues", { s: sport });
        } else {
          data = await apiRequest("all_leagues");
        }
        return sdbResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. sportsdb_get_events_by_date
  server.tool(
    "sportsdb_get_events_by_date",
    "Get sporting events on a specific date. Optionally filter by sport or league name.",
    {
      date: z.string().describe("Date in YYYY-MM-DD format"),
      sport: z.string().optional().describe("Sport name to filter by (e.g. 'Soccer')"),
      league: z.string().optional().describe("League name to filter by"),
    },
    async ({ date, sport, league }) => {
      try {
        const params: Record<string, string> = { d: date };
        if (sport) params.s = sport;
        if (league) params.l = league;
        const data = await apiRequest("eventsday", params);
        return sdbResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 7. sportsdb_get_event_details
  server.tool(
    "sportsdb_get_event_details",
    "Get full details for a specific event by its TheSportsDB ID. Includes scores, venue, thumbnails, and video highlights.",
    { event_id: z.string().describe("TheSportsDB event ID") },
    async ({ event_id }) => {
      try {
        const data = await apiRequest("lookupevent", { id: event_id });
        return sdbResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 8. sportsdb_get_last_events
  server.tool(
    "sportsdb_get_last_events",
    "Get the last 15 completed events for a team. Includes scores and results.",
    { team_id: z.string().describe("TheSportsDB team ID") },
    async ({ team_id }) => {
      try {
        const data = await apiRequest("eventslast", { id: team_id });
        return sdbResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 9. sportsdb_get_next_events
  server.tool(
    "sportsdb_get_next_events",
    "Get the next 15 upcoming events for a team.",
    { team_id: z.string().describe("TheSportsDB team ID") },
    async ({ team_id }) => {
      try {
        const data = await apiRequest("eventsnext", { id: team_id });
        return sdbResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 10. sportsdb_get_standings
  server.tool(
    "sportsdb_get_standings",
    "Get league table / standings for a given league and season.",
    {
      league_id: z.string().describe("TheSportsDB league ID"),
      season: z.string().describe("Season string (e.g. '2023-2024' or '2024')"),
    },
    async ({ league_id, season }) => {
      try {
        const data = await apiRequest("lookuptable", { l: league_id, s: season });
        return sdbResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 11. sportsdb_get_event_results
  server.tool(
    "sportsdb_get_event_results",
    "Get past event results for a specific round of a league season.",
    {
      league_id: z.string().describe("TheSportsDB league ID"),
      round: z.string().describe("Round number (e.g. '1', '38')"),
      season: z.string().describe("Season string (e.g. '2023-2024' or '2024')"),
    },
    async ({ league_id, round, season }) => {
      try {
        const data = await apiRequest("eventsround", { id: league_id, r: round, s: season });
        return sdbResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 12. sportsdb_get_seasons
  server.tool(
    "sportsdb_get_seasons",
    "List all available seasons for a league.",
    { league_id: z.string().describe("TheSportsDB league ID") },
    async ({ league_id }) => {
      try {
        const data = await apiRequest("search_all_seasons", { id: league_id });
        return sdbResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 13. sportsdb_get_sports_list
  server.tool(
    "sportsdb_get_sports_list",
    "List all available sports on TheSportsDB.",
    {},
    async () => {
      try {
        const data = await apiRequest("all_sports");
        return sdbResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
