import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buildUrl, fetchJson, pathSegment, safe, toolResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// MotoGP (Dorna / Pulselive backend) — 7 tools
// Base: https://api.motogp.pulselive.com/motogp/v1
// Auth: none. UNOFFICIAL/undocumented API (reverse-engineered from motogp.com).
//   Read-only, GET-only. Like the ESPN provider, it can change without notice.
// Covers MotoGP / Moto2 / Moto3 / MotoE. Results use a chained UUID lookup:
//   seasons -> categories(seasonUuid) -> events(seasonUuid) ->
//   sessions(eventUuid, categoryUuid) -> session classification(sessionId).
// ---------------------------------------------------------------------------

const BASE = "https://api.motogp.pulselive.com/motogp/v1";

export function register(server: McpServer): void {
  // 1. seasons — list seasons with their UUIDs (needed for every other call)
  server.tool(
    "motogp_get_seasons",
    "List MotoGP seasons with their UUIDs and year. The `id` (seasonUuid) feeds the categories/events/standings tools. `current:true` marks the live season.",
    {},
    safe(async () => toolResult(await fetchJson(`${BASE}/results/seasons`))),
  );

  // 2. categories — MotoGP/Moto2/Moto3/MotoE UUIDs for a season
  server.tool(
    "motogp_get_categories",
    "List the racing categories (MotoGP, Moto2, Moto3, MotoE) for a season, with their UUIDs. Use a seasonUuid from motogp_get_seasons; the returned categoryUuid feeds sessions and standings.",
    {
      season_uuid: z.string().min(1).describe("Season UUID from motogp_get_seasons"),
    },
    safe(async ({ season_uuid }) =>
      toolResult(await fetchJson(buildUrl(`${BASE}/results/categories`, { seasonUuid: season_uuid }))),
    ),
  );

  // 3. events — Grands Prix in a season
  server.tool(
    "motogp_get_events",
    "List the events (Grands Prix) in a season with circuit, country and dates. Each event's UUID feeds motogp_get_sessions.",
    {
      season_uuid: z.string().min(1).describe("Season UUID from motogp_get_seasons"),
      is_finished: z.boolean().optional().describe("Filter to finished events only"),
    },
    safe(async ({ season_uuid, is_finished }) =>
      toolResult(
        await fetchJson(buildUrl(`${BASE}/results/events`, { seasonUuid: season_uuid, isFinished: is_finished })),
      ),
    ),
  );

  // 4. sessions — FP/Q/RAC sessions for an event+category
  server.tool(
    "motogp_get_sessions",
    "List the sessions (practice, qualifying, race, etc.) for an event and category. Pass eventUuid from motogp_get_events and categoryUuid from motogp_get_categories. Each session id feeds motogp_get_session_classification.",
    {
      event_uuid: z.string().min(1).describe("Event UUID from motogp_get_events"),
      category_uuid: z.string().min(1).describe("Category UUID from motogp_get_categories"),
    },
    safe(async ({ event_uuid, category_uuid }) =>
      toolResult(
        await fetchJson(buildUrl(`${BASE}/results/sessions`, { eventUuid: event_uuid, categoryUuid: category_uuid })),
      ),
    ),
  );

  // 5. session classification — full results of a session
  server.tool(
    "motogp_get_session_classification",
    "Get the full classification (results) of a session: rider, team, constructor, time/gap and points. Use a session id from motogp_get_sessions.",
    {
      session_id: z.string().min(1).describe("Session id from motogp_get_sessions"),
      test: z.boolean().optional().describe("Set true for test sessions (default false)"),
    },
    safe(async ({ session_id, test }) =>
      toolResult(
        await fetchJson(
          buildUrl(`${BASE}/results/session/${pathSegment(session_id)}/classification`, { test: test ?? false }),
        ),
      ),
    ),
  );

  // 6. standings — championship table for a season+category
  server.tool(
    "motogp_get_standings",
    "Get the championship standings for a season and category (riders' or constructors' points table). Pass seasonUuid and categoryUuid.",
    {
      season_uuid: z.string().min(1).describe("Season UUID from motogp_get_seasons"),
      category_uuid: z.string().min(1).describe("Category UUID from motogp_get_categories"),
    },
    safe(async ({ season_uuid, category_uuid }) =>
      toolResult(
        await fetchJson(buildUrl(`${BASE}/results/standings`, { seasonUuid: season_uuid, categoryUuid: category_uuid })),
      ),
    ),
  );

  // 7. riders — rider directory
  server.tool(
    "motogp_get_riders",
    "List MotoGP riders with their profile data (name, number, country, team). Optionally filter by category UUID.",
    {
      category_uuid: z.string().optional().describe("Category UUID to filter riders (optional)"),
    },
    safe(async ({ category_uuid }) =>
      toolResult(await fetchJson(buildUrl(`${BASE}/riders`, { categoryUuid: category_uuid }))),
    ),
  );
}
