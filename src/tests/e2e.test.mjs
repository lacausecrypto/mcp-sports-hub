/**
 * End-to-end smoke runner for every provider.
 *
 * Loads each provider, captures handlers via a mock McpServer, and invokes
 * one or two representative tools with realistic args. Each tool call hits
 * the real upstream API.
 *
 * Run: node src/tests/e2e.test.mjs            # only no-key providers
 *      node src/tests/e2e.test.mjs --all      # also key-required (skipped if no env key)
 *
 * Output: tabular report of pass/fail/skip per tool with truncated payload preview.
 *
 * NOT registered as `npm test` because it makes ~30 real network calls.
 */

import { readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const providersDir = join(__dirname, "..", "..", "dist", "providers");

const includeAll = process.argv.includes("--all");

// Tool args per provider. Only the providers and tools we want to exercise.
// Each entry: { tool: name, args: object } - tools not listed are skipped.
const TEST_CASES = {
  // ─── No-key providers ────────────────────────────────────────────────────
  "espn.js": [
    { tool: "espn_get_scoreboard", args: { sport: "basketball", league: "nba" } },
    { tool: "espn_get_teams", args: { sport: "basketball", league: "nba", limit: 5 } },
    { tool: "espn_get_news", args: { sport: "football", league: "nfl", limit: 3 } },
  ],
  "nhl.js": [
    { tool: "nhl_get_scores", args: {} },
    { tool: "nhl_get_standings", args: {} },
    { tool: "nhl_get_team_roster", args: { team_abbrev: "TOR" } },
  ],
  "mlb-stats.js": [
    { tool: "mlb_get_schedule", args: {} },
    { tool: "mlb_get_standings", args: { season: "2024" } },
    { tool: "mlb_get_teams", args: {} },
  ],
  "jolpica-f1.js": [
    { tool: "f1_get_race_results", args: { season: "2024", round: "1" } },
    { tool: "f1_get_driver_standings", args: { season: "2024" } },
    { tool: "f1_get_drivers", args: { season: "2024", limit: 5 } },
  ],
  "openf1.js": [
    { tool: "openf1_get_meetings", args: { year: 2024 } },
    { tool: "openf1_get_drivers", args: { meeting_key: 1228 } },
  ],
  "openligadb.js": [
    { tool: "openliga_get_current_matchday", args: { league_shortcut: "bl1" } },
    { tool: "openliga_get_table", args: { league_shortcut: "bl1", season: "2024" } },
    { tool: "openliga_get_available_leagues", args: {} },
  ],
  "golfcourse.js": [
    { tool: "golfcourse_search_courses", args: { search: "Pebble Beach" }, envs: ["GOLFCOURSE_API_KEY"] },
  ],
  "thesportsdb.js": [
    { tool: "sportsdb_search_teams", args: { team_name: "Arsenal" } },
    { tool: "sportsdb_get_league_list", args: {} },
    { tool: "sportsdb_search_players", args: { player_name: "Lionel Messi" } },
  ],
  "ncaa.js": [
    { tool: "ncaa_get_scoreboard", args: { sport: "football", division: "fbs" } },
    { tool: "ncaa_get_rankings", args: { sport: "football", division: "fbs" } },
  ],
  "lichess.js": [
    { tool: "lichess_get_user", args: { username: "thibault" } },
    { tool: "lichess_get_top_players", args: { perf: "blitz", n: 5 } },
    { tool: "lichess_get_daily_puzzle", args: {} },
    { tool: "lichess_get_broadcasts", args: { max: 3 } },
  ],
  "chess-com.js": [
    { tool: "chesscom_get_player", args: { username: "erik" } },
    { tool: "chesscom_get_player_stats", args: { username: "erik" } },
    { tool: "chesscom_get_leaderboards", args: {} },
  ],
  "squiggle.js": [
    { tool: "squiggle_get_teams", args: {} },
    { tool: "squiggle_get_games", args: { year: 2024, round: 1 } },
    { tool: "squiggle_get_sources", args: {} },
  ],
  "motogp.js": [
    { tool: "motogp_get_seasons", args: {} },
    { tool: "motogp_get_riders", args: {} },
  ],
  "formula-e.js": [
    { tool: "formulae_get_championships", args: {} },
    { tool: "formulae_get_races", args: {} },
    { tool: "formulae_get_teams", args: {} },
  ],
  "nascar.js": [
    { tool: "nascar_get_schedule", args: { year: 2025, series_id: 1 } },
    { tool: "nascar_get_live", args: {} },
  ],
  "sleeper.js": [
    { tool: "sleeper_get_nfl_state", args: {} },
    { tool: "sleeper_search_players", args: { query: "mahomes" } },
    { tool: "sleeper_get_trending_players", args: { type: "add", limit: 3 } },
  ],
  "opendota.js": [
    { tool: "opendota_get_pro_matches", args: {} },
    { tool: "opendota_get_heroes", args: {} },
    { tool: "opendota_get_pro_teams", args: {} },
  ],
  "euroleague.js": [
    { tool: "euroleague_get_games", args: { competition: "E", season_year: 2024 } },
    { tool: "euroleague_get_clubs", args: { competition: "E", season_year: 2024 } },
    { tool: "euroleague_get_game_header", args: { game_code: 1, competition: "E", season_year: 2024 } },
  ],
  "football-data-uk.js": [
    { tool: "footballdata_uk_list_leagues", args: {} },
    { tool: "footballdata_uk_get_matches", args: { league: "E0", season: "2425", limit: 5 } },
  ],

  // ─── Key-required providers (skipped if env key missing) ─────────────────
  "boxing.js": [
    { tool: "boxing_get_divisions", args: {}, envs: ["BOXING_DATA_API_KEY"] },
  ],
  "highlightly.js": [
    { tool: "highlightly_get_leagues", args: { sport: "football", limit: 2 }, envs: ["HIGHLIGHTLY_API_KEY"] },
  ],
  "the-odds-api.js": [
    { tool: "odds_get_sports", args: {}, envs: ["THE_ODDS_API_KEY"] },
  ],
  "balldontlie.js": [
    { tool: "bdl_get_teams", args: { sport: "nba" }, envs: ["BALLDONTLIE_API_KEY"] },
  ],
  "api-football.js": [
    { tool: "apifootball_get_leagues", args: { current: true }, envs: ["API_FOOTBALL_KEY"] },
  ],
  "api-sports.js": [
    { tool: "apisports_get_fixtures", args: { sport: "football", league: 39, season: 2024, date: "2024-08-17" }, envs: ["API_SPORTS_KEY"] },
  ],
  "api-tennis.js": [
    { tool: "apitennis_get_seasons", args: {}, envs: ["API_TENNIS_KEY"] },
  ],
  "cricketdata.js": [
    { tool: "cricket_get_current_matches", args: {}, envs: ["CRICKETDATA_API_KEY"] },
  ],
  "entity-sport-cricket.js": [
    { tool: "entitycricket_get_competitions", args: {}, envs: ["ENTITY_SPORT_KEY"] },
  ],
  "football-data.js": [
    { tool: "footballdata_get_competitions", args: {}, envs: ["FOOTBALL_DATA_API_KEY"] },
  ],
  "sportmonks.js": [
    { tool: "sportmonks_get_leagues", args: {}, envs: ["SPORTMONKS_API_KEY"] },
  ],
  "sportsdata-io.js": [
    { tool: "sportsdata_get_teams", args: { sport: "nfl" }, envs: ["SPORTSDATA_IO_KEY"] },
  ],
  "odds-api-io.js": [
    { tool: "oddsio_get_sports", args: {}, envs: ["ODDS_API_IO_KEY"] },
  ],
  "sports-game-odds.js": [
    { tool: "sgo_get_leagues", args: {}, envs: ["SPORTS_GAME_ODDS_KEY"] },
  ],
  "fighting-tomatoes.js": [
    { tool: "mma_get_organizations", args: {}, envs: ["FIGHTING_TOMATOES_API_KEY"] },
  ],
  "live-golf.js": [
    { tool: "livegolf_get_schedule", args: { tour: "pga", year: "2024" }, envs: ["LIVE_GOLF_API_KEY"] },
  ],
  "isportsapi.js": [
    { tool: "isports_get_football_leagues", args: {}, envs: ["ISPORTSAPI_KEY"] },
  ],
  "sportdevs.js": [
    { tool: "sportdevs_get_leagues", args: { sport: "rugby" }, envs: ["SPORTDEVS_API_KEY"] },
  ],
  "mysportsfeeds.js": [
    { tool: "msf_get_games", args: { sport: "nfl", season: "2024-regular" }, envs: ["MYSPORTSFEEDS_USER", "MYSPORTSFEEDS_PASS"] },
  ],
  "pandascore.js": [
    { tool: "pandascore_get_videogames", args: {}, envs: ["PANDASCORE_TOKEN"] },
  ],
  "sportsrc.js": [
    { tool: "sportsrc_get_sports", args: {} },
    { tool: "sportsrc_get_matches", args: { category: "football" } },
    { tool: "sportsrc_get_leagues", args: {} },
  ],
  "cfbd.js": [
    { tool: "cfbd_get_teams", args: { year: 2024 }, envs: ["CFBD_API_KEY"] },
  ],
};

// Mirror what the real McpServer does: build a z.object from the raw schema
// shape and pre-parse args before calling the handler. Without this, Zod
// defaults (e.g. sportId.default(1)) never fire and handlers crash on
// undefined.
const { z } = await import("zod");

function createMockServer() {
  const tools = new Map();
  return {
    tools,
    tool(name, _description, schema, handler) {
      const parser = schema && Object.keys(schema).length > 0
        ? z.object(schema)
        : null;
      const wrapped = async (rawArgs, extra) => {
        const parsed = parser ? parser.parse(rawArgs ?? {}) : (rawArgs ?? {});
        return handler(parsed, extra);
      };
      tools.set(name, wrapped);
    },
  };
}

function isResultOk(result) {
  if (!result || typeof result !== "object") return false;
  if (result.isError) return false;
  if (!Array.isArray(result.content) || result.content.length === 0) return false;
  return true;
}

function preview(result) {
  const text = result?.content?.[0]?.text ?? "";
  const sliced = text.slice(0, 140).replace(/\s+/g, " ");
  return sliced + (text.length > 140 ? "…" : "");
}

function envsAvailable(envs) {
  if (!envs) return true;
  return envs.every((k) => process.env[k] && process.env[k].trim() !== "");
}

const RESULTS = [];
const NETWORK_TIMEOUT_MS = 25_000;

async function runCase(provider, tools, testCase) {
  const { tool: name, args, envs } = testCase;

  if (envs && !envsAvailable(envs)) {
    return { status: "skip-env", reason: `missing ${envs.filter((k) => !process.env[k]).join(",")}` };
  }

  const handler = tools.get(name);
  if (!handler) {
    return { status: "skip-missing", reason: `tool not registered` };
  }

  try {
    const result = await Promise.race([
      handler(args, { /* RequestHandlerExtra stub */ signal: AbortSignal.timeout(NETWORK_TIMEOUT_MS) }),
      new Promise((_, reject) => setTimeout(() => reject(new Error(`runner timeout ${NETWORK_TIMEOUT_MS}ms`)), NETWORK_TIMEOUT_MS + 500)),
    ]);
    if (isResultOk(result)) {
      return { status: "pass", preview: preview(result) };
    }
    return { status: "fail", reason: "tool returned isError or empty content", preview: preview(result) };
  } catch (err) {
    return { status: "fail", reason: err instanceof Error ? err.message : String(err) };
  }
}

async function main() {
  const files = (await readdir(providersDir)).filter((f) => f.endsWith(".js"));

  let pass = 0, fail = 0, skipEnv = 0, skipMissing = 0, untested = 0;

  for (const file of files) {
    const cases = TEST_CASES[file];
    if (!cases) {
      console.log(`──── ${file} :  no test cases defined`);
      untested++;
      continue;
    }

    const mod = await import(join(providersDir, file));
    const mock = createMockServer();
    mod.register(mock);

    console.log(`──── ${file} ────`);
    for (const tc of cases) {
      // For key-required providers in default mode, skip silently
      if (!includeAll && tc.envs && tc.envs.length > 0) {
        if (!envsAvailable(tc.envs)) {
          console.log(`  ⏭   ${tc.tool} : skipped (env: ${tc.envs.join(",")})`);
          skipEnv++;
          RESULTS.push({ provider: file, tool: tc.tool, status: "skip-env" });
          continue;
        }
      }

      const r = await runCase(file, mock.tools, tc);
      RESULTS.push({ provider: file, tool: tc.tool, ...r });

      if (r.status === "pass") {
        pass++;
        console.log(`  ✓   ${tc.tool} :  ${r.preview}`);
      } else if (r.status === "skip-env") {
        skipEnv++;
        console.log(`  ⏭   ${tc.tool} :  skip (${r.reason})`);
      } else if (r.status === "skip-missing") {
        skipMissing++;
        console.log(`  ?   ${tc.tool} :  skip (${r.reason})`);
      } else {
        fail++;
        console.log(`  ✗   ${tc.tool} :  ${r.reason}`);
        if (r.preview) console.log(`        preview: ${r.preview}`);
      }
    }
  }

  console.log("");
  console.log(`╔══════════════════════════════════════╗`);
  console.log(`║ E2E summary                          ║`);
  console.log(`╠══════════════════════════════════════╣`);
  console.log(`║ pass            : ${String(pass).padStart(4)}              ║`);
  console.log(`║ fail            : ${String(fail).padStart(4)}              ║`);
  console.log(`║ skip (env)      : ${String(skipEnv).padStart(4)}              ║`);
  console.log(`║ skip (missing)  : ${String(skipMissing).padStart(4)}              ║`);
  console.log(`║ providers w/o   :                    ║`);
  console.log(`║   test cases    : ${String(untested).padStart(4)}              ║`);
  console.log(`╚══════════════════════════════════════╝`);

  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Runner error:", err);
  process.exit(2);
});
