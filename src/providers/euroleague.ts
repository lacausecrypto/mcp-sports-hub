import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buildUrl, fetchJson, safe, toolResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// EuroLeague / EuroCup (Euroleague Basketball official feeds) — 6 tools
// Bases: https://api-live.euroleague.net/v2  (JSON: games, clubs, rounds)
//        https://live.euroleague.net/api     (JSON: per-game header/box/pbp)
// Auth: none (keyless). Top European club basketball, not covered elsewhere.
// competition: "E" = EuroLeague, "U" = EuroCup. seasonCode = competition + year
//   (e.g. E2024, U2024). Note: the v1 schedules/standings feeds are XML and are
//   intentionally NOT wrapped here — this provider stays JSON-only.
// ---------------------------------------------------------------------------

const V2 = "https://api-live.euroleague.net/v2";
const LIVE = "https://live.euroleague.net/api";

const competition = z.enum(["E", "U"]).default("E").describe('Competition: "E" = EuroLeague, "U" = EuroCup');
const seasonYear = z.number().int().min(2000).max(2099).describe("Season start year (e.g. 2024 for the 2024-25 season)");

const seasonCode = (comp: string, year: number) => `${comp}${year}`;

export function register(server: McpServer): void {
  // 1. games — full season schedule + results
  server.tool(
    "euroleague_get_games",
    "Get all EuroLeague/EuroCup games for a season (teams, scores, dates, round, status).",
    { competition, season_year: seasonYear },
    safe(async ({ competition, season_year }) =>
      toolResult(await fetchJson(`${V2}/competitions/${competition}/seasons/${seasonCode(competition, season_year)}/games`)),
    ),
  );

  // 2. clubs
  server.tool(
    "euroleague_get_clubs",
    "List the clubs participating in a EuroLeague/EuroCup season (names, codes, venues, country).",
    { competition, season_year: seasonYear },
    safe(async ({ competition, season_year }) =>
      toolResult(await fetchJson(`${V2}/competitions/${competition}/seasons/${seasonCode(competition, season_year)}/clubs`)),
    ),
  );

  // 3. rounds
  server.tool(
    "euroleague_get_rounds",
    "List the rounds (game days) of a EuroLeague/EuroCup season.",
    { competition, season_year: seasonYear },
    safe(async ({ competition, season_year }) =>
      toolResult(await fetchJson(`${V2}/competitions/${competition}/seasons/${seasonCode(competition, season_year)}/rounds`)),
    ),
  );

  // 4. game header — summary (scores by quarter, coaches, top stats)
  server.tool(
    "euroleague_get_game_header",
    "Get a game's header/summary: final and per-quarter scores, teams, coaches. Use a game code from euroleague_get_games.",
    { game_code: z.number().int().positive().describe("Game code (from euroleague_get_games)"), competition, season_year: seasonYear },
    safe(async ({ game_code, competition, season_year }) =>
      toolResult(await fetchJson(buildUrl(`${LIVE}/Header`, { gamecode: game_code, seasoncode: seasonCode(competition, season_year) }))),
    ),
  );

  // 5. game boxscore
  server.tool(
    "euroleague_get_game_boxscore",
    "Get a game's full box score (per-player and team stats for both teams). Use a game code from euroleague_get_games.",
    { game_code: z.number().int().positive().describe("Game code"), competition, season_year: seasonYear },
    safe(async ({ game_code, competition, season_year }) =>
      toolResult(await fetchJson(buildUrl(`${LIVE}/Boxscore`, { gamecode: game_code, seasoncode: seasonCode(competition, season_year) }))),
    ),
  );

  // 6. game play-by-play
  server.tool(
    "euroleague_get_game_playbyplay",
    "Get a game's full play-by-play feed (every event by quarter). Use a game code from euroleague_get_games.",
    { game_code: z.number().int().positive().describe("Game code"), competition, season_year: seasonYear },
    safe(async ({ game_code, competition, season_year }) =>
      toolResult(await fetchJson(buildUrl(`${LIVE}/PlayByPlay`, { gamecode: game_code, seasoncode: seasonCode(competition, season_year) }))),
    ),
  );
}
