import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

const BASE = "http://api.jolpi.ca/ergast";

function seasonPath(season?: string): string {
  return season ?? "current";
}

function f1Url(path: string, params?: Record<string, string | number | undefined>): string {
  return buildUrl(`${BASE}${path}`, params);
}

// Shared pagination params
const PaginationParams = {
  limit: z.number().int().positive().max(1000).optional().describe("Maximum number of results to return (default 30, max 1000)"),
  offset: z.number().int().min(0).optional().describe("Number of results to skip for pagination"),
};

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

export function register(server: McpServer): void {
  // 1. get_race_results
  server.tool(
    "f1_get_race_results",
    "Get Formula 1 race results. Returns finishing positions, drivers, constructors, times, and status for a season or specific round.",
    {
      season: z.string().optional().describe('Season year (e.g. "2024") or "current" (default: "current")'),
      round: z.string().optional().describe("Round number within the season"),
      ...PaginationParams,
    },
    async ({ season, round, limit, offset }) => {
      try {
        const s = seasonPath(season);
        const path = round
          ? `/f1/${s}/${round}/results.json`
          : `/f1/${s}/results.json`;
        const url = f1Url(path, { limit, offset });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. get_qualifying
  server.tool(
    "f1_get_qualifying",
    "Get Formula 1 qualifying results. Returns Q1/Q2/Q3 times for drivers in a specific qualifying session.",
    {
      season: z.string().optional().describe('Season year (e.g. "2024") or "current" (default: "current")'),
      round: z.string().optional().describe("Round number within the season"),
      ...PaginationParams,
    },
    async ({ season, round, limit, offset }) => {
      try {
        const s = seasonPath(season);
        const path = round
          ? `/f1/${s}/${round}/qualifying.json`
          : `/f1/${s}/qualifying.json`;
        const url = f1Url(path, { limit, offset });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. get_sprint
  server.tool(
    "f1_get_sprint",
    "Get Formula 1 sprint race results for a specific round.",
    {
      season: z.string().optional().describe('Season year (e.g. "2024") or "current" (default: "current")'),
      round: z.string().optional().describe("Round number within the season"),
      ...PaginationParams,
    },
    async ({ season, round, limit, offset }) => {
      try {
        const s = seasonPath(season);
        const path = round
          ? `/f1/${s}/${round}/sprint.json`
          : `/f1/${s}/sprint.json`;
        const url = f1Url(path, { limit, offset });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. get_driver_standings
  server.tool(
    "f1_get_driver_standings",
    "Get Formula 1 World Drivers' Championship standings for a given season.",
    {
      season: z.string().optional().describe('Season year (e.g. "2024") or "current" (default: "current")'),
      ...PaginationParams,
    },
    async ({ season, limit, offset }) => {
      try {
        const s = seasonPath(season);
        const url = f1Url(`/f1/${s}/driverStandings.json`, { limit, offset });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. get_constructor_standings
  server.tool(
    "f1_get_constructor_standings",
    "Get Formula 1 World Constructors' Championship standings for a given season.",
    {
      season: z.string().optional().describe('Season year (e.g. "2024") or "current" (default: "current")'),
      ...PaginationParams,
    },
    async ({ season, limit, offset }) => {
      try {
        const s = seasonPath(season);
        const url = f1Url(`/f1/${s}/constructorStandings.json`, { limit, offset });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. get_schedule
  server.tool(
    "f1_get_schedule",
    "Get the Formula 1 race schedule/calendar for a given season, including circuit info and race dates.",
    {
      season: z.string().optional().describe('Season year (e.g. "2024") or "current" (default: "current")'),
      ...PaginationParams,
    },
    async ({ season, limit, offset }) => {
      try {
        const s = seasonPath(season);
        const url = f1Url(`/f1/${s}.json`, { limit, offset });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 7. get_drivers
  server.tool(
    "f1_get_drivers",
    "List Formula 1 drivers for a given season or all-time. Returns driver IDs, names, nationalities, and other info.",
    {
      season: z.string().optional().describe('Season year (e.g. "2024") or "current" (default: "current")'),
      ...PaginationParams,
    },
    async ({ season, limit, offset }) => {
      try {
        const s = seasonPath(season);
        const url = f1Url(`/f1/${s}/drivers.json`, { limit, offset });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 8. get_constructors
  server.tool(
    "f1_get_constructors",
    "List Formula 1 constructors/teams for a given season or all-time.",
    {
      season: z.string().optional().describe('Season year (e.g. "2024") or "current" (default: "current")'),
      ...PaginationParams,
    },
    async ({ season, limit, offset }) => {
      try {
        const s = seasonPath(season);
        const url = f1Url(`/f1/${s}/constructors.json`, { limit, offset });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 9. get_circuits
  server.tool(
    "f1_get_circuits",
    "List Formula 1 circuits for a given season or all-time. Returns circuit names, locations, and coordinates.",
    {
      season: z.string().optional().describe('Season year (e.g. "2024") or "current" (default: "current")'),
      ...PaginationParams,
    },
    async ({ season, limit, offset }) => {
      try {
        const s = seasonPath(season);
        const url = f1Url(`/f1/${s}/circuits.json`, { limit, offset });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 10. get_lap_times
  server.tool(
    "f1_get_lap_times",
    "Get lap times for a specific race. Can return all laps or a specific lap number. Data available from 1996 onwards.",
    {
      season: z.string().describe('Season year (e.g. "2024")'),
      round: z.string().describe("Round number within the season"),
      lap: z.string().optional().describe("Specific lap number (omit for all laps)"),
      ...PaginationParams,
    },
    async ({ season, round, lap, limit, offset }) => {
      try {
        const path = lap
          ? `/f1/${season}/${round}/laps/${lap}.json`
          : `/f1/${season}/${round}/laps.json`;
        const url = f1Url(path, { limit, offset });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 11. get_pit_stops
  server.tool(
    "f1_get_pit_stops",
    "Get pit stop data for a specific race. Can return all pit stops or a specific stop number. Data available from 2012 onwards.",
    {
      season: z.string().describe('Season year (e.g. "2024")'),
      round: z.string().describe("Round number within the season"),
      stop: z.string().optional().describe("Specific pit stop number (omit for all stops)"),
      ...PaginationParams,
    },
    async ({ season, round, stop, limit, offset }) => {
      try {
        const path = stop
          ? `/f1/${season}/${round}/pitstops/${stop}.json`
          : `/f1/${season}/${round}/pitstops.json`;
        const url = f1Url(path, { limit, offset });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 12. get_seasons
  server.tool(
    "f1_get_seasons",
    "List all Formula 1 seasons from 1950 to present, including Wikipedia links.",
    {
      ...PaginationParams,
    },
    async ({ limit, offset }) => {
      try {
        const url = f1Url("/f1/seasons.json", { limit, offset });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 13. get_driver_results
  server.tool(
    "f1_get_driver_results",
    "Get all race results for a specific driver in a given season. Use driver IDs like 'hamilton', 'max_verstappen', 'leclerc'.",
    {
      driver_id: z.string().describe('Driver ID (e.g. "hamilton", "max_verstappen", "leclerc")'),
      season: z.string().optional().describe('Season year (e.g. "2024") or "current" (default: "current")'),
      ...PaginationParams,
    },
    async ({ driver_id, season, limit, offset }) => {
      try {
        const s = seasonPath(season);
        const url = f1Url(`/f1/${s}/drivers/${driver_id}/results.json`, { limit, offset });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
