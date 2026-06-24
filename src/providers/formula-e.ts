import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buildUrl, fetchJson, pathSegment, safe, toolResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Formula E (Pulselive backend) — 7 tools
// Base: https://api.formula-e.pulselive.com/formula-e/v1
// Auth: none. UNOFFICIAL/undocumented API (same Pulselive infra as MotoGP).
//   Read-only, GET-only. Can change without notice (like the ESPN provider).
// Note: there is no /seasons endpoint — use /championships. Standings require a
//   championshipId (from /championships).
// ---------------------------------------------------------------------------

const BASE = "https://api.formula-e.pulselive.com/formula-e/v1";

export function register(server: McpServer): void {
  // 1. championships — every season (2014-15 to present), with championshipId
  server.tool(
    "formulae_get_championships",
    "List Formula E championships (one per season, from 2014-15 to the current season) with their ids and status. The `id` (championshipId) feeds the standings tools.",
    {},
    safe(async () => toolResult(await fetchJson(`${BASE}/championships`))),
  );

  // 2. races — E-Prix list (paginated)
  server.tool(
    "formulae_get_races",
    "List Formula E races / E-Prix with id, name, country, city, date and result-availability flags. Paginated — use `page` to advance. Each race id feeds formulae_get_race / formulae_get_race_results.",
    {
      page: z.number().int().min(0).optional().describe("Page number (0-based)"),
    },
    safe(async ({ page }) => toolResult(await fetchJson(buildUrl(`${BASE}/races`, { page })))),
  );

  // 3. race — single race detail
  server.tool(
    "formulae_get_race",
    "Get details for a single Formula E race (sessions, circuit, schedule). Use a race id from formulae_get_races.",
    {
      race_id: z.string().min(1).describe("Race id from formulae_get_races"),
    },
    safe(async ({ race_id }) =>
      toolResult(await fetchJson(`${BASE}/races/${pathSegment(race_id)}`)),
    ),
  );

  // 4. race results — classification of a race
  server.tool(
    "formulae_get_race_results",
    "Get the race results / classification for a Formula E race (driver, team, position, points). Use a race id from formulae_get_races.",
    {
      race_id: z.string().min(1).describe("Race id from formulae_get_races"),
    },
    safe(async ({ race_id }) =>
      toolResult(await fetchJson(`${BASE}/races/${pathSegment(race_id)}/race-results`)),
    ),
  );

  // 5. teams
  server.tool(
    "formulae_get_teams",
    "List Formula E teams with wins, podiums and race starts.",
    {},
    safe(async () => toolResult(await fetchJson(`${BASE}/teams`))),
  );

  // 6. driver standings
  server.tool(
    "formulae_get_driver_standings",
    "Get the Formula E drivers' championship standings for a championship (season). Pass a championshipId from formulae_get_championships.",
    {
      championship_id: z.string().min(1).describe("Championship id from formulae_get_championships"),
    },
    safe(async ({ championship_id }) =>
      toolResult(await fetchJson(buildUrl(`${BASE}/standings/drivers`, { championshipId: championship_id }))),
    ),
  );

  // 7. team standings
  server.tool(
    "formulae_get_team_standings",
    "Get the Formula E teams' championship standings for a championship (season). Pass a championshipId from formulae_get_championships.",
    {
      championship_id: z.string().min(1).describe("Championship id from formulae_get_championships"),
    },
    safe(async ({ championship_id }) =>
      toolResult(await fetchJson(buildUrl(`${BASE}/standings/teams`, { championshipId: championship_id }))),
    ),
  );
}
