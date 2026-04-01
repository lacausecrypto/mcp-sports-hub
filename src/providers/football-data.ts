import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_BASE = "https://api.football-data.org/v4";
const FREE_TIER_COMPETITIONS =
  "PL, ELC, BL1, SA, PD, FL1, DED, PPL, CL, EC, WC, CLI";

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

export function register(server: McpServer): void {
  const API_KEY = process.env.FOOTBALL_DATA_API_KEY;

  function headers() {
    return { "X-Auth-Token": API_KEY! };
  }

  async function callApi(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ) {
    if (!API_KEY) return errorResult("FOOTBALL_DATA_API_KEY env var is required");
    try {
      const url = buildUrl(`${API_BASE}${path}`, params);
      const data = await fetchJson(url, { headers: headers() });
      return toolResult(data);
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err));
    }
  }

  // 1. get_competitions
  server.tool(
    "footballdata_get_competitions",
    `List available football competitions. Free tier codes: ${FREE_TIER_COMPETITIONS}`,
    {
      areas: z
        .string()
        .optional()
        .describe("Comma-separated area IDs to filter competitions"),
    },
    async ({ areas }) => {
      const params: Record<string, string | undefined> = {};
      if (areas) params.areas = areas;
      return callApi("/competitions", params);
    },
  );

  // 2. get_competition
  server.tool(
    "footballdata_get_competition",
    `Get details for a specific competition. Free tier codes: ${FREE_TIER_COMPETITIONS}`,
    {
      competition_code: z
        .string()
        .describe("Competition code (e.g., PL, CL, BL1, SA, PD, FL1, DED, PPL, ELC, EC, WC, CLI)"),
    },
    async ({ competition_code }) => {
      return callApi(`/competitions/${competition_code}`);
    },
  );

  // 3. get_standings
  server.tool(
    "footballdata_get_standings",
    `Get competition standings/league table. Free tier codes: ${FREE_TIER_COMPETITIONS}`,
    {
      competition_code: z
        .string()
        .describe("Competition code (e.g., PL, BL1, SA, PD, FL1)"),
      season: z
        .number()
        .optional()
        .describe("Season year (e.g., 2024 for the 2024/25 season)"),
      matchday: z
        .number()
        .optional()
        .describe("Specific matchday number to get standings at that point"),
    },
    async ({ competition_code, season, matchday }) => {
      const params: Record<string, string | number | undefined> = {};
      if (season !== undefined) params.season = season;
      if (matchday !== undefined) params.matchday = matchday;
      return callApi(`/competitions/${competition_code}/standings`, params);
    },
  );

  // 4. get_matches
  server.tool(
    "footballdata_get_matches",
    `Get matches with optional filters. Use competition_code or team_id (or both). ` +
      `Free tier codes: ${FREE_TIER_COMPETITIONS}. ` +
      `Status values: SCHEDULED, TIMED, IN_PLAY, PAUSED, FINISHED, POSTPONED, SUSPENDED, CANCELLED`,
    {
      competition_code: z
        .string()
        .optional()
        .describe("Competition code to filter (e.g., PL, CL)"),
      team_id: z
        .number()
        .optional()
        .describe("Team ID to filter matches"),
      dateFrom: z
        .string()
        .optional()
        .describe("Start date filter (YYYY-MM-DD)"),
      dateTo: z
        .string()
        .optional()
        .describe("End date filter (YYYY-MM-DD)"),
      status: z
        .string()
        .optional()
        .describe("Match status: SCHEDULED, TIMED, IN_PLAY, PAUSED, FINISHED, POSTPONED, SUSPENDED, CANCELLED"),
      matchday: z
        .number()
        .optional()
        .describe("Matchday number (only with competition_code)"),
    },
    async ({ competition_code, team_id, dateFrom, dateTo, status, matchday }) => {
      let path: string;
      const params: Record<string, string | number | undefined> = {};

      if (competition_code) {
        path = `/competitions/${competition_code}/matches`;
      } else if (team_id) {
        path = `/teams/${team_id}/matches`;
      } else {
        path = "/matches";
      }

      if (team_id && competition_code) {
        path = "/matches";
        params.competitions = competition_code;
        params.teams = team_id;
      }

      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (status) params.status = status;
      if (matchday !== undefined) params.matchday = matchday;

      return callApi(path, params);
    },
  );

  // 5. get_match
  server.tool(
    "footballdata_get_match",
    "Get detailed information for a specific match including lineups, goals, and substitutions.",
    {
      match_id: z.number().describe("The match ID"),
    },
    async ({ match_id }) => {
      return callApi(`/matches/${match_id}`);
    },
  );

  // 6. get_teams
  server.tool(
    "footballdata_get_teams",
    `List teams in a competition. Free tier codes: ${FREE_TIER_COMPETITIONS}`,
    {
      competition_code: z
        .string()
        .describe("Competition code (e.g., PL, BL1, SA, PD)"),
      season: z
        .number()
        .optional()
        .describe("Season year (e.g., 2024)"),
    },
    async ({ competition_code, season }) => {
      const params: Record<string, string | number | undefined> = {};
      if (season !== undefined) params.season = season;
      return callApi(`/competitions/${competition_code}/teams`, params);
    },
  );

  // 7. get_team
  server.tool(
    "footballdata_get_team",
    "Get team details including squad roster.",
    {
      team_id: z.number().describe("The team ID"),
    },
    async ({ team_id }) => {
      return callApi(`/teams/${team_id}`);
    },
  );

  // 8. get_team_matches
  server.tool(
    "footballdata_get_team_matches",
    `Get matches for a specific team with optional filters. ` +
      `Status values: SCHEDULED, TIMED, IN_PLAY, PAUSED, FINISHED, POSTPONED, SUSPENDED, CANCELLED`,
    {
      team_id: z.number().describe("The team ID"),
      dateFrom: z
        .string()
        .optional()
        .describe("Start date filter (YYYY-MM-DD)"),
      dateTo: z
        .string()
        .optional()
        .describe("End date filter (YYYY-MM-DD)"),
      status: z
        .string()
        .optional()
        .describe("Match status filter"),
      competitions: z
        .string()
        .optional()
        .describe("Comma-separated competition codes to filter (e.g., PL,CL)"),
    },
    async ({ team_id, dateFrom, dateTo, status, competitions }) => {
      const params: Record<string, string | undefined> = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (status) params.status = status;
      if (competitions) params.competitions = competitions;
      return callApi(`/teams/${team_id}/matches`, params);
    },
  );

  // 9. get_scorers
  server.tool(
    "footballdata_get_scorers",
    `Get top scorers for a competition. Free tier codes: ${FREE_TIER_COMPETITIONS}`,
    {
      competition_code: z
        .string()
        .describe("Competition code (e.g., PL, BL1, SA, PD, CL)"),
      season: z
        .number()
        .optional()
        .describe("Season year (e.g., 2024)"),
      limit: z
        .number()
        .optional()
        .describe("Number of scorers to return (default: 10)"),
    },
    async ({ competition_code, season, limit }) => {
      const params: Record<string, string | number | undefined> = {};
      if (season !== undefined) params.season = season;
      if (limit !== undefined) params.limit = limit;
      return callApi(`/competitions/${competition_code}/scorers`, params);
    },
  );

  // 10. get_person
  server.tool(
    "footballdata_get_person",
    "Get details for a player or coach by their ID.",
    {
      person_id: z.number().describe("The person ID"),
    },
    async ({ person_id }) => {
      return callApi(`/persons/${person_id}`);
    },
  );

  // 11. get_areas
  server.tool(
    "footballdata_get_areas",
    "List available football areas and countries.",
    {},
    async () => {
      return callApi("/areas");
    },
  );
}
