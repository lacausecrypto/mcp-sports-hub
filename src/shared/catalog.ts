/**
 * Single source of truth for provider metadata and presets.
 *
 * Imported by index.ts (preset resolution) and resources.ts (the readable
 * `sportshub://providers` / `sportshub://presets` catalogs). Keeping this here
 * — rather than duplicating it in docs and the resource layer — avoids drift.
 */

export interface ProviderInfo {
  /** Registry key used in SPORTS_HUB_PROVIDERS. */
  key: string;
  /** Tool name prefix. */
  prefix: string;
  /** Human-readable provider name. */
  name: string;
  /** Short coverage description. */
  coverage: string;
  /** Env var(s) required, or null if no key needed. */
  env: string | null;
}

export const PROVIDER_CATALOG: ProviderInfo[] = [
  // No key required
  { key: "espn", prefix: "espn_", name: "ESPN (unofficial)", coverage: "20+ sports — scores, standings, news", env: null },
  { key: "nhl", prefix: "nhl_", name: "NHL Web API", coverage: "NHL schedules, rosters, player stats", env: null },
  { key: "mlb", prefix: "mlb_", name: "MLB Stats API", coverage: "MLB/MiLB games, players, standings", env: null },
  { key: "f1", prefix: "f1_", name: "Jolpica F1", coverage: "F1 results, standings, circuits (1950-now)", env: null },
  { key: "openf1", prefix: "openf1_", name: "OpenF1", coverage: "F1 live telemetry, lap times, race control", env: null },
  { key: "openliga", prefix: "openliga_", name: "OpenLigaDB", coverage: "German football (Bundesliga focus)", env: null },
  { key: "sportsdb", prefix: "sportsdb_", name: "TheSportsDB", coverage: "40+ sports, teams, players, events", env: null },
  { key: "ncaa", prefix: "ncaa_", name: "NCAA API", coverage: "College sports (football, basketball, etc.)", env: null },
  { key: "sportsrc", prefix: "sportsrc_", name: "SportSRC", coverage: "Football/Basketball/MMA + streams", env: null },
  { key: "lichess", prefix: "lichess_", name: "Lichess", coverage: "Chess users, top players, broadcasts, puzzle", env: null },
  { key: "chesscom", prefix: "chesscom_", name: "Chess.com", coverage: "Chess profiles, stats, clubs, leaderboards", env: null },
  { key: "squiggle", prefix: "squiggle_", name: "Squiggle", coverage: "AFL: teams, games, ladder, tips, sources", env: null },
  { key: "motogp", prefix: "motogp_", name: "MotoGP (unofficial)", coverage: "MotoGP/Moto2/Moto3/MotoE results & standings", env: null },
  { key: "formulae", prefix: "formulae_", name: "Formula E (unofficial)", coverage: "Formula E championships, races, standings", env: null },
  { key: "nascar", prefix: "nascar_", name: "NASCAR (unofficial)", coverage: "NASCAR Cup/Xfinity/Truck schedule + live feed", env: null },
  { key: "opendota", prefix: "opendota_", name: "OpenDota", coverage: "Dota 2 pro matches, player/hero analytics", env: null },
  { key: "sleeper", prefix: "sleeper_", name: "Sleeper", coverage: "NFL fantasy: players, injuries, trending, leagues", env: null },
  { key: "euroleague", prefix: "euroleague_", name: "EuroLeague Basketball", coverage: "EuroLeague + EuroCup games, clubs, boxscores", env: null },
  { key: "footballdatauk", prefix: "footballdata_uk_", name: "Football-Data.co.uk", coverage: "Historical football results + bookmaker odds", env: null },

  // API key required
  { key: "apisports", prefix: "apisports_", name: "API-Sports", coverage: "9 sports multi-stat", env: "API_SPORTS_KEY" },
  { key: "apifootball", prefix: "apifootball_", name: "API-Football", coverage: "Soccer (960+ leagues)", env: "API_FOOTBALL_KEY" },
  { key: "apitennis", prefix: "apitennis_", name: "API-Tennis", coverage: "Tennis (ATP/WTA/ITF)", env: "API_TENNIS_KEY" },
  { key: "bdl", prefix: "bdl_", name: "BallDontLie", coverage: "NBA, NFL, MLB, NHL", env: "BALLDONTLIE_API_KEY" },
  { key: "cricket", prefix: "cricket_", name: "CricketData", coverage: "Cricket (Test, ODI, T20, IPL)", env: "CRICKETDATA_API_KEY" },
  { key: "entitycricket", prefix: "entitycricket_", name: "Entity Sport", coverage: "Cricket (250+ competitions)", env: "ENTITY_SPORT_KEY" },
  { key: "footballdata", prefix: "footballdata_", name: "football-data.org", coverage: "Soccer (12 European leagues)", env: "FOOTBALL_DATA_API_KEY" },
  { key: "sportmonks", prefix: "sportmonks_", name: "Sportmonks", coverage: "Soccer (Danish + Scottish free)", env: "SPORTMONKS_API_KEY" },
  { key: "sportsdata", prefix: "sportsdata_", name: "SportsDataIO", coverage: "9 sports (data scrambled on free)", env: "SPORTSDATA_IO_KEY" },
  { key: "odds", prefix: "odds_", name: "The Odds API", coverage: "Odds — 70+ sports, 40+ bookmakers", env: "THE_ODDS_API_KEY" },
  { key: "oddsio", prefix: "oddsio_", name: "Odds-API.io", coverage: "Odds — 34 sports, 265+ bookmakers", env: "ODDS_API_IO_KEY" },
  { key: "sgo", prefix: "sgo_", name: "Sports Game Odds", coverage: "Odds — 55+ leagues, player props", env: "SPORTS_GAME_ODDS_KEY" },
  { key: "mma", prefix: "mma_", name: "Fighting Tomatoes", coverage: "MMA fight history", env: "FIGHTING_TOMATOES_API_KEY" },
  { key: "livegolf", prefix: "livegolf_", name: "Live Golf API", coverage: "Golf (PGA, DP World Tour)", env: "LIVE_GOLF_API_KEY" },
  { key: "isports", prefix: "isports_", name: "iSportsAPI", coverage: "Football + Basketball (Asia-Pacific)", env: "ISPORTSAPI_KEY" },
  { key: "sportdevs", prefix: "sportdevs_", name: "SportDevs", coverage: "Rugby, Volleyball, Handball", env: "SPORTDEVS_API_KEY" },
  { key: "msf", prefix: "msf_", name: "MySportsFeeds", coverage: "NFL, NBA, MLB, NHL (detailed)", env: "MYSPORTSFEEDS_USER + MYSPORTSFEEDS_PASS" },
  { key: "pandascore", prefix: "pandascore_", name: "PandaScore", coverage: "Esports (13 titles)", env: "PANDASCORE_TOKEN" },
  { key: "golfcourse", prefix: "golfcourse_", name: "GolfCourseAPI", coverage: "30K+ golf courses worldwide", env: "GOLFCOURSE_API_KEY" },
  { key: "cfbd", prefix: "cfbd_", name: "College Football Data", coverage: "NCAA football (games, stats, recruiting)", env: "CFBD_API_KEY" },
  { key: "boxing", prefix: "boxing_", name: "Boxing Data API", coverage: "Pro boxing fighters, bouts, events, titles", env: "BOXING_DATA_API_KEY" },
  { key: "highlightly", prefix: "highlightly_", name: "Highlightly", coverage: "Multi-sport video highlights, odds, predictions", env: "HIGHLIGHTLY_API_KEY" },
];

export const PRESETS: Record<string, string[]> = {
  "us-major":   ["espn", "nhl", "mlb", "ncaa", "cfbd", "bdl", "msf", "nascar", "sleeper"],
  "soccer":     ["espn", "apifootball", "footballdata", "sportmonks", "openliga", "sportsrc", "footballdatauk", "highlightly"],
  "f1":         ["f1", "openf1"],
  "motorsport": ["f1", "openf1", "motogp", "formulae", "nascar"],
  "esports":    ["pandascore", "opendota"],
  "odds":       ["odds", "oddsio", "sgo"],
  "cricket":    ["cricket", "entitycricket"],
  "golf":       ["livegolf", "golfcourse"],
  "free":       ["espn", "nhl", "mlb", "f1", "openf1", "openliga", "sportsdb", "ncaa", "sportsrc", "lichess", "chesscom", "squiggle", "motogp", "formulae", "nascar", "opendota", "sleeper", "euroleague", "footballdatauk"],
  "chess":      ["lichess", "chesscom"],
};
