# Tools Reference

Complete list of all 205 tools grouped by provider. Parameters in **bold** are required.

---

## ESPN (`espn_`) -- 10 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `espn_get_scoreboard` | Get live or date-specific scores for a sport/league | **sport**, **league**, dates?, limit? |
| `espn_get_standings` | Get league standings with records and rankings | **sport**, **league**, season?, group? |
| `espn_get_teams` | List all teams in a league | **sport**, **league**, limit? |
| `espn_get_team_details` | Get detailed team info including record, venue, next event | **sport**, **league**, **team_id** |
| `espn_get_team_roster` | Get full roster with positions and jersey numbers | **sport**, **league**, **team_id** |
| `espn_get_team_schedule` | Get a team's season schedule | **sport**, **league**, **team_id**, season? |
| `espn_get_event_summary` | Get detailed event summary with play-by-play and box score | **sport**, **league**, **event_id** |
| `espn_get_athlete` | Get athlete bio, stats, and career history | **sport**, **league**, **athlete_id** |
| `espn_get_news` | Get latest news articles for a sport/league | **sport**, **league**, limit? |
| `espn_get_seasons` | Get available seasons with types and date ranges | **sport**, **league** |

`sport`: e.g. "football", "basketball", "baseball", "hockey", "soccer", "mma", "golf", "tennis", "racing"
`league`: e.g. "nfl", "nba", "mlb", "nhl", "eng.1", "usa.1", "ufc", "pga", "f1"

---

## NHL (`nhl_`) -- 13 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `nhl_get_schedule` | Get NHL schedule for a date | date? |
| `nhl_get_scores` | Get live and final scores for today | _(none)_ |
| `nhl_get_standings` | Get NHL standings | date?, season? |
| `nhl_get_game_boxscore` | Get box score (goals, assists, shots, saves) | **game_id** |
| `nhl_get_game_play_by_play` | Get full play-by-play feed | **game_id** |
| `nhl_get_game_landing` | Get game landing page (summary, three stars, scoring) | **game_id** |
| `nhl_get_team_roster` | Get team roster (forwards, defense, goalies) | **team_abbrev**, season? |
| `nhl_get_team_schedule` | Get monthly schedule for a team | **team_abbrev**, month? |
| `nhl_get_team_stats` | Get current-season team stats | **team_abbrev** |
| `nhl_get_player` | Get player bio, career stats, awards | **player_id** |
| `nhl_get_player_game_log` | Get game-by-game stats for a player | **player_id**, season?, game_type? |
| `nhl_get_stat_leaders` | Get stat leaders (points, goals, assists, etc.) | category?, season? |
| `nhl_get_draft` | Get current draft rankings and prospects | _(none)_ |

`team_abbrev`: 3-letter abbreviation (e.g. "TOR", "MTL", "BOS")
`season`: 8-digit format (e.g. "20232024")
`game_id`: NHL game ID (e.g. 2023020001)

---

## MLB (`mlb_`) -- 13 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `mlb_get_schedule` | Get game schedule for a date or date range | date?, startDate?, endDate?, teamId?, sportId |
| `mlb_get_game` | Get detailed live game feed (plays, box score, line score) | **game_pk** |
| `mlb_get_game_play_by_play` | Get play-by-play with all at-bats and pitches | **game_pk** |
| `mlb_get_game_boxscore` | Get box score with batting and pitching stats | **game_pk** |
| `mlb_get_game_linescore` | Get inning-by-inning scoring summary | **game_pk** |
| `mlb_get_standings` | Get league standings with records and streaks | leagueId?, season?, standingsTypes |
| `mlb_get_teams` | List MLB teams with IDs, venues, divisions | sportId, season? |
| `mlb_get_team_roster` | Get team roster with player details | **team_id**, rosterType, season? |
| `mlb_get_player` | Get player info with optional hydrated stats | **player_id**, hydrate? |
| `mlb_get_player_stats` | Get player statistics by type and group | **player_id**, **stats_type**, **group**, season? |
| `mlb_search_players` | Search players by name | **names**, sportId |
| `mlb_get_divisions` | List all MLB divisions | _(none)_ |
| `mlb_get_league_leaders` | Get league stat leaders | **leaderCategories**, season?, sportId |

`sportId`: 1=MLB, 11=AAA, 12=AA, 13=A, 14=A-short
`stats_type`: "season", "career", "gameLog", "yearByYear", "seasonAdvanced"
`group`: "hitting", "pitching", "fielding"

---

## Jolpica F1 (`f1_`) -- 13 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `f1_get_race_results` | Get race finishing positions, times, status | season?, round?, limit?, offset? |
| `f1_get_qualifying` | Get Q1/Q2/Q3 qualifying times | season?, round?, limit?, offset? |
| `f1_get_sprint` | Get sprint race results | season?, round?, limit?, offset? |
| `f1_get_driver_standings` | Get World Drivers' Championship standings | season?, limit?, offset? |
| `f1_get_constructor_standings` | Get World Constructors' Championship standings | season?, limit?, offset? |
| `f1_get_schedule` | Get race calendar with circuit info and dates | season?, limit?, offset? |
| `f1_get_drivers` | List drivers for a season or all-time | season?, limit?, offset? |
| `f1_get_constructors` | List constructors/teams | season?, limit?, offset? |
| `f1_get_circuits` | List circuits with locations and coordinates | season?, limit?, offset? |
| `f1_get_lap_times` | Get lap times for a race (from 1996) | **season**, **round**, lap?, limit?, offset? |
| `f1_get_pit_stops` | Get pit stop data for a race (from 2012) | **season**, **round**, stop?, limit?, offset? |
| `f1_get_seasons` | List all F1 seasons (1950-present) | limit?, offset? |
| `f1_get_driver_results` | Get all race results for a specific driver | **driver_id**, season?, limit?, offset? |

`season`: year string (e.g. "2024") or "current"
`driver_id`: e.g. "hamilton", "max_verstappen", "leclerc"

---

## OpenF1 (`openf1_`) -- 12 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `openf1_get_sessions` | List F1 sessions (practice, qualifying, race) | session_key?, session_name?, session_type?, country_name?, year?, circuit_short_name? |
| `openf1_get_drivers` | Get driver info for a session | session_key?, driver_number?, name_acronym? |
| `openf1_get_laps` | Get lap timing data with sector times | **session_key**, driver_number?, lap_number? |
| `openf1_get_positions` | Get position changes over time | **session_key**, driver_number?, position? |
| `openf1_get_car_data` | Get car telemetry (speed, RPM, gear, throttle, brake, DRS) | **session_key**, driver_number?, speed_gte?, speed_lte?, date_gte?, date_lte? |
| `openf1_get_intervals` | Get gap between drivers and leader | **session_key**, driver_number? |
| `openf1_get_stints` | Get stint data (tire compound, lap counts, tire age) | **session_key**, driver_number?, compound? |
| `openf1_get_pit` | Get pit stop times and durations | **session_key**, driver_number?, pit_duration_lte? |
| `openf1_get_race_control` | Get race control messages (flags, penalties, safety cars) | **session_key**, flag?, category? |
| `openf1_get_weather` | Get weather data (temperature, humidity, wind, rain) | **session_key**, date_gte?, date_lte? |
| `openf1_get_team_radio` | Get team radio message URLs | **session_key**, driver_number? |
| `openf1_get_meetings` | Get meeting/event info | meeting_key?, year?, country_name? |

**Warning:** `openf1_get_car_data` returns massive datasets. Always use `date_gte`/`date_lte` filters.

---

## OpenLigaDB (`openliga_`) -- 10 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `openliga_get_matches_by_league_season` | Get all matches for a league and season | **league_shortcut**, **season** |
| `openliga_get_matches_by_matchday` | Get matches for a specific matchday | **league_shortcut**, **season**, **matchday** |
| `openliga_get_current_matchday` | Get current matchday matches | **league_shortcut** |
| `openliga_get_match_data` | Get detailed match data by ID | **match_id** |
| `openliga_get_table` | Get league table/standings | **league_shortcut**, **season** |
| `openliga_get_top_scorers` | Get top goal scorers | **league_shortcut**, **season** |
| `openliga_get_teams` | Get teams in a league for a season | **league_shortcut**, **season** |
| `openliga_get_available_leagues` | List all available leagues | _(none)_ |
| `openliga_get_next_match_by_team` | Get next upcoming match for a team | **team_id** |
| `openliga_get_last_match_by_team` | Get last completed match for a team | **team_id** |

`league_shortcut`: bl1 (Bundesliga), bl2 (2. Bundesliga), bl3 (3. Liga), dfb (DFB-Pokal), ucl (Champions League)

---

## TheSportsDB (`sportsdb_`) -- 13 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `sportsdb_search_teams` | Search teams by name | **team_name** |
| `sportsdb_search_players` | Search players by name or list players on a team | player_name?, team_name? |
| `sportsdb_get_team_details` | Get full team details by ID | **team_id** |
| `sportsdb_get_player_details` | Get full player details by ID | **player_id** |
| `sportsdb_get_league_list` | List leagues, optionally by country/sport | country?, sport? |
| `sportsdb_get_events_by_date` | Get events on a specific date | **date**, sport?, league? |
| `sportsdb_get_event_details` | Get full event details by ID | **event_id** |
| `sportsdb_get_last_events` | Get last 15 completed events for a team | **team_id** |
| `sportsdb_get_next_events` | Get next 15 upcoming events for a team | **team_id** |
| `sportsdb_get_standings` | Get league standings | **league_id**, **season** |
| `sportsdb_get_event_results` | Get results for a specific round | **league_id**, **round**, **season** |
| `sportsdb_get_seasons` | List available seasons for a league | **league_id** |
| `sportsdb_get_sports_list` | List all available sports | _(none)_ |

---

## API-Sports (`apisports_`) -- 10 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `apisports_get_fixtures` | Get fixtures/matches for a sport | **sport**, league?, season?, date?, from?, to?, team?, live? |
| `apisports_get_standings` | Get league standings | **sport**, **league**, **season** |
| `apisports_get_teams` | Search teams by name, country, league, or ID | **sport**, id?, name?, league?, country?, season? |
| `apisports_get_players` | Get player info and statistics | **sport**, league?, season?, team?, player_id?, page? |
| `apisports_get_odds` | Get betting odds for fixtures | **sport**, fixture_id?, league?, season?, bookmaker? |
| `apisports_get_leagues` | List leagues/competitions | **sport**, country?, season?, id? |
| `apisports_get_live_scores` | Get live scores for active matches | **sport**, league? |
| `apisports_get_team_statistics` | Get detailed team stats for a league/season | **sport**, **league**, **season**, **team** |
| `apisports_get_head2head` | Get head-to-head results between two teams | **sport**, **h2h** |
| `apisports_get_status` | Check API account status and quota | **sport** |

`sport`: football, basketball, baseball, hockey, rugby, handball, volleyball, american-football, formula-1
`h2h`: "teamId1-teamId2"

---

## API-Football (`apifootball_`) -- 15 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `apifootball_get_fixtures` | Get football fixtures/matches | id?, league?, season?, team?, date?, from?, to?, live?, round?, status? |
| `apifootball_get_fixture_events` | Get events (goals, cards, subs, VAR) | **fixture_id** |
| `apifootball_get_fixture_lineups` | Get starting lineups and subs | **fixture_id** |
| `apifootball_get_fixture_statistics` | Get match statistics (shots, possession, etc.) | **fixture_id** |
| `apifootball_get_standings` | Get league standings/table | **league**, **season** |
| `apifootball_get_teams` | Search teams | id?, name?, league?, season?, country? |
| `apifootball_get_players` | Get player statistics (paginated, 25/page) | id?, team?, league?, season?, search?, page? |
| `apifootball_get_top_scorers` | Get top scorers for a league | **league**, **season** |
| `apifootball_get_transfers` | Get transfer history | player?, team? |
| `apifootball_get_injuries` | Get injury and suspension reports | league?, season?, fixture?, team?, player?, date? |
| `apifootball_get_predictions` | Get AI predictions for a fixture | **fixture_id** |
| `apifootball_get_odds` | Get pre-match betting odds | fixture?, league?, season?, bookmaker?, bet? |
| `apifootball_get_leagues` | List leagues and cups (960+) | id?, name?, country?, season?, current? |
| `apifootball_get_countries` | List all countries | _(none)_ |
| `apifootball_get_status` | Check API account status and quota | _(none)_ |

---

## API-Tennis (`apitennis_`) -- 12 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `apitennis_get_rankings` | Get ATP/WTA player rankings | search? |
| `apitennis_get_seasons` | Get all available seasons | _(none)_ |
| `apitennis_get_categories` | Get tournament categories (ATP, WTA, ITF) | id? |
| `apitennis_get_countries` | List all countries | _(none)_ |
| `apitennis_get_leagues` | Get tournaments and leagues | id?, country_id?, season? |
| `apitennis_get_fixtures` | Get matches/fixtures | id?, date?, league?, season?, h2h? |
| `apitennis_get_live` | Get all currently live matches | _(none)_ |
| `apitennis_get_standings` | Get tournament standings | **league**, **season** |
| `apitennis_get_players` | Search players | search?, id?, country_id? |
| `apitennis_get_head2head` | Get head-to-head record between two players | **h2h** |
| `apitennis_get_statistics` | Get detailed match statistics | **fixture_id** |
| `apitennis_get_status` | Check API account status and quota | _(none)_ |

`h2h`: "playerId1-playerId2"

---

## BallDontLie (`bdl_`) -- 10 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `bdl_get_players` | Search or list players | **sport**, search?, cursor?, per_page? |
| `bdl_get_player_by_id` | Get player details by ID | **sport**, **player_id** |
| `bdl_get_teams` | List teams with optional filters | **sport**, conference?, division? |
| `bdl_get_games` | Get games with filters | **sport**, dates?[], seasons?[], team_ids?[], cursor?, per_page? |
| `bdl_get_game_by_id` | Get game details by ID | **sport**, **game_id** |
| `bdl_get_stats` | Get player game stats | **sport**, player_ids?[], game_ids?[], seasons?[], cursor?, per_page? |
| `bdl_get_season_averages` | Get season averages for players | **sport**, **season**, **player_ids**[] |
| `bdl_get_box_scores` | Get box scores for a date | **sport**, **date** |
| `bdl_get_standings` | Get standings for a season | **sport**, **season** |
| `bdl_get_leaders` | Get statistical leaders | **sport**, **season**, **stat_type** |

`sport`: nba, nfl, mlb, nhl
`stat_type`: pts, reb, ast (NBA); passing_yards, rushing_yards (NFL); etc.

---

## CricketData (`cricket_`) -- 10 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `cricket_get_current_matches` | Get live and current matches (all formats) | offset? |
| `cricket_get_match_info` | Get detailed match information | **match_id** |
| `cricket_get_match_scorecard` | Get full scorecard (batting/bowling details) | **match_id** |
| `cricket_get_match_bbb` | Get ball-by-ball commentary and data | **match_id** |
| `cricket_get_series` | List series and tournaments | offset? |
| `cricket_get_series_info` | Get series/tournament details | **series_id** |
| `cricket_get_players` | Search players by name | search?, offset? |
| `cricket_get_player_info` | Get player profile and statistics | **player_id** |
| `cricket_get_countries` | List cricket-playing countries | _(none)_ |
| `cricket_get_match_list` | Get upcoming and recent matches | offset? |

---

## football-data.org (`footballdata_`) -- 11 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `footballdata_get_competitions` | List competitions (12 free) | areas? |
| `footballdata_get_competition` | Get competition details | **competition_code** |
| `footballdata_get_standings` | Get league table | **competition_code**, season?, matchday? |
| `footballdata_get_matches` | Get matches with filters | competition_code?, team_id?, dateFrom?, dateTo?, status?, matchday? |
| `footballdata_get_match` | Get detailed match info | **match_id** |
| `footballdata_get_teams` | List teams in a competition | **competition_code**, season? |
| `footballdata_get_team` | Get team details with squad | **team_id** |
| `footballdata_get_team_matches` | Get matches for a team | **team_id**, dateFrom?, dateTo?, status?, competitions? |
| `footballdata_get_scorers` | Get top scorers | **competition_code**, season?, limit? |
| `footballdata_get_person` | Get player or coach details | **person_id** |
| `footballdata_get_areas` | List football areas and countries | _(none)_ |

`competition_code`: PL, ELC, BL1, SA, PD, FL1, DED, PPL, CL, EC, WC, CLI

---

## Sportmonks (`sportmonks_`) -- 12 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `sportmonks_get_leagues` | List football leagues | include?, page? |
| `sportmonks_get_fixtures` | Get fixtures with filters | league_id?, season_id?, date?, team_id?, include?, page? |
| `sportmonks_get_fixture_by_id` | Get fixture details | **fixture_id**, include? |
| `sportmonks_get_livescores` | Get current live scores | include? |
| `sportmonks_get_standings` | Get standings for a season | **season_id**, include? |
| `sportmonks_get_teams` | List teams, optionally by country | country_id?, include?, page? |
| `sportmonks_get_team_by_id` | Get team details | **team_id**, include? |
| `sportmonks_get_players` | Search players by name or country | search?, country_id?, include?, page? |
| `sportmonks_get_player_by_id` | Get player details | **player_id**, include? |
| `sportmonks_get_topscorers` | Get top scorers for a season | **season_id**, include? |
| `sportmonks_get_seasons` | List seasons, optionally by league | league_id?, page? |
| `sportmonks_get_countries` | List all countries | _(none)_ |

`include`: Comma-separated related data to embed (e.g. "scores,events,lineups,statistics,participants")

---

## SportsDataIO (`sportsdata_`) -- 12 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `sportsdata_get_games_by_date` | Get games scheduled for a date | **sport**, **date** |
| `sportsdata_get_standings` | Get standings for a season | **sport**, **season** |
| `sportsdata_get_teams` | List all teams | **sport** |
| `sportsdata_get_player` | Get player info | **sport**, **player_id** |
| `sportsdata_get_player_stats_by_season` | Get player season statistics | **sport**, **season**, **player_id** |
| `sportsdata_get_injuries` | Get current injury reports | **sport** |
| `sportsdata_get_news` | Get latest news | **sport** |
| `sportsdata_get_schedules` | Get full season schedule | **sport**, **season** |
| `sportsdata_get_scores_by_date` | Get scores for a date | **sport**, **date** |
| `sportsdata_get_odds_by_date` | Get betting odds for a date | **sport**, **date** |
| `sportsdata_get_dfs_slates` | Get DFS slates for a date | **sport**, **date** |
| `sportsdata_get_active_players` | Get all active players | **sport** |

`sport`: nfl, nba, mlb, nhl, soccer, mma, golf, nascar, tennis
Not all endpoints are available for all sports (e.g., no injuries for MMA, no odds for NASCAR).

---

## The Odds API (`odds_`) -- 9 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `odds_get_sports` | List all available sports and tournaments | _(none)_ |
| `odds_get_odds` | Get pre-match and live odds from 40+ bookmakers | **sport_key**, **regions**, markets?, oddsFormat?, bookmakers? |
| `odds_get_event_odds` | Get odds for a specific event | **sport_key**, **event_id**, **regions**, markets?, oddsFormat? |
| `odds_get_scores` | Get live and recent scores | **sport_key**, daysFrom? |
| `odds_get_events` | Get upcoming and live events | **sport_key**, dateFormat? |
| `odds_get_historical_odds` | Get odds at a specific point in time | **sport_key**, **regions**, **date**, markets?, oddsFormat? |
| `odds_get_historical_events` | Get events at a specific date | **sport_key**, **date** |
| `odds_get_player_props` | Get player prop odds for an event | **sport_key**, **event_id**, **regions**, **markets**, oddsFormat? |
| `odds_check_usage` | Check API request usage and remaining quota | _(none)_ |

`sport_key`: e.g. "americanfootball_nfl", "basketball_nba", "soccer_epl"
`regions`: us, eu, uk, au (comma-separated)
`markets`: h2h, spreads, totals (comma-separated)

---

## Fighting Tomatoes (`mma_`) -- 8 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `mma_search_fighters` | Search MMA fighters by name | **name** |
| `mma_get_fighter` | Get fighter details, record, stats, bio | **fighter_id** |
| `mma_get_fighter_fights` | Get complete fight history | **fighter_id** |
| `mma_get_events` | List MMA events with optional filters | organization?, date?, page? |
| `mma_get_event` | Get event details including fight card | **event_id** |
| `mma_get_fight` | Get fight details (result, method, round, time) | **fight_id** |
| `mma_get_organizations` | List all MMA organizations | _(none)_ |
| `mma_get_upcoming_events` | Get upcoming events | organization? |

`organization`: UFC, Bellator, ONE, PFL, etc.

---

## SportDevs (`sportdevs_`) -- 12 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `sportdevs_get_matches` | Get matches with filters | **sport**, date?, league_id?, team_id?, live? |
| `sportdevs_get_match_details` | Get full match details | **sport**, **match_id** |
| `sportdevs_get_match_lineups` | Get match lineups | **sport**, **match_id** |
| `sportdevs_get_match_statistics` | Get match statistics | **sport**, **match_id** |
| `sportdevs_get_standings` | Get league standings | **sport**, **league_id**, season_id? |
| `sportdevs_get_teams` | List teams by league or country | **sport**, league_id?, country? |
| `sportdevs_get_team` | Get team details | **sport**, **team_id** |
| `sportdevs_get_players` | List players, optionally by team | **sport**, team_id? |
| `sportdevs_get_player` | Get player details | **sport**, **player_id** |
| `sportdevs_get_leagues` | List leagues by country | **sport**, country? |
| `sportdevs_get_livescores` | Get all live scores | **sport** |
| `sportdevs_get_odds` | Get betting odds for a match | **sport**, **match_id** |

`sport`: rugby, volleyball, handball
