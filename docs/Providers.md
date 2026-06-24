# Providers

Sports Hub aggregates **41 independent sports API providers** into one MCP server. Each provider registers its own tools, all prefixed with the provider name to avoid collisions. **396 tools** total.


---

## 1. ESPN (unofficial)

| | |
|---|---|
| **Prefix** | `espn_` |
| **Tools** | 10 |
| **API Base** | `https://site.api.espn.com/apis/site/v2/sports` |
| **Auth** | None |
| **Rate Limits** | Fair use (unofficial) |
| **Sports** | 20+ sports — NFL, NBA, MLB, NHL, soccer, MMA, golf, tennis, racing, college |

**Tools:** `espn_get_scoreboard`, `espn_get_standings`, `espn_get_teams`, `espn_get_team_details`, `espn_get_team_roster`, `espn_get_team_schedule`, `espn_get_event_summary`, `espn_get_athlete`, `espn_get_news`, `espn_get_seasons`

**Caveats:** Unofficial ESPN API — can break without notice; error messages suggest fallbacks like sportsdb_search_teams, bdl_get_games, or apisports_get_fixtures.

---

## 2. NHL Web API

| | |
|---|---|
| **Prefix** | `nhl_` |
| **Tools** | 13 |
| **API Base** | `https://api-web.nhle.com/v1` |
| **Auth** | None |
| **Rate Limits** | Fair use |
| **Sports** | NHL schedules, rosters, player stats |

**Tools:** `nhl_get_schedule`, `nhl_get_scores`, `nhl_get_standings`, `nhl_get_game_boxscore`, `nhl_get_game_play_by_play`, `nhl_get_game_landing`, `nhl_get_team_roster`, `nhl_get_team_schedule`, `nhl_get_team_stats`, `nhl_get_player`, `nhl_get_player_game_log`, `nhl_get_stat_leaders`, `nhl_get_draft`

**Caveats:** Uses the NHL's public web API (api-web.nhle.com); season identifiers are 8-digit tags like "20232024" and default to the current season computed from the date.

---

## 3. MLB Stats API

| | |
|---|---|
| **Prefix** | `mlb_` |
| **Tools** | 13 |
| **API Base** | `https://statsapi.mlb.com/api/v1` |
| **Auth** | None |
| **Rate Limits** | Fair use |
| **Sports** | MLB/MiLB games, players, standings |

**Tools:** `mlb_get_schedule`, `mlb_get_game`, `mlb_get_game_play_by_play`, `mlb_get_game_boxscore`, `mlb_get_game_linescore`, `mlb_get_standings`, `mlb_get_teams`, `mlb_get_team_roster`, `mlb_get_player`, `mlb_get_player_stats`, `mlb_search_players`, `mlb_get_divisions`, `mlb_get_league_leaders`

**Caveats:** Uses the public MLB Stats API; no key required and covers MLB plus minor leagues via sportId (11=AAA, 12=AA, 13=A, 14=A-short).

---

## 4. Jolpica F1 (Ergast successor)

| | |
|---|---|
| **Prefix** | `f1_` |
| **Tools** | 13 |
| **API Base** | `https://api.jolpi.ca/ergast` |
| **Auth** | None |
| **Rate Limits** | Fair use |
| **Sports** | F1 results, standings, circuits (1950–present) |

**Tools:** `f1_get_race_results`, `f1_get_qualifying`, `f1_get_sprint`, `f1_get_driver_standings`, `f1_get_constructor_standings`, `f1_get_schedule`, `f1_get_drivers`, `f1_get_constructors`, `f1_get_circuits`, `f1_get_lap_times`, `f1_get_pit_stops`, `f1_get_seasons`, `f1_get_driver_results`

**Caveats:** Jolpica is a community-maintained drop-in replacement for the deprecated Ergast F1 API. Lap times are available only from 1996 onwards and pit stop data only from 2012 onwards.

---

## 5. OpenF1

| | |
|---|---|
| **Prefix** | `openf1_` |
| **Tools** | 12 |
| **API Base** | `https://api.openf1.org/v1` |
| **Auth** | None |
| **Rate Limits** | Fair use |
| **Sports** | F1 live telemetry, lap times, race control |

**Tools:** `openf1_get_sessions`, `openf1_get_drivers`, `openf1_get_laps`, `openf1_get_positions`, `openf1_get_car_data`, `openf1_get_intervals`, `openf1_get_stints`, `openf1_get_pit`, `openf1_get_race_control`, `openf1_get_weather`, `openf1_get_team_radio`, `openf1_get_meetings`

**Caveats:** The car_data endpoint returns very large datasets (multiple samples per second per car), so date_gte/date_lte filters should always be used to limit the time window; the server emits a warning when no date filter is provided. Range filters (speed, date, pit_duration) are translated to OpenF1's operator query params (e.g. speed>=, date<=).

---

## 6. OpenLigaDB

| | |
|---|---|
| **Prefix** | `openliga_` |
| **Tools** | 10 |
| **API Base** | `https://api.openligadb.de` |
| **Auth** | None |
| **Rate Limits** | Fair use |
| **Sports** | German football (Bundesliga focus) |

**Tools:** `openliga_get_matches_by_league_season`, `openliga_get_matches_by_matchday`, `openliga_get_current_matchday`, `openliga_get_match_data`, `openliga_get_table`, `openliga_get_top_scorers`, `openliga_get_teams`, `openliga_get_available_leagues`, `openliga_get_next_match_by_team`, `openliga_get_last_match_by_team`

**Caveats:** Covers German football only (Bundesliga 1/2, 3. Liga, DFB-Pokal, etc.); match times are formatted in the Europe/Berlin timezone.

---

## 7. TheSportsDB

| | |
|---|---|
| **Prefix** | `sportsdb_` |
| **Tools** | 13 |
| **API Base** | `https://www.thesportsdb.com/api/v1/json/{key}` |
| **Auth** | None (optional THESPORTSDB_API_KEY) |
| **Rate Limits** | Fair use (test key) |
| **Sports** | 40+ sports — teams, players, events |

**Tools:** `sportsdb_search_teams`, `sportsdb_search_players`, `sportsdb_get_team_details`, `sportsdb_get_player_details`, `sportsdb_get_league_list`, `sportsdb_get_events_by_date`, `sportsdb_get_event_details`, `sportsdb_get_last_events`, `sportsdb_get_next_events`, `sportsdb_get_standings`, `sportsdb_get_event_results`, `sportsdb_get_seasons`, `sportsdb_get_sports_list`

**Caveats:** The API key is passed in the URL path and defaults to the free test key "3", which returns watermarked images. Set THESPORTSDB_API_KEY for a personal key.

---

## 8. NCAA API

| | |
|---|---|
| **Prefix** | `ncaa_` |
| **Tools** | 8 |
| **API Base** | `https://ncaa-api.henrygd.me` |
| **Auth** | None |
| **Rate Limits** | Fair use |
| **Sports** | College sports (football, basketball, etc.) |

**Tools:** `ncaa_get_scoreboard`, `ncaa_get_game`, `ncaa_get_rankings`, `ncaa_get_standings`, `ncaa_get_teams`, `ncaa_get_schedule`, `ncaa_get_stats`, `ncaa_get_news`

**Caveats:** Unofficial NCAA API hosted at a third-party domain (ncaa-api.henrygd.me); it can break or change without notice.

---

## 9. SportSRC

| | |
|---|---|
| **Prefix** | `sportsrc_` |
| **Tools** | 7 |
| **API Base** | `https://api.sportsrc.org/` |
| **Auth** | None |
| **Rate Limits** | V1 free, no key |
| **Sports** | Football / Basketball / MMA + streams |

**Tools:** `sportsrc_get_sports`, `sportsrc_get_matches`, `sportsrc_get_match`, `sportsrc_get_leagues`, `sportsrc_get_league_scores`, `sportsrc_get_table`, `sportsrc_get_live`

**Caveats:** Only the free V1 endpoints are exposed; V2 endpoints (xG, momentum, lineups) require a paid SPORTSRC_API_KEY and a different host scheme, so they are omitted. SPORTSRC_API_KEY is reserved but not read or required by any tool here; leagues/scores/tables are football-scoped, and there is no separate live endpoint (filter the matches feed by status client-side).

---

## 10. Lichess

| | |
|---|---|
| **Prefix** | `lichess_` |
| **Tools** | 7 |
| **API Base** | `https://lichess.org` |
| **Auth** | None |
| **Rate Limits** | Fair use |
| **Sports** | Chess — users, top players, broadcasts, tournaments, daily puzzle |

**Tools:** `lichess_get_user`, `lichess_get_users_status`, `lichess_get_top_players`, `lichess_get_team`, `lichess_get_tournaments`, `lichess_get_broadcasts`, `lichess_get_daily_puzzle`

**Caveats:** No auth needed for read-only public endpoints (rate limit ~20 req/sec/IP). Several endpoints stream NDJSON, which is parsed into JSON arrays.

---

## 11. Chess.com

| | |
|---|---|
| **Prefix** | `chesscom_` |
| **Tools** | 7 |
| **API Base** | `https://api.chess.com/pub` |
| **Auth** | None |
| **Rate Limits** | Fair use |
| **Sports** | Chess — profiles, stats, clubs, archives, leaderboards |

**Tools:** `chesscom_get_player`, `chesscom_get_player_stats`, `chesscom_get_player_clubs`, `chesscom_get_player_archives`, `chesscom_get_club`, `chesscom_get_country_players`, `chesscom_get_leaderboards`

**Caveats:** Public read-only Published-Data API requiring no auth; Chess.com recommends a descriptive User-Agent and may throttle parallel requests with HTTP 429.

---

## 12. Squiggle (AFL)

| | |
|---|---|
| **Prefix** | `squiggle_` |
| **Tools** | 6 |
| **API Base** | `https://api.squiggle.com.au/` |
| **Auth** | None |
| **Rate Limits** | Fair use |
| **Sports** | AFL (Australian Football League) — teams, games, ladder, tips, sources |

**Tools:** `squiggle_get_teams`, `squiggle_get_games`, `squiggle_get_ladder`, `squiggle_get_standings`, `squiggle_get_tips`, `squiggle_get_sources`

**Caveats:** Squiggle requires an honest User-Agent identifying the client (the shared mcp-sports-hub User-Agent satisfies this). The API uses semicolon-separated query params (?q=resource;year=YYYY;round=N).

---

## 13. MotoGP

| | |
|---|---|
| **Prefix** | `motogp_` |
| **Tools** | 7 |
| **API Base** | `https://api.motogp.pulselive.com/motogp/v1` |
| **Auth** | None |
| **Rate Limits** | Fair use (unofficial) |
| **Sports** | MotoGP / Moto2 / Moto3 / MotoE — seasons, results, sessions, standings, riders |

**Tools:** `motogp_get_seasons`, `motogp_get_categories`, `motogp_get_events`, `motogp_get_sessions`, `motogp_get_session_classification`, `motogp_get_standings`, `motogp_get_riders`

**Caveats:** Unofficial/undocumented API (reverse-engineered from motogp.com). Read-only; can change without notice. Results use chained UUID lookups: seasons -> categories -> events -> sessions -> classification.

---

## 14. Formula E

| | |
|---|---|
| **Prefix** | `formulae_` |
| **Tools** | 7 |
| **API Base** | `https://api.formula-e.pulselive.com/formula-e/v1` |
| **Auth** | None |
| **Rate Limits** | Fair use (unofficial) |
| **Sports** | Formula E — championships, races, results, teams, driver/team standings |

**Tools:** `formulae_get_championships`, `formulae_get_races`, `formulae_get_race`, `formulae_get_race_results`, `formulae_get_teams`, `formulae_get_driver_standings`, `formulae_get_team_standings`

**Caveats:** Unofficial/undocumented API (same Pulselive infrastructure as MotoGP). Read-only; can change without notice. Standings require a championshipId from formulae_get_championships.

---

## 15. NASCAR

| | |
|---|---|
| **Prefix** | `nascar_` |
| **Tools** | 3 |
| **API Base** | `https://cf.nascar.com` |
| **Auth** | None |
| **Rate Limits** | Fair use (unofficial) |
| **Sports** | NASCAR Cup / Xfinity / Truck — schedule, live race feed, lap times |

**Tools:** `nascar_get_schedule`, `nascar_get_live`, `nascar_get_lap_times`

**Caveats:** Unofficial/undocumented (NASCAR.com's own CDN feeds). Read-only; can change without notice. Series ids: 1 = Cup, 2 = Xfinity, 3 = Truck.

---

## 16. OpenDota

| | |
|---|---|
| **Prefix** | `opendota_` |
| **Tools** | 11 |
| **API Base** | `https://api.opendota.com/api` |
| **Auth** | None |
| **Rate Limits** | 60/min, 50k/mo |
| **Sports** | Dota 2 — pro matches, match/player/hero analytics, teams, leagues |

**Tools:** `opendota_get_pro_matches`, `opendota_get_match`, `opendota_get_player`, `opendota_get_player_matches`, `opendota_get_player_win_loss`, `opendota_get_player_heroes`, `opendota_get_hero_stats`, `opendota_get_heroes`, `opendota_get_pro_teams`, `opendota_get_pro_leagues`, `opendota_search_players`

**Caveats:** Free tier needs no key (~60 req/min, 50,000 req/month, IP-based). Complements PandaScore with deep Dota 2 match/player/hero analytics.

---

## 17. Sleeper

| | |
|---|---|
| **Prefix** | `sleeper_` |
| **Tools** | 10 |
| **API Base** | `https://api.sleeper.app/v1` |
| **Auth** | None |
| **Rate Limits** | ~1000/min |
| **Sports** | NFL fantasy — player search, injuries, trending, leagues, rosters, matchups |

**Tools:** `sleeper_get_nfl_state`, `sleeper_search_players`, `sleeper_get_trending_players`, `sleeper_get_user`, `sleeper_get_user_leagues`, `sleeper_get_league`, `sleeper_get_league_rosters`, `sleeper_get_league_users`, `sleeper_get_league_matchups`, `sleeper_get_draft_picks`

**Caveats:** No key, read-only. NFL only for player metadata. The large player set is cached 24h and never returned whole (search_players filters it). Stay under ~1000 req/min.

---

## 18. EuroLeague Basketball

| | |
|---|---|
| **Prefix** | `euroleague_` |
| **Tools** | 6 |
| **API Base** | `https://api-live.euroleague.net/v2 (+ live.euroleague.net/api)` |
| **Auth** | None |
| **Rate Limits** | Fair use |
| **Sports** | EuroLeague + EuroCup — games, clubs, boxscores, play-by-play |

**Tools:** `euroleague_get_games`, `euroleague_get_clubs`, `euroleague_get_rounds`, `euroleague_get_game_header`, `euroleague_get_game_boxscore`, `euroleague_get_game_playbyplay`

**Caveats:** Keyless official feeds. JSON via v2 (games/clubs/rounds) and live.euroleague.net/api (header/boxscore/play-by-play). competition E=EuroLeague, U=EuroCup; seasonCode = competition + year. The v1 XML feeds are intentionally not wrapped (JSON-only).

---

## 19. Football-Data.co.uk

| | |
|---|---|
| **Prefix** | `footballdata_uk_` |
| **Tools** | 2 |
| **API Base** | `https://www.football-data.co.uk` |
| **Auth** | None |
| **Rate Limits** | Fair use |
| **Sports** | Historical football results + bookmaker odds (2000-now, 25+ leagues) |

**Tools:** `footballdata_uk_list_leagues`, `footballdata_uk_get_matches`

**Caveats:** Free CSV archive parsed to JSON. Historical results + pre-match/closing odds from 10+ bookmakers across 25+ leagues, 2000-now. Column key at /notes.txt.

---

## 20. API-Sports

| | |
|---|---|
| **Prefix** | `apisports_` |
| **Tools** | 10 |
| **API Base** | `https://v3.{sport}.api-sports.io` |
| **Auth** | `API_SPORTS_KEY` |
| **Rate Limits** | 100/day/sport |
| **Sports** | 9 sports multi-stat |

**Tools:** `apisports_get_fixtures`, `apisports_get_standings`, `apisports_get_teams`, `apisports_get_players`, `apisports_get_odds`, `apisports_get_leagues`, `apisports_get_live_scores`, `apisports_get_team_statistics`, `apisports_get_head2head`, `apisports_get_status`

**Caveats:** Each sport has its own separate quota (free tier ~100 requests/day per sport); the host is dynamic per sport and odds are not available for all sports.

---

## 21. API-Football

| | |
|---|---|
| **Prefix** | `apifootball_` |
| **Tools** | 15 |
| **API Base** | `https://v3.football.api-sports.io` |
| **Auth** | `API_FOOTBALL_KEY` |
| **Rate Limits** | 100/day |
| **Sports** | Soccer (960+ leagues) |

**Tools:** `apifootball_get_fixtures`, `apifootball_get_fixture_events`, `apifootball_get_fixture_lineups`, `apifootball_get_fixture_statistics`, `apifootball_get_standings`, `apifootball_get_teams`, `apifootball_get_players`, `apifootball_get_top_scorers`, `apifootball_get_transfers`, `apifootball_get_injuries`, `apifootball_get_predictions`, `apifootball_get_odds`, `apifootball_get_leagues`, `apifootball_get_countries`, `apifootball_get_status`

**Caveats:** The API key is sent via the x-apisports-key header; calls fail with an error if API_FOOTBALL_KEY is not set. Player search requires a minimum of 3 characters and player results are paginated 25 per page.

---

## 22. API-Tennis

| | |
|---|---|
| **Prefix** | `apitennis_` |
| **Tools** | 12 |
| **API Base** | `https://v1.tennis.api-sports.io` |
| **Auth** | `API_TENNIS_KEY` |
| **Rate Limits** | 100/day |
| **Sports** | Tennis (ATP, WTA, ITF) |

**Tools:** `apitennis_get_rankings`, `apitennis_get_seasons`, `apitennis_get_categories`, `apitennis_get_countries`, `apitennis_get_leagues`, `apitennis_get_fixtures`, `apitennis_get_live`, `apitennis_get_standings`, `apitennis_get_players`, `apitennis_get_head2head`, `apitennis_get_statistics`, `apitennis_get_status`

**Caveats:** Requires the API_TENNIS_KEY env var (sent via x-apisports-key header); calls error out without it. Free tier is limited to 100 requests/day.

---

## 23. BallDontLie

| | |
|---|---|
| **Prefix** | `bdl_` |
| **Tools** | 10 |
| **API Base** | `https://api.balldontlie.io/v1` |
| **Auth** | `BALLDONTLIE_API_KEY` |
| **Rate Limits** | Basic tier |
| **Sports** | NBA, NFL, MLB, NHL |

**Tools:** `bdl_get_players`, `bdl_get_player_by_id`, `bdl_get_teams`, `bdl_get_games`, `bdl_get_game_by_id`, `bdl_get_stats`, `bdl_get_season_averages`, `bdl_get_box_scores`, `bdl_get_standings`, `bdl_get_leaders`

**Caveats:** Every tool requires BALLDONTLIE_API_KEY (sent as a Bearer token); calls error out without it. Array filters (dates, team_ids, etc.) are sent as repeated [] query params.

---

## 24. CricketData

| | |
|---|---|
| **Prefix** | `cricket_` |
| **Tools** | 10 |
| **API Base** | `https://api.cricapi.com/v1` |
| **Auth** | `CRICKETDATA_API_KEY` |
| **Rate Limits** | 100/day |
| **Sports** | Cricket (Test, ODI, T20, IPL) |

**Tools:** `cricket_get_current_matches`, `cricket_get_match_info`, `cricket_get_match_scorecard`, `cricket_get_match_bbb`, `cricket_get_series`, `cricket_get_series_info`, `cricket_get_players`, `cricket_get_player_info`, `cricket_get_countries`, `cricket_get_match_list`

**Caveats:** Requires a free CricketData API key (apikey query param); the echoed API key is stripped from responses for security.

---

## 25. Entity Sport

| | |
|---|---|
| **Prefix** | `entitycricket_` |
| **Tools** | 12 |
| **API Base** | `https://rest.entitysport.com/v2` |
| **Auth** | `ENTITY_SPORT_KEY` |
| **Rate Limits** | Free plan |
| **Sports** | Cricket (250+ competitions) |

**Tools:** `entitycricket_get_matches`, `entitycricket_get_match`, `entitycricket_get_match_scorecard`, `entitycricket_get_match_commentary`, `entitycricket_get_competitions`, `entitycricket_get_competition`, `entitycricket_get_competition_standings`, `entitycricket_get_teams`, `entitycricket_get_team`, `entitycricket_get_players`, `entitycricket_get_player`, `entitycricket_get_venues`

**Caveats:** Authentication is passed as a query param `token`; the ENTITY_SPORT_KEY env var is required or the tool throws an error.

---

## 26. football-data.org

| | |
|---|---|
| **Prefix** | `footballdata_` |
| **Tools** | 11 |
| **API Base** | `https://api.football-data.org/v4` |
| **Auth** | `FOOTBALL_DATA_API_KEY` |
| **Rate Limits** | 10/min |
| **Sports** | Soccer (12 European leagues) |

**Tools:** `footballdata_get_competitions`, `footballdata_get_competition`, `footballdata_get_standings`, `footballdata_get_matches`, `footballdata_get_match`, `footballdata_get_teams`, `footballdata_get_team`, `footballdata_get_team_matches`, `footballdata_get_scorers`, `footballdata_get_person`, `footballdata_get_areas`

**Caveats:** Requires the FOOTBALL_DATA_API_KEY env var (sent as X-Auth-Token header); without it every tool returns an error. The free tier only covers 12 competitions: PL, ELC, BL1, SA, PD, FL1, DED, PPL, CL, EC, WC, CLI.

---

## 27. Sportmonks

| | |
|---|---|
| **Prefix** | `sportmonks_` |
| **Tools** | 12 |
| **API Base** | `https://api.sportmonks.com/v3` |
| **Auth** | `SPORTMONKS_API_KEY` |
| **Rate Limits** | 3000/hr |
| **Sports** | Soccer (Danish + Scottish free) |

**Tools:** `sportmonks_get_leagues`, `sportmonks_get_fixtures`, `sportmonks_get_fixture_by_id`, `sportmonks_get_livescores`, `sportmonks_get_standings`, `sportmonks_get_teams`, `sportmonks_get_team_by_id`, `sportmonks_get_players`, `sportmonks_get_player_by_id`, `sportmonks_get_topscorers`, `sportmonks_get_seasons`, `sportmonks_get_countries`

**Caveats:** All endpoints are football-only (Sportmonks v3 football API); the key is sent as the Authorization header and is required for every call. Free plans typically cover only the Danish Superliga and Scottish Premiership.

---

## 28. SportsDataIO

| | |
|---|---|
| **Prefix** | `sportsdata_` |
| **Tools** | 12 |
| **API Base** | `https://api.sportsdata.io/v3/{sport} (v4 for soccer)` |
| **Auth** | `SPORTSDATA_IO_KEY` |
| **Rate Limits** | 1000/mo |
| **Sports** | 9 sports (data scrambled on free tier) |

**Tools:** `sportsdata_get_games_by_date`, `sportsdata_get_standings`, `sportsdata_get_teams`, `sportsdata_get_player`, `sportsdata_get_player_stats_by_season`, `sportsdata_get_injuries`, `sportsdata_get_news`, `sportsdata_get_schedules`, `sportsdata_get_scores_by_date`, `sportsdata_get_odds_by_date`, `sportsdata_get_dfs_slates`, `sportsdata_get_active_players`

**Caveats:** Free tier data is partially randomized/scrambled. Some endpoints (injuries, news, odds, DFS slates) are unsupported for certain sports like MMA, NASCAR, golf, and tennis and will return an error.

---

## 29. The Odds API

| | |
|---|---|
| **Prefix** | `odds_` |
| **Tools** | 9 |
| **API Base** | `https://api.the-odds-api.com/v4` |
| **Auth** | `THE_ODDS_API_KEY` |
| **Rate Limits** | 500/mo |
| **Sports** | Odds — 70+ sports, 40+ bookmakers |

**Tools:** `odds_get_sports`, `odds_get_odds`, `odds_get_event_odds`, `odds_get_scores`, `odds_get_events`, `odds_get_historical_odds`, `odds_get_historical_events`, `odds_get_player_props`, `odds_check_usage`

**Caveats:** Free tier is capped at 500 requests/month; use odds_check_usage (which reads cached usage from prior calls rather than burning a request) to monitor remaining quota.

---

## 30. Odds-API.io

| | |
|---|---|
| **Prefix** | `oddsio_` |
| **Tools** | 10 |
| **API Base** | `https://api.odds-api.io/v1` |
| **Auth** | `ODDS_API_IO_KEY` |
| **Rate Limits** | Free account |
| **Sports** | Odds — 34 sports, 265+ bookmakers |

**Tools:** `oddsio_get_sports`, `oddsio_get_leagues`, `oddsio_get_events`, `oddsio_get_event`, `oddsio_get_odds`, `oddsio_get_prematch_odds`, `oddsio_get_live_odds`, `oddsio_get_value_bets`, `oddsio_get_arbitrage`, `oddsio_get_bookmakers`

**Caveats:** Requires the ODDS_API_IO_KEY env var, sent as the X-Api-Key request header; calls error out if it is missing.

---

## 31. Sports Game Odds

| | |
|---|---|
| **Prefix** | `sgo_` |
| **Tools** | 10 |
| **API Base** | `https://api.sportsgameodds.com/v2` |
| **Auth** | `SPORTS_GAME_ODDS_KEY` |
| **Rate Limits** | Trial |
| **Sports** | Odds — 55+ leagues, player props |

**Tools:** `sgo_get_leagues`, `sgo_get_events`, `sgo_get_event`, `sgo_get_odds`, `sgo_get_player_props`, `sgo_get_scores`, `sgo_get_bookmakers`, `sgo_get_markets`, `sgo_get_teams`, `sgo_get_standings`

**Caveats:** Requires an API key passed via the x-api-key header; the SPORTS_GAME_ODDS_KEY env var is mandatory or every call throws.

---

## 32. Fighting Tomatoes

| | |
|---|---|
| **Prefix** | `mma_` |
| **Tools** | 8 |
| **API Base** | `https://fightingtomatoes.com/api` |
| **Auth** | `FIGHTING_TOMATOES_API_KEY` |
| **Rate Limits** | 200/mo |
| **Sports** | MMA fight history |

**Tools:** `mma_search_fighters`, `mma_get_fighter`, `mma_get_fighter_fights`, `mma_get_events`, `mma_get_event`, `mma_get_fight`, `mma_get_organizations`, `mma_get_upcoming_events`

**Caveats:** Requires a free API key sent as an Authorization: Bearer header; without FIGHTING_TOMATOES_API_KEY every tool throws an error. Free tier is limited to 200 requests/month, so cache results and use sparingly.

---

## 33. Live Golf API

| | |
|---|---|
| **Prefix** | `livegolf_` |
| **Tools** | 8 |
| **API Base** | `https://api.livegolfapi.com/v1` |
| **Auth** | `LIVE_GOLF_API_KEY` |
| **Rate Limits** | Free tier |
| **Sports** | Golf (PGA, DP World Tour) |

**Tools:** `livegolf_get_tournaments`, `livegolf_get_tournament`, `livegolf_get_leaderboard`, `livegolf_get_players`, `livegolf_get_player`, `livegolf_get_player_stats`, `livegolf_get_rankings`, `livegolf_get_schedule`

**Caveats:** API key is required and sent via the x-api-key header; a missing LIVE_GOLF_API_KEY throws an error when any tool is called.

---

## 34. iSportsAPI

| | |
|---|---|
| **Prefix** | `isports_` |
| **Tools** | 10 |
| **API Base** | `https://api.isportsapi.com/sport` |
| **Auth** | `ISPORTSAPI_KEY` |
| **Rate Limits** | Free tier |
| **Sports** | Football + Basketball (Asia-Pacific) |

**Tools:** `isports_get_football_matches`, `isports_get_football_match`, `isports_get_football_leagues`, `isports_get_football_standings`, `isports_get_football_teams`, `isports_get_basketball_matches`, `isports_get_basketball_match`, `isports_get_basketball_leagues`, `isports_get_basketball_standings`, `isports_get_basketball_teams`

**Caveats:** Requires the ISPORTSAPI_KEY env var (passed as the api_key query param) or every call throws. Coverage is limited to football (soccer) and basketball.

---

## 35. SportDevs

| | |
|---|---|
| **Prefix** | `sportdevs_` |
| **Tools** | 12 |
| **API Base** | `https://{sport}.sportdevs.com` |
| **Auth** | `SPORTDEVS_API_KEY` |
| **Rate Limits** | Trial |
| **Sports** | Rugby, Volleyball, Handball |

**Tools:** `sportdevs_get_matches`, `sportdevs_get_match_details`, `sportdevs_get_match_lineups`, `sportdevs_get_match_statistics`, `sportdevs_get_standings`, `sportdevs_get_teams`, `sportdevs_get_team`, `sportdevs_get_players`, `sportdevs_get_player`, `sportdevs_get_leagues`, `sportdevs_get_livescores`, `sportdevs_get_odds`

**Caveats:** Requires SPORTDEVS_API_KEY (Bearer token); calls throw if missing. Uses PostgREST-style query filters (eq.VALUE). Covers rugby, volleyball, and handball only.

---

## 36. MySportsFeeds

| | |
|---|---|
| **Prefix** | `msf_` |
| **Tools** | 12 |
| **API Base** | `https://api.mysportsfeeds.com/v2.1/pull` |
| **Auth** | `MYSPORTSFEEDS_USER` + `MYSPORTSFEEDS_PASS` |
| **Rate Limits** | Free non-commercial |
| **Sports** | NFL, NBA, MLB, NHL (detailed) |

**Tools:** `msf_get_games`, `msf_get_game_boxscore`, `msf_get_game_playbyplay`, `msf_get_standings`, `msf_get_player_stats`, `msf_get_roster`, `msf_get_injuries`, `msf_get_daily_dfs`, `msf_get_odds_gamelines`, `msf_get_lineups`, `msf_get_schedule`, `msf_get_players`

**Caveats:** Uses HTTP Basic Auth (base64 of user:pass); both MYSPORTSFEEDS_USER and MYSPORTSFEEDS_PASS env vars are required or every tool throws an error. Free tier is for non-commercial use only.

---

## 37. PandaScore

| | |
|---|---|
| **Prefix** | `pandascore_` |
| **Tools** | 14 |
| **API Base** | `https://api.pandascore.co` |
| **Auth** | `PANDASCORE_TOKEN` |
| **Rate Limits** | 1000/hr |
| **Sports** | Esports (13 titles — LoL, CS2, Dota 2, Valorant…) |

**Tools:** `pandascore_get_matches`, `pandascore_get_match`, `pandascore_get_tournaments`, `pandascore_get_tournament`, `pandascore_get_leagues`, `pandascore_get_league`, `pandascore_get_series`, `pandascore_get_teams`, `pandascore_get_team`, `pandascore_get_players`, `pandascore_get_player`, `pandascore_get_videogames`, `pandascore_get_lives`, `pandascore_get_incidents`

**Caveats:** Requires a PANDASCORE_TOKEN bearer token; tool calls throw if the env var is unset. Free tokens are available at pandascore.co.

---

## 38. GolfCourseAPI

| | |
|---|---|
| **Prefix** | `golfcourse_` |
| **Tools** | 6 |
| **API Base** | `https://api.golfcourseapi.com/v1` |
| **Auth** | `GOLFCOURSE_API_KEY` |
| **Rate Limits** | 300/day |
| **Sports** | 30K+ golf courses worldwide |

**Tools:** `golfcourse_search_courses`, `golfcourse_get_course`, `golfcourse_get_courses_nearby`, `golfcourse_get_countries`, `golfcourse_get_states`, `golfcourse_get_course_reviews`

**Caveats:** Requires a free GOLFCOURSE_API_KEY (email signup); calls throw an error if the key is missing. Auth is sent as an "Authorization: Key <token>" header.

---

## 39. College Football Data

| | |
|---|---|
| **Prefix** | `cfbd_` |
| **Tools** | 14 |
| **API Base** | `https://apinext.collegefootballdata.com` |
| **Auth** | `CFBD_API_KEY` |
| **Rate Limits** | 1000/mo |
| **Sports** | NCAA football (games, stats, recruiting) |

**Tools:** `cfbd_get_games`, `cfbd_get_game`, `cfbd_get_teams`, `cfbd_get_team`, `cfbd_get_rankings`, `cfbd_get_standings`, `cfbd_get_drives`, `cfbd_get_plays`, `cfbd_get_player_stats`, `cfbd_get_team_stats`, `cfbd_get_recruiting`, `cfbd_get_betting_lines`, `cfbd_get_conferences`, `cfbd_get_venues`

**Caveats:** Requires a free CFBD_API_KEY, sent as a Bearer token in the Authorization header; calls throw if it is missing.

---

## 40. Boxing Data API

| | |
|---|---|
| **Prefix** | `boxing_` |
| **Tools** | 8 |
| **API Base** | `https://boxing-data-api.p.rapidapi.com/v1` |
| **Auth** | `BOXING_DATA_API_KEY` |
| **Rate Limits** | 100/mo |
| **Sports** | Pro boxing — fighters, bouts, events, divisions, titles |

**Tools:** `boxing_get_fighters`, `boxing_get_fighter`, `boxing_get_events`, `boxing_get_event`, `boxing_get_bouts`, `boxing_get_bout`, `boxing_get_divisions`, `boxing_get_titles`

**Caveats:** Accessed via RapidAPI (X-RapidAPI-Key header). Free Basic plan = 100 requests/MONTH — use sparingly.

---

## 41. Highlightly

| | |
|---|---|
| **Prefix** | `highlightly_` |
| **Tools** | 6 |
| **API Base** | `https://sports.highlightly.net/{sport}` |
| **Auth** | `HIGHLIGHTLY_API_KEY` |
| **Rate Limits** | 100/day |
| **Sports** | Multi-sport video highlights, odds, standings, predictions |

**Tools:** `highlightly_get_leagues`, `highlightly_get_matches`, `highlightly_get_standings`, `highlightly_get_highlights`, `highlightly_get_odds`, `highlightly_get_head_to_head`

**Caveats:** x-rapidapi-key header. Free Basic = 100 req/day, no credit card. Distinctive value: video highlight clips + pre-match predictions + odds from 100+ bookmakers.

