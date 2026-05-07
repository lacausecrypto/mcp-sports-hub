import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { errorResult, fetchJson, pathSegment, toolResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// Chess.com Published-Data API — 7 tools
// Base: https://api.chess.com/pub/
// Auth: none. Public read-only data. Recommended UA per docs:
//   "User-Agent: <app name> <contact>" — our shared User-Agent is good enough.
// Rate limit: per chess.com docs, parallel requests can be throttled with 429.
// ---------------------------------------------------------------------------

const BASE = "https://api.chess.com/pub";

export function register(server: McpServer): void {
  // 1. chesscom_get_player — basic profile
  server.tool(
    "chesscom_get_player",
    "Get a Chess.com player's public profile (name, country, joined date, last online, title, etc.).",
    {
      username: z.string().describe("Chess.com username (case-insensitive)"),
    },
    async ({ username }) => {
      try {
        const data = await fetchJson(`${BASE}/player/${pathSegment(username.toLowerCase())}`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 2. chesscom_get_player_stats — ratings + records per time control
  server.tool(
    "chesscom_get_player_stats",
    "Get a Chess.com player's stats by time control (daily, rapid, blitz, bullet) and chess960, with current ratings, best, and W/L/D records.",
    {
      username: z.string().describe("Chess.com username (case-insensitive)"),
    },
    async ({ username }) => {
      try {
        const data = await fetchJson(`${BASE}/player/${pathSegment(username.toLowerCase())}/stats`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 3. chesscom_get_player_clubs — clubs the user belongs to
  server.tool(
    "chesscom_get_player_clubs",
    "Get the list of Chess.com clubs a player belongs to (with last-activity timestamps).",
    {
      username: z.string().describe("Chess.com username"),
    },
    async ({ username }) => {
      try {
        const data = await fetchJson(`${BASE}/player/${pathSegment(username.toLowerCase())}/clubs`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 4. chesscom_get_player_archives — list of available game archives (year/month)
  server.tool(
    "chesscom_get_player_archives",
    "List the YYYY/MM archive URLs containing a player's monthly game history.",
    {
      username: z.string().describe("Chess.com username"),
    },
    async ({ username }) => {
      try {
        const data = await fetchJson(`${BASE}/player/${pathSegment(username.toLowerCase())}/games/archives`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 5. chesscom_get_club — club info (name, members, country, etc.)
  server.tool(
    "chesscom_get_club",
    "Get Chess.com club details by URL id (the slug after /club/ in the web URL).",
    {
      club_id: z.string().describe('Club URL id, e.g. "chess-com-developer-community"'),
    },
    async ({ club_id }) => {
      try {
        const data = await fetchJson(`${BASE}/club/${pathSegment(club_id)}`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 6. chesscom_get_country_players — top titled players in a country
  server.tool(
    "chesscom_get_country_players",
    "Get the list of titled Chess.com players from a country (returns usernames and titles).",
    {
      country: z.string().describe('ISO 3166 alpha-2 country code, e.g. "US", "FR", "IN"'),
    },
    async ({ country }) => {
      try {
        const data = await fetchJson(`${BASE}/country/${pathSegment(country.toUpperCase())}/players`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );

  // 7. chesscom_get_leaderboards — global live + daily leaderboards
  server.tool(
    "chesscom_get_leaderboards",
    "Get Chess.com global leaderboards across all categories (daily, daily960, live_rapid, live_blitz, live_bullet, tactics, rush, battle).",
    {},
    async () => {
      try {
        const data = await fetchJson(`${BASE}/leaderboards`);
        return toolResult(data);
      } catch (err) {
        return errorResult(err instanceof Error ? err.message : String(err));
      }
    },
  );
}
