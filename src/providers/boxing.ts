import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buildUrl, fetchJson, pathSegment, safe, toolResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Boxing Data API (boxing-data.com, via RapidAPI) — 8 tools
// Base: https://boxing-data-api.p.rapidapi.com/v1
// Auth: RapidAPI key in the X-RapidAPI-Key header (env BOXING_DATA_API_KEY).
//   Free "Basic" plan = 100 requests/month — use sparingly.
// Fills the pro-boxing gap (distinct from the MMA provider).
// ---------------------------------------------------------------------------

const BASE = "https://boxing-data-api.p.rapidapi.com/v1";
const HOST = "boxing-data-api.p.rapidapi.com";

export function register(server: McpServer): void {
  const KEY = process.env.BOXING_DATA_API_KEY;

  function headers(): Record<string, string> {
    if (!KEY) {
      throw new Error(
        "BOXING_DATA_API_KEY env var is required. Get a free RapidAPI key (100 req/mo) at https://rapidapi.com/ (Boxing Data API by boxing-data.com).",
      );
    }
    return { "X-RapidAPI-Key": KEY, "X-RapidAPI-Host": HOST };
  }

  const get = (path: string, params?: Record<string, string | number | undefined>) =>
    fetchJson(buildUrl(`${BASE}${path}`, params), { headers: headers() });

  // 1. fighters — search/list
  server.tool(
    "boxing_get_fighters",
    "Search or list boxers (records W/L/D, KOs, division, titles, physicals). Filter by name/division.",
    {
      name: z.string().optional().describe("Filter by fighter name"),
      division_id: z.string().optional().describe("Filter by division id"),
      page_num: z.number().int().min(1).optional().describe("Page number"),
      page_size: z.number().int().min(1).max(100).optional().describe("Results per page"),
    },
    safe(async ({ name, division_id, page_num, page_size }) =>
      toolResult(await get("/fighters/", { name, division_id, page_num, page_size })),
    ),
  );

  // 2. fighter by id
  server.tool(
    "boxing_get_fighter",
    "Get a single boxer's full profile by id (career record, stats, titles, bio).",
    { fighter_id: z.string().min(1).describe("Fighter id (from boxing_get_fighters)") },
    safe(async ({ fighter_id }) => toolResult(await get(`/fighters/${pathSegment(fighter_id)}`))),
  );

  // 3. events — fight cards
  server.tool(
    "boxing_get_events",
    "List boxing events / fight cards (date, venue, broadcaster, bouts).",
    {
      page_num: z.number().int().min(1).optional().describe("Page number"),
      page_size: z.number().int().min(1).max(100).optional().describe("Results per page"),
      date_sort: z.enum(["ASC", "DESC"]).optional().describe("Sort by date"),
    },
    safe(async ({ page_num, page_size, date_sort }) =>
      toolResult(await get("/events/", { page_num, page_size, date_sort })),
    ),
  );

  // 4. event by id
  server.tool(
    "boxing_get_event",
    "Get a single boxing event by id (full card with bouts and results).",
    { event_id: z.string().min(1).describe("Event id (from boxing_get_events)") },
    safe(async ({ event_id }) => toolResult(await get(`/events/${pathSegment(event_id)}`))),
  );

  // 5. bouts
  server.tool(
    "boxing_get_bouts",
    "List boxing bouts (matchups, results, scorecards, titles on the line).",
    {
      page_num: z.number().int().min(1).optional().describe("Page number"),
      page_size: z.number().int().min(1).max(100).optional().describe("Results per page"),
    },
    safe(async ({ page_num, page_size }) => toolResult(await get("/bouts/", { page_num, page_size }))),
  );

  // 6. bout by id
  server.tool(
    "boxing_get_bout",
    "Get a single bout by id (fighters, result, method, rounds, scorecards).",
    { bout_id: z.string().min(1).describe("Bout id (from boxing_get_bouts)") },
    safe(async ({ bout_id }) => toolResult(await get(`/bouts/${pathSegment(bout_id)}`))),
  );

  // 7. divisions
  server.tool(
    "boxing_get_divisions",
    "List boxing weight divisions with their ids.",
    {},
    safe(async () => toolResult(await get("/divisions/"))),
  );

  // 8. titles
  server.tool(
    "boxing_get_titles",
    "List boxing titles/belts and sanctioning organizations.",
    {},
    safe(async () => toolResult(await get("/titles/"))),
  );
}
