# Providers

Sports Hub aggregates 18 independent sports API providers. Each provider registers its own set of tools, all prefixed with the provider name to avoid collisions.

---

## 1. ESPN (unofficial)

| | |
|---|---|
| **Prefix** | `espn_` |
| **Tools** | 10 |
| **API Base** | `https://site.api.espn.com/apis/site/v2/sports` |
| **Auth** | None |
| **Rate Limits** | Unlimited (unofficial) |
| **Sports** | 20+ (NFL, NBA, MLB, NHL, soccer, MMA, golf, tennis, racing, college sports, etc.) |

**Tools:** `espn_get_scoreboard`, `espn_get_standings`, `espn_get_teams`, `espn_get_team_details`, `espn_get_team_roster`, `espn_get_team_schedule`, `espn_get_event_summary`, `espn_get_athlete`, `espn_get_news`, `espn_get_seasons`

**Caveats:** This is an unofficial, undocumented API. It can change or break without notice. No authentication required, but ESPN could restrict access at any time.

---

## 2. NHL Web API

| | |
|---|---|
| **Prefix** | `nhl_` |
| **Tools** | 13 |
| **API Base** | `https://api-web.nhle.com/v1` |
| **Auth** | None |
| **Rate Limits** | Unlimited |
| **Sports** | NHL |

**Tools:** `nhl_get_schedule`, `nhl_get_scores`, `nhl_get_standings`, `nhl_get_game_boxscore`, `nhl_get_game_play_by_play`, `nhl_get_game_landing`, `nhl_get_team_roster`, `nhl_get_team_schedule`, `nhl_get_team_stats`, `nhl_get_player`, `nhl_get_player_game_log`, `nhl_get_stat_leaders`, `nhl_get_draft`

**Caveats:** Official NHL API but not formally documented for third-party use. Uses team abbreviations (e.g., "TOR", "MTL") and season identifiers in `YYYYYYYY` format (e.g., "20232024").

---

## 3. MLB Stats API

| | |
|---|---|
| **Prefix** | `mlb_` |
| **Tools** | 13 |
| **API Base** | `https://statsapi.mlb.com/api/v1` |
| **Auth** | None |
| **Rate Limits** | Unlimited |
| **Sports** | MLB, MiLB (minor leagues via sportId parameter) |

**Tools:** `mlb_get_schedule`, `mlb_get_game`, `mlb_get_game_play_by_play`, `mlb_get_game_boxscore`, `mlb_get_game_linescore`, `mlb_get_standings`, `mlb_get_teams`, `mlb_get_team_roster`, `mlb_get_player`, `mlb_get_player_stats`, `mlb_search_players`, `mlb_get_divisions`, `mlb_get_league_leaders`

**Caveats:** Uses numeric IDs for teams and players. The `hydrate` parameter on some endpoints allows embedding additional data in responses.

---

## 4. Jolpica F1 (Ergast successor)

| | |
|---|---|
| **Prefix** | `f1_` |
| **Tools** | 13 |
| **API Base** | `http://api.jolpi.ca/ergast` |
| **Auth** | None |
| **Rate Limits** | Unlimited |
| **Sports** | Formula 1 |

**Tools:** `f1_get_race_results`, `f1_get_qualifying`, `f1_get_sprint`, `f1_get_driver_standings`, `f1_get_constructor_standings`, `f1_get_schedule`, `f1_get_drivers`, `f1_get_constructors`, `f1_get_circuits`, `f1_get_lap_times`, `f1_get_pit_stops`, `f1_get_seasons`, `f1_get_driver_results`

**Caveats:** Community-maintained successor to the Ergast API. Historical data goes back to 1950. Lap times available from 1996, pit stop data from 2012. Supports pagination with `limit`/`offset` (max 1000 per request).

---

## 5. OpenF1

| | |
|---|---|
| **Prefix** | `openf1_` |
| **Tools** | 12 |
| **API Base** | `https://api.openf1.org/v1` |
| **Auth** | None |
| **Rate Limits** | Unlimited |
| **Sports** | Formula 1 (live telemetry) |

**Tools:** `openf1_get_sessions`, `openf1_get_drivers`, `openf1_get_laps`, `openf1_get_positions`, `openf1_get_car_data`, `openf1_get_intervals`, `openf1_get_stints`, `openf1_get_pit`, `openf1_get_race_control`, `openf1_get_weather`, `openf1_get_team_radio`, `openf1_get_meetings`

**Caveats:** Focused on live and recent telemetry data (speed, RPM, throttle, brake, DRS). The `get_car_data` endpoint returns very large datasets (multiple samples per second per car). Always use date filters to limit data volume.

---

## 6. OpenLigaDB

| | |
|---|---|
| **Prefix** | `openliga_` |
| **Tools** | 10 |
| **API Base** | `https://api.openligadb.de` |
| **Auth** | None |
| **Rate Limits** | Unlimited |
| **Sports** | Football (German focus) |

**Tools:** `openliga_get_matches_by_league_season`, `openliga_get_matches_by_matchday`, `openliga_get_current_matchday`, `openliga_get_match_data`, `openliga_get_table`, `openliga_get_top_scorers`, `openliga_get_teams`, `openliga_get_available_leagues`, `openliga_get_next_match_by_team`, `openliga_get_last_match_by_team`

**Caveats:** Primarily covers German football (Bundesliga, 2. Bundesliga, 3. Liga, DFB-Pokal) plus some Champions League data. Uses league shortcuts like `bl1`, `bl2`, `bl3`, `dfb`, `ucl`. Returns formatted text, not raw JSON.

---

## 7. TheSportsDB

| | |
|---|---|
| **Prefix** | `sportsdb_` |
| **Tools** | 13 |
| **API Base** | `https://www.thesportsdb.com/api/v1/json/{key}/` |
| **Auth** | API key in URL path (defaults to test key `"3"`) |
| **Rate Limits** | 30 req/min (test key) |
| **Sports** | 40+ (soccer, basketball, baseball, hockey, motorsport, fighting, etc.) |

**Tools:** `sportsdb_search_teams`, `sportsdb_search_players`, `sportsdb_get_team_details`, `sportsdb_get_player_details`, `sportsdb_get_league_list`, `sportsdb_get_events_by_date`, `sportsdb_get_event_details`, `sportsdb_get_last_events`, `sportsdb_get_next_events`, `sportsdb_get_standings`, `sportsdb_get_event_results`, `sportsdb_get_seasons`, `sportsdb_get_sports_list`

**Caveats:** Works without a key using the test key `"3"`, but with lower rate limits and some features restricted. A Patreon key unlocks higher limits. Good for metadata (team info, logos, stadiums) across many sports.

---

## 8. API-Sports

| | |
|---|---|
| **Prefix** | `apisports_` |
| **Tools** | 10 |
| **API Base** | `https://v3.{sport}.api-sports.io` |
| **Auth** | `x-apisports-key` header |
| **Env Variable** | `API_SPORTS_KEY` |
| **Rate Limits** | 100 req/day per sport (free tier) |
| **Sports** | Football, basketball, baseball, hockey, rugby, handball, volleyball, American football, Formula 1 |

**Tools:** `apisports_get_fixtures`, `apisports_get_standings`, `apisports_get_teams`, `apisports_get_players`, `apisports_get_odds`, `apisports_get_leagues`, `apisports_get_live_scores`, `apisports_get_team_statistics`, `apisports_get_head2head`, `apisports_get_status`

**Caveats:** Each sport has its own subdomain and its own daily quota. The `sport` parameter is required for every call. Formula 1 uses different endpoint names internally (e.g., "races" instead of "fixtures").

---

## 9. API-Football

| | |
|---|---|
| **Prefix** | `apifootball_` |
| **Tools** | 15 |
| **API Base** | `https://v3.football.api-sports.io` |
| **Auth** | `x-apisports-key` header |
| **Env Variable** | `API_FOOTBALL_KEY` |
| **Rate Limits** | 100 req/day (free tier) |
| **Sports** | Soccer (960+ leagues and cups worldwide) |

**Tools:** `apifootball_get_fixtures`, `apifootball_get_fixture_events`, `apifootball_get_fixture_lineups`, `apifootball_get_fixture_statistics`, `apifootball_get_standings`, `apifootball_get_teams`, `apifootball_get_players`, `apifootball_get_top_scorers`, `apifootball_get_transfers`, `apifootball_get_injuries`, `apifootball_get_predictions`, `apifootball_get_odds`, `apifootball_get_leagues`, `apifootball_get_countries`, `apifootball_get_status`

**Caveats:** Built on the API-Sports platform but uses its own API key (`API_FOOTBALL_KEY`). Very comprehensive soccer coverage. The free tier is limited to 100 requests per day total. Use `get_status` to check remaining quota.

---

## 10. API-Tennis

| | |
|---|---|
| **Prefix** | `apitennis_` |
| **Tools** | 12 |
| **API Base** | `https://v1.tennis.api-sports.io` |
| **Auth** | `x-apisports-key` header |
| **Env Variable** | `API_TENNIS_KEY` |
| **Rate Limits** | 100 req/day (free tier) |
| **Sports** | Tennis (ATP, WTA, ITF) |

**Tools:** `apitennis_get_rankings`, `apitennis_get_seasons`, `apitennis_get_categories`, `apitennis_get_countries`, `apitennis_get_leagues`, `apitennis_get_fixtures`, `apitennis_get_live`, `apitennis_get_standings`, `apitennis_get_players`, `apitennis_get_head2head`, `apitennis_get_statistics`, `apitennis_get_status`

**Caveats:** Part of the API-Sports platform. Covers ATP, WTA, and ITF tournaments. Head-to-head comparisons use player IDs in `"id1-id2"` format.

---

## 11. BallDontLie

| | |
|---|---|
| **Prefix** | `bdl_` |
| **Tools** | 10 |
| **API Base** | `https://api.balldontlie.io/v1` |
| **Auth** | `Authorization: Bearer {key}` header |
| **Env Variable** | `BALLDONTLIE_API_KEY` |
| **Rate Limits** | Basic tier limits (varies by plan) |
| **Sports** | NBA, NFL, MLB, NHL |

**Tools:** `bdl_get_players`, `bdl_get_player_by_id`, `bdl_get_teams`, `bdl_get_games`, `bdl_get_game_by_id`, `bdl_get_stats`, `bdl_get_season_averages`, `bdl_get_box_scores`, `bdl_get_standings`, `bdl_get_leaders`

**Caveats:** Requires a `sport` parameter for every call (nba, nfl, mlb, or nhl). Uses cursor-based pagination. Array parameters (dates, team_ids, player_ids) are supported.

---

## 12. CricketData

| | |
|---|---|
| **Prefix** | `cricket_` |
| **Tools** | 10 |
| **API Base** | `https://api.cricapi.com/v1` |
| **Auth** | `apikey` query parameter |
| **Env Variable** | `CRICKETDATA_API_KEY` |
| **Rate Limits** | 100 req/day (free tier) |
| **Sports** | Cricket (all formats: Test, ODI, T20, IPL, BBL, etc.) |

**Tools:** `cricket_get_current_matches`, `cricket_get_match_info`, `cricket_get_match_scorecard`, `cricket_get_match_bbb`, `cricket_get_series`, `cricket_get_series_info`, `cricket_get_players`, `cricket_get_player_info`, `cricket_get_countries`, `cricket_get_match_list`

**Caveats:** The API key is passed as a query parameter (stripped from results for security). Ball-by-ball data (`get_match_bbb`) may count as multiple requests.

---

## 13. football-data.org

| | |
|---|---|
| **Prefix** | `footballdata_` |
| **Tools** | 11 |
| **API Base** | `https://api.football-data.org/v4` |
| **Auth** | `X-Auth-Token` header |
| **Env Variable** | `FOOTBALL_DATA_API_KEY` |
| **Rate Limits** | 10 req/min (free tier) |
| **Sports** | Soccer (12 free competitions) |

**Tools:** `footballdata_get_competitions`, `footballdata_get_competition`, `footballdata_get_standings`, `footballdata_get_matches`, `footballdata_get_match`, `footballdata_get_teams`, `footballdata_get_team`, `footballdata_get_team_matches`, `footballdata_get_scorers`, `footballdata_get_person`, `footballdata_get_areas`

**Free tier competition codes:** PL (Premier League), ELC (Championship), BL1 (Bundesliga), SA (Serie A), PD (La Liga), FL1 (Ligue 1), DED (Eredivisie), PPL (Primeira Liga), CL (Champions League), EC (European Championship), WC (World Cup), CLI (Copa Libertadores).

**Caveats:** Only the 12 listed competitions are available on the free tier. Paid plans unlock more leagues. Rate limit of 10 requests per minute is strictly enforced.

---

## 14. Sportmonks

| | |
|---|---|
| **Prefix** | `sportmonks_` |
| **Tools** | 12 |
| **API Base** | `https://api.sportmonks.com/v3` |
| **Auth** | `Authorization` header |
| **Env Variable** | `SPORTMONKS_API_KEY` |
| **Rate Limits** | 3000 req/hr |
| **Sports** | Soccer |

**Tools:** `sportmonks_get_leagues`, `sportmonks_get_fixtures`, `sportmonks_get_fixture_by_id`, `sportmonks_get_livescores`, `sportmonks_get_standings`, `sportmonks_get_teams`, `sportmonks_get_team_by_id`, `sportmonks_get_players`, `sportmonks_get_player_by_id`, `sportmonks_get_topscorers`, `sportmonks_get_seasons`, `sportmonks_get_countries`

**Caveats:** Free plan is limited to Danish Superliga and Scottish Premiership. Use the `include` parameter to embed related data (scores, events, lineups, statistics) in a single request instead of making multiple calls. Paid plans unlock all leagues.

---

## 15. SportsDataIO

| | |
|---|---|
| **Prefix** | `sportsdata_` |
| **Tools** | 12 |
| **API Base** | `https://api.sportsdata.io/v3/{sport}` (v4 for soccer) |
| **Auth** | `key` query parameter |
| **Env Variable** | `SPORTSDATA_IO_KEY` |
| **Rate Limits** | 1000 req/mo (free trial) |
| **Sports** | NFL, NBA, MLB, NHL, Soccer, MMA, Golf, NASCAR, Tennis |

**Tools:** `sportsdata_get_games_by_date`, `sportsdata_get_standings`, `sportsdata_get_teams`, `sportsdata_get_player`, `sportsdata_get_player_stats_by_season`, `sportsdata_get_injuries`, `sportsdata_get_news`, `sportsdata_get_schedules`, `sportsdata_get_scores_by_date`, `sportsdata_get_odds_by_date`, `sportsdata_get_dfs_slates`, `sportsdata_get_active_players`

**Caveats:** Free trial data is **scrambled/randomized** -- it is not real data. Useful for testing API structure but not for actual sports information. Some endpoints are unavailable for certain sports (e.g., no injuries for MMA, no odds for NASCAR). Each sport uses a `sport` parameter.

---

## 16. The Odds API

| | |
|---|---|
| **Prefix** | `odds_` |
| **Tools** | 9 |
| **API Base** | `https://api.the-odds-api.com/v4` |
| **Auth** | `apiKey` query parameter |
| **Env Variable** | `THE_ODDS_API_KEY` |
| **Rate Limits** | 500 req/mo (free tier) |
| **Sports** | 70+ sports (odds and scores) |

**Tools:** `odds_get_sports`, `odds_get_odds`, `odds_get_event_odds`, `odds_get_scores`, `odds_get_events`, `odds_get_historical_odds`, `odds_get_historical_events`, `odds_get_player_props`, `odds_check_usage`

**Caveats:** Focused on betting odds from 40+ bookmakers. Each API response includes usage headers showing remaining requests. The `odds_check_usage` tool lets you check your quota without consuming an extra request (it queries the sports endpoint). Historical odds and player props are available. Use `odds_get_sports` first to discover available sport keys.

---

## 17. Fighting Tomatoes (MMA)

| | |
|---|---|
| **Prefix** | `mma_` |
| **Tools** | 8 |
| **API Base** | `https://fightingtomatoes.com/api` |
| **Auth** | `Authorization: Bearer {key}` header |
| **Env Variable** | `FIGHTING_TOMATOES_API_KEY` |
| **Rate Limits** | 200 req/mo (free tier) |
| **Sports** | MMA (UFC, Bellator, ONE, PFL, etc.) |

**Tools:** `mma_search_fighters`, `mma_get_fighter`, `mma_get_fighter_fights`, `mma_get_events`, `mma_get_event`, `mma_get_fight`, `mma_get_organizations`, `mma_get_upcoming_events`

**Caveats:** Covers multiple MMA organizations. The 200 req/mo limit is strict -- plan your queries carefully. Use `mma_get_organizations` to discover available organizations, then filter events by organization name.

---

## 18. SportDevs

| | |
|---|---|
| **Prefix** | `sportdevs_` |
| **Tools** | 12 |
| **API Base** | `https://{sport}.sportdevs.com` |
| **Auth** | `Authorization: Bearer {key}` header |
| **Env Variable** | `SPORTDEVS_API_KEY` |
| **Rate Limits** | Trial tier limits |
| **Sports** | Rugby, Volleyball, Handball |

**Tools:** `sportdevs_get_matches`, `sportdevs_get_match_details`, `sportdevs_get_match_lineups`, `sportdevs_get_match_statistics`, `sportdevs_get_standings`, `sportdevs_get_teams`, `sportdevs_get_team`, `sportdevs_get_players`, `sportdevs_get_player`, `sportdevs_get_leagues`, `sportdevs_get_livescores`, `sportdevs_get_odds`

**Caveats:** Uses PostgREST-style query filtering internally (e.g., `eq.VALUE`). Each sport has its own subdomain. The `sport` parameter (rugby, volleyball, or handball) is required on every call. Coverage and availability may vary by sport and league.
