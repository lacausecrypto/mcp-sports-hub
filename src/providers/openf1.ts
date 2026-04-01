import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

const BASE = "https://api.openf1.org/v1";

function openf1Url(
  endpoint: string,
  params?: Record<string, string | number | undefined>,
): string {
  return buildUrl(`${BASE}${endpoint}`, params);
}

function formatWithWarning(data: unknown, warning?: string) {
  const text = JSON.stringify(data, null, 2);
  const prefix = warning ? `${warning}\n\n` : "";
  return {
    content: [{ type: "text" as const, text: `${prefix}${text}` }],
  };
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

export function register(server: McpServer): void {
  // 1. get_sessions
  server.tool(
    "openf1_get_sessions",
    "List Formula 1 sessions. A session is a single on-track period such as a practice, qualifying, sprint, or race.",
    {
      session_key: z.number().optional().describe("Unique session identifier"),
      session_name: z.string().optional().describe("Session name (e.g. 'Race', 'Qualifying', 'Sprint', 'Practice 1')"),
      session_type: z.string().optional().describe("Session type (e.g. 'Race', 'Qualifying', 'Practice')"),
      country_name: z.string().optional().describe("Country name (e.g. 'Italy', 'United Kingdom')"),
      year: z.number().optional().describe("Season year (e.g. 2024)"),
      circuit_short_name: z.string().optional().describe("Short circuit name (e.g. 'Monza', 'Silverstone')"),
    },
    async (params) => {
      try {
        const url = openf1Url("/sessions", params);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. get_drivers
  server.tool(
    "openf1_get_drivers",
    "Get driver information for a session or across sessions. Returns driver names, numbers, team names, and more.",
    {
      session_key: z.number().optional().describe("Session identifier to get drivers for a specific session"),
      driver_number: z.number().optional().describe("Driver's car number (e.g. 1 for Verstappen, 44 for Hamilton)"),
      name_acronym: z.string().optional().describe("Three-letter driver acronym (e.g. 'VER', 'HAM', 'LEC')"),
    },
    async (params) => {
      try {
        const url = openf1Url("/drivers", params);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. get_laps
  server.tool(
    "openf1_get_laps",
    "Get lap timing data including sector times, lap duration, and more for a session.",
    {
      session_key: z.number().describe("Session identifier (required)"),
      driver_number: z.number().optional().describe("Filter by driver number"),
      lap_number: z.number().optional().describe("Filter by specific lap number"),
    },
    async (params) => {
      try {
        const url = openf1Url("/laps", params);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. get_positions
  server.tool(
    "openf1_get_positions",
    "Get position/ranking data during a session. Shows how positions change over time.",
    {
      session_key: z.number().describe("Session identifier (required)"),
      driver_number: z.number().optional().describe("Filter by driver number"),
      position: z.number().optional().describe("Filter by specific position (e.g. 1 for leader)"),
    },
    async (params) => {
      try {
        const url = openf1Url("/position", params);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. get_car_data
  server.tool(
    "openf1_get_car_data",
    "Get detailed car telemetry: speed, RPM, gear, throttle, brake, DRS. WARNING: This endpoint returns massive amounts of data (multiple samples per second per car). Always use date_gte and date_lte filters to limit the time window, ideally to a few seconds or a single lap.",
    {
      session_key: z.number().describe("Session identifier (required)"),
      driver_number: z.number().optional().describe("Filter by driver number (highly recommended)"),
      speed_gte: z.number().optional().describe("Minimum speed in km/h (speed>=value)"),
      speed_lte: z.number().optional().describe("Maximum speed in km/h (speed<=value)"),
      date_gte: z.string().optional().describe("Start datetime filter (ISO 8601, e.g. '2024-03-02T14:00:00'). Highly recommended to limit data volume."),
      date_lte: z.string().optional().describe("End datetime filter (ISO 8601, e.g. '2024-03-02T14:00:10'). Highly recommended to limit data volume."),
    },
    async (params) => {
      try {
        const apiParams: Record<string, string | number | undefined> = {
          session_key: params.session_key,
          driver_number: params.driver_number,
        };
        if (params.speed_gte !== undefined) apiParams["speed>="] = params.speed_gte;
        if (params.speed_lte !== undefined) apiParams["speed<="] = params.speed_lte;
        if (params.date_gte !== undefined) apiParams["date>="] = params.date_gte;
        if (params.date_lte !== undefined) apiParams["date<="] = params.date_lte;

        const warning =
          !params.date_gte && !params.date_lte
            ? "WARNING: No date filters provided. car_data returns very large datasets (multiple samples per second per car). Consider adding date_gte and date_lte to narrow the time window."
            : undefined;

        const url = openf1Url("/car_data", apiParams);
        const data = await fetchJson(url);
        return formatWithWarning(data, warning);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. get_intervals
  server.tool(
    "openf1_get_intervals",
    "Get interval data showing the gap between drivers and the leader during a session.",
    {
      session_key: z.number().describe("Session identifier (required)"),
      driver_number: z.number().optional().describe("Filter by driver number"),
    },
    async (params) => {
      try {
        const url = openf1Url("/intervals", params);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 7. get_stints
  server.tool(
    "openf1_get_stints",
    "Get stint data including tire compound, stint number, lap counts, and tire age for each driver.",
    {
      session_key: z.number().describe("Session identifier (required)"),
      driver_number: z.number().optional().describe("Filter by driver number"),
      compound: z.string().optional().describe("Tire compound filter (e.g. 'SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET')"),
    },
    async (params) => {
      try {
        const url = openf1Url("/stints", params);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 8. get_pit
  server.tool(
    "openf1_get_pit",
    "Get pit stop data including pit lane time and duration for each stop.",
    {
      session_key: z.number().describe("Session identifier (required)"),
      driver_number: z.number().optional().describe("Filter by driver number"),
      pit_duration_lte: z.number().optional().describe("Maximum pit duration in seconds (pit_duration<=value)"),
    },
    async (params) => {
      try {
        const apiParams: Record<string, string | number | undefined> = {
          session_key: params.session_key,
          driver_number: params.driver_number,
        };
        if (params.pit_duration_lte !== undefined) apiParams["pit_duration<="] = params.pit_duration_lte;

        const url = openf1Url("/pit", apiParams);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 9. get_race_control
  server.tool(
    "openf1_get_race_control",
    "Get race control messages: flags, safety cars, penalties, track status changes, and other official messages.",
    {
      session_key: z.number().describe("Session identifier (required)"),
      flag: z.string().optional().describe("Flag type filter (e.g. 'YELLOW', 'RED', 'GREEN', 'CHEQUERED')"),
      category: z.string().optional().describe("Message category filter (e.g. 'Flag', 'SafetyCar', 'Drs')"),
    },
    async (params) => {
      try {
        const url = openf1Url("/race_control", params);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 10. get_weather
  server.tool(
    "openf1_get_weather",
    "Get weather data for a session: air/track temperature, humidity, pressure, wind speed/direction, rainfall.",
    {
      session_key: z.number().describe("Session identifier (required)"),
      date_gte: z.string().optional().describe("Start datetime filter (ISO 8601)"),
      date_lte: z.string().optional().describe("End datetime filter (ISO 8601)"),
    },
    async (params) => {
      try {
        const apiParams: Record<string, string | number | undefined> = {
          session_key: params.session_key,
        };
        if (params.date_gte !== undefined) apiParams["date>="] = params.date_gte;
        if (params.date_lte !== undefined) apiParams["date<="] = params.date_lte;

        const url = openf1Url("/weather", apiParams);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 11. get_team_radio
  server.tool(
    "openf1_get_team_radio",
    "Get team radio message metadata for a session. Returns URLs to audio recordings of driver-engineer communications.",
    {
      session_key: z.number().describe("Session identifier (required)"),
      driver_number: z.number().optional().describe("Filter by driver number"),
    },
    async (params) => {
      try {
        const url = openf1Url("/team_radio", params);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 12. get_meetings
  server.tool(
    "openf1_get_meetings",
    "Get meeting (race weekend/event) information. A meeting groups multiple sessions at one circuit.",
    {
      meeting_key: z.number().optional().describe("Unique meeting identifier"),
      year: z.number().optional().describe("Season year (e.g. 2024)"),
      country_name: z.string().optional().describe("Country name (e.g. 'Italy', 'Monaco')"),
    },
    async (params) => {
      try {
        const url = openf1Url("/meetings", params);
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
