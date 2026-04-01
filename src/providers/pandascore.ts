import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, buildUrl, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

const BASE = "https://api.pandascore.co";
const ENV_KEY = "PANDASCORE_TOKEN";

function getHeaders(): Record<string, string> {
  const token = process.env[ENV_KEY];
  if (!token) {
    throw new Error(
      `${ENV_KEY} environment variable is not set. Get a free token at https://pandascore.co/`,
    );
  }
  return { Authorization: `Bearer ${token}` };
}

function pandaUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  return buildUrl(`${BASE}${path}`, params);
}

async function pandaFetch(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
) {
  const url = pandaUrl(path, params);
  return fetchJson(url, { headers: getHeaders() });
}

// ---------------------------------------------------------------------------
// Shared Zod schemas
// ---------------------------------------------------------------------------

const VideogameParam = z
  .enum([
    "lol",
    "cs-2",
    "dota-2",
    "valorant",
    "ow",
    "codmw",
    "r6siege",
    "rl",
    "ea-sports-fc",
    "king-of-glory",
    "pubg",
    "starcraft-2",
    "free-fire",
  ])
  .optional()
  .describe(
    "Videogame slug filter: lol, cs-2, dota-2, valorant, ow, codmw, r6siege, rl, ea-sports-fc, king-of-glory, pubg, starcraft-2, free-fire",
  );

const PageParam = z
  .number()
  .int()
  .positive()
  .optional()
  .describe("Page number for pagination (default 1)");

const PerPageParam = z
  .number()
  .int()
  .positive()
  .max(100)
  .optional()
  .describe("Results per page, max 100 (default 50)");

const SortParam = z
  .string()
  .optional()
  .describe(
    'Sort field and direction, e.g. "begin_at" or "-scheduled_at" (prefix with - for descending)',
  );

const SearchParam = z
  .string()
  .optional()
  .describe("Search term to filter results by name");

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

export function register(server: McpServer): void {
  // 1. get_matches
  server.tool(
    "pandascore_get_matches",
    "List esports matches from PandaScore. Filter by upcoming/running/past and by videogame title. Covers 13 esports titles including LoL, CS2, Dota 2, Valorant, Overwatch, and more.",
    {
      filter_type: z
        .enum(["upcoming", "running", "past"])
        .optional()
        .describe(
          'Filter matches by status: "upcoming", "running", or "past". Omit for all matches.',
        ),
      videogame: VideogameParam,
      page: PageParam,
      per_page: PerPageParam,
      sort: SortParam,
    },
    async ({ filter_type, videogame, page, per_page, sort }) => {
      try {
        const path = filter_type ? `/matches/${filter_type}` : "/matches";
        const data = await pandaFetch(path, {
          "filter[videogame]": videogame,
          "page[number]": page,
          "page[size]": per_page,
          sort,
        });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. get_match
  server.tool(
    "pandascore_get_match",
    "Get detailed information about a specific esports match, including teams, scores, games, streams, and results.",
    {
      match_id: z.number().int().positive().describe("PandaScore match ID"),
    },
    async ({ match_id }) => {
      try {
        const data = await pandaFetch(`/matches/${match_id}`, {});
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. get_tournaments
  server.tool(
    "pandascore_get_tournaments",
    "List esports tournaments. Filter by videogame title. Returns tournament names, dates, prize pools, and participating teams.",
    {
      videogame: VideogameParam,
      page: PageParam,
      per_page: PerPageParam,
      sort: SortParam,
    },
    async ({ videogame, page, per_page, sort }) => {
      try {
        const data = await pandaFetch("/tournaments", {
          "filter[videogame]": videogame,
          "page[number]": page,
          "page[size]": per_page,
          sort,
        });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. get_tournament
  server.tool(
    "pandascore_get_tournament",
    "Get detailed information about a specific esports tournament, including brackets, matches, teams, and prize pool.",
    {
      tournament_id: z
        .number()
        .int()
        .positive()
        .describe("PandaScore tournament ID"),
    },
    async ({ tournament_id }) => {
      try {
        const data = await pandaFetch(`/tournaments/${tournament_id}`, {});
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. get_leagues
  server.tool(
    "pandascore_get_leagues",
    "List esports leagues (e.g., LEC, LCS, ESL Pro League, The International). Filter by videogame title.",
    {
      videogame: VideogameParam,
      page: PageParam,
      per_page: PerPageParam,
      sort: SortParam,
    },
    async ({ videogame, page, per_page, sort }) => {
      try {
        const data = await pandaFetch("/leagues", {
          "filter[videogame]": videogame,
          "page[number]": page,
          "page[size]": per_page,
          sort,
        });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. get_league
  server.tool(
    "pandascore_get_league",
    "Get detailed information about a specific esports league, including series and image URLs.",
    {
      league_id: z.number().int().positive().describe("PandaScore league ID"),
    },
    async ({ league_id }) => {
      try {
        const data = await pandaFetch(`/leagues/${league_id}`, {});
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 7. get_series
  server.tool(
    "pandascore_get_series",
    "List esports series (seasonal groupings within a league, e.g., LEC Spring 2024). Filter by videogame.",
    {
      videogame: VideogameParam,
      page: PageParam,
      per_page: PerPageParam,
      sort: SortParam,
    },
    async ({ videogame, page, per_page, sort }) => {
      try {
        const data = await pandaFetch("/series", {
          "filter[videogame]": videogame,
          "page[number]": page,
          "page[size]": per_page,
          sort,
        });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 8. get_teams
  server.tool(
    "pandascore_get_teams",
    "List esports teams. Filter by videogame title and search by name (e.g., T1, Cloud9, Fnatic).",
    {
      videogame: VideogameParam,
      search: SearchParam,
      page: PageParam,
      per_page: PerPageParam,
    },
    async ({ videogame, search, page, per_page }) => {
      try {
        const data = await pandaFetch("/teams", {
          "filter[videogame]": videogame,
          "search[name]": search,
          "page[number]": page,
          "page[size]": per_page,
        });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 9. get_team
  server.tool(
    "pandascore_get_team",
    "Get detailed information about a specific esports team, including roster, recent results, and current players.",
    {
      team_id: z.number().int().positive().describe("PandaScore team ID"),
    },
    async ({ team_id }) => {
      try {
        const data = await pandaFetch(`/teams/${team_id}`, {});
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 10. get_players
  server.tool(
    "pandascore_get_players",
    "List esports players. Filter by videogame and search by name (e.g., Faker, s1mple, N0tail).",
    {
      videogame: VideogameParam,
      search: SearchParam,
      page: PageParam,
      per_page: PerPageParam,
    },
    async ({ videogame, search, page, per_page }) => {
      try {
        const data = await pandaFetch("/players", {
          "filter[videogame]": videogame,
          "search[name]": search,
          "page[number]": page,
          "page[size]": per_page,
        });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 11. get_player
  server.tool(
    "pandascore_get_player",
    "Get detailed information about a specific esports player, including current team, role, stats, and image.",
    {
      player_id: z.number().int().positive().describe("PandaScore player ID"),
    },
    async ({ player_id }) => {
      try {
        const data = await pandaFetch(`/players/${player_id}`, {});
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 12. get_videogames
  server.tool(
    "pandascore_get_videogames",
    "List all videogame titles available on PandaScore (LoL, CS2, Dota 2, Valorant, Overwatch, CoD, R6, Rocket League, EA FC, King of Glory, PUBG, StarCraft 2, Free Fire).",
    {},
    async () => {
      try {
        const data = await pandaFetch("/videogames", {});
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 13. get_lives
  server.tool(
    "pandascore_get_lives",
    "Get all currently live esports matches across all videogame titles with real-time scores and stream links.",
    {},
    async () => {
      try {
        const data = await pandaFetch("/lives", {});
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 14. get_incidents
  server.tool(
    "pandascore_get_incidents",
    "Get recent changes and incidents (new matches, score updates, roster changes). Useful for tracking updates since a given timestamp.",
    {
      videogame: VideogameParam,
      page: PageParam,
      per_page: PerPageParam,
      since: z
        .string()
        .optional()
        .describe(
          "ISO 8601 datetime to get incidents since (e.g. 2024-01-15T00:00:00Z)",
        ),
    },
    async ({ videogame, page, per_page, since }) => {
      try {
        const data = await pandaFetch("/incidents", {
          "filter[videogame]": videogame,
          "page[number]": page,
          "page[size]": per_page,
          since,
        });
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
