import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  buildUrl,
  errorResult,
  fetchJson,
  fetchNdjson,
  pathSegment,
  toolResult,
} from "../shared/http.js";

// ---------------------------------------------------------------------------
// Lichess provider — 7 tools
// Base: https://lichess.org/
// Auth: none for read-only public endpoints (rate limit ≈ 20 req/sec/IP).
// Several endpoints stream NDJSON; we parse them into JSON arrays.
// ---------------------------------------------------------------------------

const BASE = "https://lichess.org";

const PerfType = z
  .enum([
    "ultraBullet",
    "bullet",
    "blitz",
    "rapid",
    "classical",
    "chess960",
    "crazyhouse",
    "antichess",
    "atomic",
    "horde",
    "kingOfTheHill",
    "racingKings",
    "threeCheck",
  ])
  .describe("Performance variant key");

export function register(server: McpServer): void {
  // 1. lichess_get_user — full profile and per-variant ratings
  server.tool(
    "lichess_get_user",
    "Get a Lichess user's public profile, including per-variant ratings, played games, and account flags.",
    {
      username: z.string().describe("Lichess username (case-insensitive)"),
    },
    async ({ username }) => {
      try {
        const data = await fetchJson(`${BASE}/api/user/${pathSegment(username)}`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. lichess_get_users_status — bulk online / streaming flags
  server.tool(
    "lichess_get_users_status",
    "Get realtime online + streaming status for up to 100 Lichess users in a single call.",
    {
      ids: z
        .string()
        .describe("Comma-separated usernames (max 100), e.g. \"thibault,DrDrunkenstein\""),
    },
    async ({ ids }) => {
      try {
        const url = buildUrl(`${BASE}/api/users/status`, { ids });
        const data = await fetchJson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. lichess_get_top_players — top-N leaderboard for a variant
  server.tool(
    "lichess_get_top_players",
    "Get the top N players for a Lichess performance variant (bullet, blitz, rapid, classical, etc.).",
    {
      perf: PerfType,
      n: z
        .number()
        .int()
        .min(1)
        .max(200)
        .default(10)
        .describe("Number of top players to return (1-200, default 10)"),
    },
    async ({ perf, n }) => {
      try {
        const data = await fetchJson(`${BASE}/api/player/top/${n}/${pathSegment(perf)}`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. lichess_get_team — team info (description, members count, leaders)
  server.tool(
    "lichess_get_team",
    "Get information about a Lichess team: description, member count, leader, open/closed status.",
    {
      team_id: z.string().describe("Team id (URL slug, e.g. \"lichess-swiss\")"),
    },
    async ({ team_id }) => {
      try {
        const data = await fetchJson(`${BASE}/api/team/${pathSegment(team_id)}`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. lichess_get_tournaments — open Arena tournaments (created/started/finished)
  server.tool(
    "lichess_get_tournaments",
    "Get current Lichess Arena tournaments (created, started, and recently finished).",
    {},
    async () => {
      try {
        const data = await fetchJson(`${BASE}/api/tournament`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. lichess_get_broadcasts — official broadcasts (NDJSON stream → JSON array)
  server.tool(
    "lichess_get_broadcasts",
    "List official Lichess broadcast tournaments (live coverage of OTB events). Returns up to ~20 most recent.",
    {
      max: z
        .number()
        .int()
        .min(1)
        .max(50)
        .default(20)
        .describe("Max broadcasts to return (1-50, default 20)"),
    },
    async ({ max }) => {
      try {
        const url = buildUrl(`${BASE}/api/broadcast`, { nb: max });
        const data = await fetchNdjson(url);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 7. lichess_get_daily_puzzle — puzzle of the day
  server.tool(
    "lichess_get_daily_puzzle",
    "Get the Lichess puzzle of the day, including the source game and the solution moves.",
    {},
    async () => {
      try {
        const data = await fetchJson(`${BASE}/api/puzzle/daily`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
