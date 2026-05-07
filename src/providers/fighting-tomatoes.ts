import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, pathSegment, safe } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Fighting Tomatoes (MMA) provider — 8 tools
// Base: https://fightingtomatoes.com/api/
// Auth: Authorization: Bearer {key}
// ---------------------------------------------------------------------------

export function register(server: McpServer): void {
  const API_KEY = process.env.FIGHTING_TOMATOES_API_KEY;
  const BASE = "https://fightingtomatoes.com/api";

  async function apiRequest(path: string, params?: Record<string, string | number | undefined>) {
    if (!API_KEY) throw new Error("FIGHTING_TOMATOES_API_KEY env var is required. Get your free API key at https://fightingtomatoes.com/API");
    const url = buildUrl(`${BASE}/${path.replace(/^\//, "")}`, params);
    return fetchJson(url, { headers: { Authorization: `Bearer ${API_KEY}` } });
  }

  // 1. mma_search_fighters
  server.tool(
    "mma_search_fighters",
    "Search MMA fighters by name. Returns a list of matching fighters with basic info.",
    { name: z.string().describe("Fighter name or partial name to search for") },
    safe(async ({ name }: { name: string }) => {
      const data = await apiRequest("fighters/search", { name });
      return toolResult(data);
    }),
  );

  // 2. mma_get_fighter
  server.tool(
    "mma_get_fighter",
    "Get detailed information about a specific MMA fighter including record, stats, and bio.",
    { fighter_id: z.string().describe("Unique fighter identifier") },
    safe(async ({ fighter_id }: { fighter_id: string }) => {
      const data = await apiRequest(`fighters/${pathSegment(fighter_id)}`);
      return toolResult(data);
    }),
  );

  // 3. mma_get_fighter_fights
  server.tool(
    "mma_get_fighter_fights",
    "Get the complete fight history for a specific MMA fighter.",
    { fighter_id: z.string().describe("Unique fighter identifier") },
    safe(async ({ fighter_id }: { fighter_id: string }) => {
      const data = await apiRequest(`fighters/${pathSegment(fighter_id)}/fights`);
      return toolResult(data);
    }),
  );

  // 4. mma_get_events
  server.tool(
    "mma_get_events",
    "List MMA events. Optionally filter by organization and date. Supports pagination.",
    {
      organization: z.string().optional().describe("Filter by organization (e.g. UFC, Bellator, ONE, PFL)"),
      date: z.string().optional().describe("Filter by date (YYYY-MM-DD format)"),
      page: z.number().int().positive().optional().describe("Page number for pagination (default: 1)"),
    },
    safe(async ({ organization, date, page }: { organization?: string; date?: string; page?: number }) => {
      const data = await apiRequest("events", { organization, date, page });
      return toolResult(data);
    }),
  );

  // 5. mma_get_event
  server.tool(
    "mma_get_event",
    "Get detailed information about a specific MMA event including its fight card.",
    { event_id: z.string().describe("Unique event identifier") },
    safe(async ({ event_id }: { event_id: string }) => {
      const data = await apiRequest(`events/${pathSegment(event_id)}`);
      return toolResult(data);
    }),
  );

  // 6. mma_get_fight
  server.tool(
    "mma_get_fight",
    "Get detailed information about a specific MMA fight including result, method, round, and time.",
    { fight_id: z.string().describe("Unique fight identifier") },
    safe(async ({ fight_id }: { fight_id: string }) => {
      const data = await apiRequest(`fights/${pathSegment(fight_id)}`);
      return toolResult(data);
    }),
  );

  // 7. mma_get_organizations
  server.tool(
    "mma_get_organizations",
    "List all MMA organizations available in the database (UFC, Bellator, ONE, PFL, etc.).",
    {},
    safe(async () => {
      const data = await apiRequest("organizations");
      return toolResult(data);
    }),
  );

  // 8. mma_get_upcoming_events
  server.tool(
    "mma_get_upcoming_events",
    "Get upcoming MMA events. Optionally filter by organization.",
    {
      organization: z.string().optional().describe("Filter by organization (e.g. UFC, Bellator, ONE, PFL)"),
    },
    safe(async ({ organization }: { organization?: string }) => {
      const data = await apiRequest("events/upcoming", { organization });
      return toolResult(data);
    }),
  );
}
