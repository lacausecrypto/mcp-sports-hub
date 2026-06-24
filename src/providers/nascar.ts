import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, pathSegment, safe, toolResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// NASCAR (nascar.com public CDN feeds) — 3 tools
// Base: https://cf.nascar.com
// Auth: none. UNOFFICIAL/undocumented (NASCAR.com's own S3+CloudFront backend).
//   Read-only JSON, can change without notice (like the ESPN provider).
// Series ids: 1 = Cup, 2 = Xfinity, 3 = Craftsman Truck.
// ---------------------------------------------------------------------------

const BASE = "https://cf.nascar.com";

const seriesId = z
  .number()
  .int()
  .min(1)
  .max(3)
  .describe("Series id: 1 = Cup, 2 = Xfinity, 3 = Craftsman Truck");

export function register(server: McpServer): void {
  // 1. schedule — full season race list (incl. results for past races)
  server.tool(
    "nascar_get_schedule",
    "Get the NASCAR race schedule for a season and series, including track, dates, winners and stage info for completed races.",
    {
      year: z.number().int().min(1949).max(2099).describe("Season year (e.g. 2026)"),
      series_id: seriesId,
    },
    safe(async ({ year, series_id }) =>
      toolResult(
        await fetchJson(`${BASE}/cacher/${pathSegment(year)}/${pathSegment(series_id)}/race_list_basic.json`),
      ),
    ),
  );

  // 2. live — current race live feed (lap/flag/leader/vehicle telemetry)
  server.tool(
    "nascar_get_live",
    "Get the live race feed: current lap, flag state, laps to go, leader and per-vehicle running order. When no race is live, fields are in an idle state (flag_state 9, race_id -1).",
    {},
    safe(async () => toolResult(await fetchJson(`${BASE}/cacher/live/live-feed.json`))),
  );

  // 3. lap times — per-driver lap times/speeds for a specific race
  server.tool(
    "nascar_get_lap_times",
    "Get per-driver lap times and speeds for a specific race. Use the race_id from nascar_get_schedule.",
    {
      year: z.number().int().min(1949).max(2099).describe("Season year"),
      series_id: seriesId,
      race_id: z.number().int().positive().describe("Race id from nascar_get_schedule"),
    },
    safe(async ({ year, series_id, race_id }) =>
      toolResult(
        await fetchJson(
          `${BASE}/cacher/${pathSegment(year)}/${pathSegment(series_id)}/${pathSegment(race_id)}/lap-times.json`,
        ),
      ),
    ),
  );
}
