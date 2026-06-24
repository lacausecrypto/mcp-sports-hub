# Tools Reference

Complete list of all **396 tools** grouped by provider. Parameters in **bold** are required; `?` marks optional.

---

## ESPN (unofficial) (`espn_`) — 10 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `espn_get_scoreboard` | Get live or date-specific scores for a sport/league with game status, scores, and basic game info. | **sport**, **league**, dates?, limit? |
| `espn_get_standings` | Get league standings with team records, win/loss, and ranking info. | **sport**, **league**, season?, group? |
| `espn_get_teams` | List all teams in a league with names, IDs, abbreviations, logos, and locations. | **sport**, **league**, limit? |
| `espn_get_team_details` | Get detailed information about a specific team (record, stats, venue, next event). | **sport**, **league**, **team_id** |
| `espn_get_team_roster` | Get the full roster for a team (player names, positions, jersey numbers, basic stats). | **sport**, **league**, **team_id** |
| `espn_get_team_schedule` | Get a team's schedule for a season, including past results and upcoming games. | **sport**, **league**, **team_id**, season? |
| `espn_get_event_summary` | Get a detailed summary of a specific event/game (play-by-play, box score, leaders, game info). | **sport**, **league**, **event_id** |
| `espn_get_athlete` | Get information about a specific athlete (bio, stats, career history). | **sport**, **league**, **athlete_id** |
| `espn_get_news` | Get the latest news articles for a sport/league (headlines, descriptions, links). | **sport**, **league**, limit? |
| `espn_get_seasons` | Get available seasons for a sport/league with season types and date ranges. | **sport**, **league** |

sport: "football", "basketball", "baseball", "hockey", "soccer", "mma", "golf", "tennis", "racing"
league: "nfl", "nba", "mlb", "nhl", "wnba", "college-football", "mens-college-basketball", "eng.1", "usa.1", "ufc", "pga", "atp", "f1"

---

## NHL Web API (`nhl_`) — 13 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `nhl_get_schedule` | Get the NHL schedule for a given date (games, start times, teams, venues). | date? |
| `nhl_get_scores` | Get live and final scores for today's NHL games. | _(none)_ |
| `nhl_get_standings` | Get NHL standings, optionally filtered by date or season. | date?, season? |
| `nhl_get_game_boxscore` | Get the box score for a specific NHL game (goals, assists, shots, saves, stats). | **game_id** |
| `nhl_get_game_play_by_play` | Get the full play-by-play feed for an NHL game (every event). | **game_id** |
| `nhl_get_game_landing` | Get the game landing page data for an NHL game (summary, three stars, scoring plays). | **game_id** |
| `nhl_get_team_roster` | Get an NHL team's roster (forwards, defensemen, goalies with numbers and positions). | **team_abbrev**, season? |
| `nhl_get_team_schedule` | Get the monthly schedule for an NHL team. | **team_abbrev**, month? |
| `nhl_get_team_stats` | Get current-season stats for an NHL team (goals, shots, power play, penalty kill). | **team_abbrev** |
| `nhl_get_player` | Get detailed info about an NHL player (bio, career stats, current season stats, awards). | **player_id** |
| `nhl_get_player_game_log` | Get the game-by-game stats log for an NHL player in a given season. | **player_id**, season?, game_type? |
| `nhl_get_stat_leaders` | Get NHL stat leaders for a given category (points, goals, assists, wins, etc.). | category?, season? |
| `nhl_get_draft` | Get the current NHL draft rankings and prospect information. | _(none)_ |

season: 8-digit tag, e.g. "20232024"; defaults to current season
team_abbrev: 3-letter code, e.g. "TOR", "MTL", "BOS"
game_type: 2 = regular season (default), 3 = playoffs
category (stat leaders): "points" (default), "goals", "assists", "plusMinus", "gaa", "savePctg", etc.

---

## MLB Stats API (`mlb_`) — 13 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `mlb_get_schedule` | Get the MLB game schedule for a date or date range, with scores, status, and teams. | date?, startDate?, endDate?, teamId?, sportId? |
| `mlb_get_game` | Get detailed live-feed game data including plays, box score, and line score. | **game_pk** |
| `mlb_get_game_play_by_play` | Get play-by-play data for a game including all at-bats and pitches. | **game_pk** |
| `mlb_get_game_boxscore` | Get the box score for a game with batting and pitching stats for both teams. | **game_pk** |
| `mlb_get_game_linescore` | Get the inning-by-inning line score for a game. | **game_pk** |
| `mlb_get_standings` | Get league standings with win/loss records, division ranks, and streaks. | leagueId?, season?, standingsTypes? |
| `mlb_get_teams` | List MLB teams with IDs, names, venues, divisions, and leagues. | sportId?, season? |
| `mlb_get_team_roster` | Get a team's roster with player names, positions, numbers, and status. | **team_id**, rosterType?, season? |
| `mlb_get_player` | Get detailed player info including bio, position, and optionally hydrated stats. | **player_id**, hydrate? |
| `mlb_get_player_stats` | Get detailed statistics for a player by stat type and group. | **player_id**, **stats_type**, **group**, season? |
| `mlb_search_players` | Search for players by name, returning IDs, teams, and positions. | **names**, sportId? |
| `mlb_get_divisions` | List all MLB divisions with IDs, names, and associated leagues. | _(none)_ |
| `mlb_get_league_leaders` | Get league stat leaders for categories like home runs, ERA, strikeouts, etc. | **leaderCategories**, season?, sportId? |

`sportId`: 1=MLB, 11=AAA, 12=AA, 13=A, 14=A-short
`leagueId`: 103=AL, 104=NL (standings defaults to both)
`group` (player stats): hitting, pitching, fielding
`stats_type`: season, career, gameLog, yearByYear, seasonAdvanced
`game_pk`: the unique MLB gamePk game ID

---

## Jolpica F1 (Ergast successor) (`f1_`) — 13 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `f1_get_race_results` | Get F1 race results (positions, drivers, constructors, times, status) for a season or round. | season?, round?, limit?, offset? |
| `f1_get_qualifying` | Get F1 qualifying results with Q1/Q2/Q3 times for a session. | season?, round?, limit?, offset? |
| `f1_get_sprint` | Get F1 sprint race results for a specific round. | season?, round?, limit?, offset? |
| `f1_get_driver_standings` | Get F1 World Drivers' Championship standings for a season. | season?, limit?, offset? |
| `f1_get_constructor_standings` | Get F1 World Constructors' Championship standings for a season. | season?, limit?, offset? |
| `f1_get_schedule` | Get the F1 race schedule/calendar for a season with circuit info and dates. | season?, limit?, offset? |
| `f1_get_drivers` | List F1 drivers for a season or all-time (IDs, names, nationalities). | season?, limit?, offset? |
| `f1_get_constructors` | List F1 constructors/teams for a season or all-time. | season?, limit?, offset? |
| `f1_get_circuits` | List F1 circuits for a season or all-time (names, locations, coordinates). | season?, limit?, offset? |
| `f1_get_lap_times` | Get lap times for a race (all laps or a specific lap); data from 1996 onwards. | **season**, **round**, lap?, limit?, offset? |
| `f1_get_pit_stops` | Get pit stop data for a race (all stops or a specific stop); data from 2012 onwards. | **season**, **round**, stop?, limit?, offset? |
| `f1_get_seasons` | List all F1 seasons from 1950 to present with Wikipedia links. | limit?, offset? |
| `f1_get_driver_results` | Get all race results for a specific driver in a season (by driver ID). | **driver_id**, season?, limit?, offset? |

season: season year like "2024", or "current" (default when omitted)
round: round number within the season
driver_id: Ergast driver IDs like "hamilton", "max_verstappen", "leclerc"
limit/offset: shared pagination (limit default 30, max 1000)

---

## OpenF1 (`openf1_`) — 12 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `openf1_get_sessions` | List F1 sessions (practice, qualifying, sprint, race), filterable by year/country/circuit/name/type. | session_key?, session_name?, session_type?, country_name?, year?, circuit_short_name? |
| `openf1_get_drivers` | Get driver info (names, numbers, teams) for a session or across sessions. | session_key?, driver_number?, name_acronym? |
| `openf1_get_laps` | Get lap timing data including sector times and lap duration for a session. | **session_key**, driver_number?, lap_number? |
| `openf1_get_positions` | Get position/ranking changes over time during a session. | **session_key**, driver_number?, position? |
| `openf1_get_car_data` | Get car telemetry (speed, RPM, gear, throttle, brake, DRS); use date filters to limit huge volume. | **session_key**, driver_number?, speed_gte?, speed_lte?, date_gte?, date_lte? |
| `openf1_get_intervals` | Get gap-to-leader interval data between drivers during a session. | **session_key**, driver_number? |
| `openf1_get_stints` | Get stint data: tire compound, stint number, lap counts, and tire age per driver. | **session_key**, driver_number?, compound? |
| `openf1_get_pit` | Get pit stop data including pit lane time and stop duration. | **session_key**, driver_number?, pit_duration_lte? |
| `openf1_get_race_control` | Get race control messages: flags, safety cars, penalties, track status changes. | **session_key**, flag?, category? |
| `openf1_get_weather` | Get session weather: air/track temp, humidity, pressure, wind, rainfall. | **session_key**, date_gte?, date_lte? |
| `openf1_get_team_radio` | Get team radio message metadata with URLs to driver-engineer audio recordings. | **session_key**, driver_number? |
| `openf1_get_meetings` | Get meeting (race weekend/event) info grouping sessions at a circuit. | meeting_key?, year?, country_name? |

session_key: unique session identifier; required for laps, positions, car_data, intervals, stints, pit, race_control, weather, team_radio
compound (stints): tire compound e.g. 'SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET'
flag (race_control): e.g. 'YELLOW', 'RED', 'GREEN', 'CHEQUERED'
date_gte/date_lte: ISO 8601 datetime, e.g. '2024-03-02T14:00:00'

---

## OpenLigaDB (`openliga_`) — 10 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `openliga_get_matches_by_league_season` | Get all matches for a league and season. | **league_shortcut**, **season** |
| `openliga_get_matches_by_matchday` | Get matches for a specific matchday in a league and season. | **league_shortcut**, **season**, **matchday** |
| `openliga_get_current_matchday` | Get the matches for the current matchday of a league. | **league_shortcut** |
| `openliga_get_match_data` | Get detailed data for a specific match by ID, including goals, results, and location. | **match_id** |
| `openliga_get_table` | Get the league table / standings for a league and season. | **league_shortcut**, **season** |
| `openliga_get_top_scorers` | Get the top goal scorers for a league and season. | **league_shortcut**, **season** |
| `openliga_get_teams` | Get the list of teams participating in a league for a given season. | **league_shortcut**, **season** |
| `openliga_get_available_leagues` | List all available leagues and seasons in OpenLigaDB. | _(none)_ |
| `openliga_get_next_match_by_team` | Get the next upcoming match for a team (by team ID). | **team_id** |
| `openliga_get_last_match_by_team` | Get the last completed match for a team (by team ID). | **team_id** |

league_shortcut: known shortcuts include bl1 (1. Bundesliga), bl2 (2. Bundesliga), bl3 (3. Liga), dfb (DFB-Pokal), ucl (Champions League)
season: year string, e.g. '2023' for the 2023/24 season

---

## TheSportsDB (`sportsdb_`) — 13 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `sportsdb_search_teams` | Search teams by name; returns matching teams with badges and stadium details. | **team_name** |
| `sportsdb_search_players` | Search players by name, or list all players on a team (provide player_name and/or team_name). | player_name?, team_name? |
| `sportsdb_get_team_details` | Get full details for a team by its TheSportsDB ID (description, stadium, badges, social links). | **team_id** |
| `sportsdb_get_player_details` | Get full details for a player by their TheSportsDB ID (bio, position, stats, images). | **player_id** |
| `sportsdb_get_league_list` | List all leagues, optionally filtered by country and/or sport. | country?, sport? |
| `sportsdb_get_events_by_date` | Get sporting events on a specific date, optionally filtered by sport or league name. | **date**, sport?, league? |
| `sportsdb_get_event_details` | Get full details for an event by its TheSportsDB ID (scores, venue, thumbnails, video highlights). | **event_id** |
| `sportsdb_get_last_events` | Get the last 15 completed events for a team, with scores and results. | **team_id** |
| `sportsdb_get_next_events` | Get the next 15 upcoming events for a team. | **team_id** |
| `sportsdb_get_standings` | Get league table / standings for a given league and season. | **league_id**, **season** |
| `sportsdb_get_event_results` | Get past event results for a specific round of a league season. | **league_id**, **round**, **season** |
| `sportsdb_get_seasons` | List all available seasons for a league. | **league_id** |
| `sportsdb_get_sports_list` | List all available sports on TheSportsDB. | _(none)_ |

`season`: season string, e.g. "2023-2024" or "2024"
`date`: YYYY-MM-DD format
`sport`: TheSportsDB sport name, e.g. "Soccer"
`round`: round number as string, e.g. "1", "38"
IDs (team_id, player_id, event_id, league_id) are TheSportsDB internal IDs passed as strings

---

## NCAA API (`ncaa_`) — 8 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `ncaa_get_scoreboard` | Get the NCAA scoreboard for a sport and division (games with scores, status, basic info). | **sport**, **division**, date? |
| `ncaa_get_game` | Get detailed info about a specific NCAA game (play-by-play, box score, stats). | **sport**, **game_id** |
| `ncaa_get_rankings` | Get NCAA rankings/polls (AP, Coaches, CFP, etc.) for a sport. | **sport**, division?, poll?, year?, week? |
| `ncaa_get_standings` | Get NCAA standings for a sport and division, optionally by year. | **sport**, division?, year? |
| `ncaa_get_teams` | Get NCAA teams in a division, optionally filtered by conference. | **sport**, **division**, conference_id? |
| `ncaa_get_schedule` | Get a team's NCAA schedule for a season. | **sport**, **team_id**, year? |
| `ncaa_get_stats` | Get player or team statistics for an NCAA sport/division. | **sport**, **division**, stat_type?, year? |
| `ncaa_get_news` | Get the latest NCAA news, optionally filtered by sport. | sport? |

sport: e.g. "football", "basketball", "baseball", "soccer", "hockey", "lacrosse"
division: e.g. "fbs", "fcs", "d1", "d2", "d3"
poll: e.g. "ap", "coaches", "cfp"
stat_type: "individual" or "team"
date: YYYY/MM/DD format

---

## SportSRC (`sportsrc_`) — 7 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `sportsrc_get_sports` | List sport categories supported by SportSRC; returns ids usable by other tools. | _(none)_ |
| `sportsrc_get_matches` | List live, upcoming, and recently finished matches for a sport with team info. | **category** |
| `sportsrc_get_match` | Get detailed match info including streams, venue, and lineups. | **match_id**, **category** |
| `sportsrc_get_leagues` | List football leagues/competitions; returns league ids for scores and tables tools. | _(none)_ |
| `sportsrc_get_league_scores` | Get scores / recent results for a specific football league. | **league** |
| `sportsrc_get_table` | Get the standings table for a specific football league. | **league** |
| `sportsrc_get_live` | Get the matches feed for a sport; filter returned data by status for live games. | **category** |

`category` (sport id): e.g. "football", "basketball", "mma" — list via sportsrc_get_sports
`league` (league id): e.g. "PL", "CL", "BL1" — list via sportsrc_get_leagues (football only)

---

## Lichess (`lichess_`) — 7 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `lichess_get_user` | Get a Lichess user's public profile, including per-variant ratings, played games, and account flags. | **username** |
| `lichess_get_users_status` | Get realtime online and streaming status for up to 100 Lichess users in one call. | **ids** |
| `lichess_get_top_players` | Get the top N players for a Lichess performance variant (bullet, blitz, rapid, classical, etc.). | **perf**, n? |
| `lichess_get_team` | Get info about a Lichess team: description, member count, leader, open/closed status. | **team_id** |
| `lichess_get_tournaments` | Get current Lichess Arena tournaments (created, started, and recently finished). | _(none)_ |
| `lichess_get_broadcasts` | List official Lichess broadcast tournaments (live OTB coverage); returns up to ~20 most recent. | max? |
| `lichess_get_daily_puzzle` | Get the Lichess puzzle of the day, including the source game and solution moves. | _(none)_ |

`perf`: one of ultraBullet, bullet, blitz, rapid, classical, chess960, crazyhouse, antichess, atomic, horde, kingOfTheHill, racingKings, threeCheck

---

## Chess.com (`chesscom_`) — 7 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `chesscom_get_player` | Get a Chess.com player's public profile (name, country, joined, last online, title, etc.). | **username** |
| `chesscom_get_player_stats` | Get a player's stats by time control (daily, rapid, blitz, bullet, chess960) with ratings, best, and W/L/D records. | **username** |
| `chesscom_get_player_clubs` | Get the list of Chess.com clubs a player belongs to with last-activity timestamps. | **username** |
| `chesscom_get_player_archives` | List the YYYY/MM archive URLs containing a player's monthly game history. | **username** |
| `chesscom_get_club` | Get Chess.com club details by URL id (the slug after /club/). | **club_id** |
| `chesscom_get_country_players` | Get the list of titled Chess.com players from a country (usernames and titles). | **country** |
| `chesscom_get_leaderboards` | Get Chess.com global leaderboards across all categories (daily, daily960, live_rapid, live_blitz, live_bullet, tactics, rush, battle). | _(none)_ |

club_id: club URL slug, e.g. "chess-com-developer-community"
country: ISO 3166 alpha-2 code, e.g. "US", "FR", "IN"

---

## Squiggle (AFL) (`squiggle_`) — 6 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `squiggle_get_teams` | List all AFL teams (current and historic) with id, abbreviation, debut/retirement years, and logo path. | _(none)_ |
| `squiggle_get_games` | Get AFL games (home/away teams, scores, completion status, venue, time) with optional filters. | year?, round?, team?, complete? |
| `squiggle_get_ladder` | Get the projected AFL ladder for a year and round by prediction model (projected wins / mean rank). | **year**, **round**, source? |
| `squiggle_get_standings` | Get the actual AFL ladder/standings (wins, losses, draws, points, percentage) for a year and round. | **year**, round? |
| `squiggle_get_tips` | Get game-level tips/predictions from one or all Squiggle models (margin, confidence, post-hoc correctness). | year?, round?, source?, game? |
| `squiggle_get_sources` | List the prediction model sources contributing to Squiggle (Squiggle, MoS, FiveThirtyEight, etc.). | _(none)_ |

`source`: prediction model source id (use squiggle_get_sources to list)
`team`/`game`: AFL team id / game id integers
`complete`: completion % filter, 100 = finished games only

---

## MotoGP (`motogp_`) — 7 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `motogp_get_seasons` | List MotoGP seasons with their UUIDs and year. The `id` (seasonUuid) feeds the categories/events/standings tools. `current:true` marks the live season. | _(none)_ |
| `motogp_get_categories` | List the racing categories (MotoGP, Moto2, Moto3, MotoE) for a season, with their UUIDs. Use a seasonUuid from motogp_get_seasons; the returned categoryUuid feeds sessions and standings. | **season_uuid** |
| `motogp_get_events` | List the events (Grands Prix) in a season with circuit, country and dates. Each event's UUID feeds motogp_get_sessions. | **season_uuid**, is_finished? |
| `motogp_get_sessions` | List the sessions (practice, qualifying, race, etc.) for an event and category. Pass eventUuid from motogp_get_events and categoryUuid from motogp_get_categories. Each session id feeds motogp_get_session_classification. | **event_uuid**, **category_uuid** |
| `motogp_get_session_classification` | Get the full classification (results) of a session: rider, team, constructor, time/gap and points. Use a session id from motogp_get_sessions. | **session_id**, test? |
| `motogp_get_standings` | Get the championship standings for a season and category (riders' or constructors' points table). Pass seasonUuid and categoryUuid. | **season_uuid**, **category_uuid** |
| `motogp_get_riders` | List MotoGP riders with their profile data (name, number, country, team). Optionally filter by category UUID. | category_uuid? |

---

## Formula E (`formulae_`) — 7 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `formulae_get_championships` | List Formula E championships (one per season, from 2014-15 to the current season) with their ids and status. The `id` (championshipId) feeds the standings tools. | _(none)_ |
| `formulae_get_races` | List Formula E races / E-Prix with id, name, country, city, date and result-availability flags. Paginated — use `page` to advance. Each race id feeds formulae_get_race / formulae_get_race_results. | page? |
| `formulae_get_race` | Get details for a single Formula E race (sessions, circuit, schedule). Use a race id from formulae_get_races. | **race_id** |
| `formulae_get_race_results` | Get the race results / classification for a Formula E race (driver, team, position, points). Use a race id from formulae_get_races. | **race_id** |
| `formulae_get_teams` | List Formula E teams with wins, podiums and race starts. | _(none)_ |
| `formulae_get_driver_standings` | Get the Formula E drivers' championship standings for a championship (season). Pass a championshipId from formulae_get_championships. | **championship_id** |
| `formulae_get_team_standings` | Get the Formula E teams' championship standings for a championship (season). Pass a championshipId from formulae_get_championships. | **championship_id** |

---

## NASCAR (`nascar_`) — 3 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `nascar_get_schedule` | Get the NASCAR race schedule for a season and series, including track, dates, winners and stage info for completed races. | **year**, **series_id** |
| `nascar_get_live` | Get the live race feed: current lap, flag state, laps to go, leader and per-vehicle running order. When no race is live, fields are in an idle state (flag_state 9, race_id -1). | _(none)_ |
| `nascar_get_lap_times` | Get per-driver lap times and speeds for a specific race. Use the race_id from nascar_get_schedule. | **year**, **series_id**, **race_id** |

---

## OpenDota (`opendota_`) — 11 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `opendota_get_pro_matches` | Get recent professional Dota 2 matches (teams, league, duration, winner). Use a match_id with opendota_get_match for full detail. | _(none)_ |
| `opendota_get_match` | Get full detail for a Dota 2 match: players, heroes, K/D/A, items, gold/xp, objectives. | **match_id** |
| `opendota_get_player` | Get a player's profile and aggregate stats by Steam32 account id (rank, MMR estimate, profile). | **account_id** |
| `opendota_get_player_matches` | Get a player's recent matches (hero, result, K/D/A, duration). Use `limit` to cap the list. | **account_id**, limit? |
| `opendota_get_player_win_loss` | Get a player's overall win/loss record. | **account_id** |
| `opendota_get_player_heroes` | Get a player's per-hero stats (games, win rate, last played). | **account_id** |
| `opendota_get_hero_stats` | Get hero stats / current meta: per-bracket pick and win counts for every hero. | _(none)_ |
| `opendota_get_heroes` | List all Dota 2 heroes with id, name, primary attribute and roles. | _(none)_ |
| `opendota_get_pro_teams` | List professional Dota 2 teams with rating, wins/losses and last match time. | _(none)_ |
| `opendota_get_pro_leagues` | List Dota 2 leagues / tournaments with id, name and tier. | _(none)_ |
| `opendota_search_players` | Search for Dota 2 players by persona name. Returns account_id values for use with the player tools. | **query** |

---

## Sleeper (`sleeper_`) — 10 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `sleeper_get_nfl_state` | Get the current NFL season, week, and season type (pre/regular/post/off) as tracked by Sleeper. | _(none)_ |
| `sleeper_search_players` | Search the Sleeper NFL player database by name (and optionally team/position). Returns slim records with injury status, depth-chart order, team and position. The full player set is cached for 24h. | **query**, team?, position?, limit? |
| `sleeper_get_trending_players` | Get the most-added or most-dropped NFL players over a lookback window, enriched with names/teams/positions. Doubles as a crude buzz signal. | **type**, lookback_hours?, limit? |
| `sleeper_get_user` | Get a Sleeper user (profile, user_id, display name) by username or numeric user id. | **username_or_id** |
| `sleeper_get_user_leagues` | List the NFL leagues a user belongs to for a given season. Use the user_id from sleeper_get_user. | **user_id**, **season** |
| `sleeper_get_league` | Get details for a Sleeper league (settings, scoring, roster positions, status). | **league_id** |
| `sleeper_get_league_rosters` | Get all rosters in a league (owners, player_ids, wins/losses, points). | **league_id** |
| `sleeper_get_league_users` | Get all users (managers) in a league with display names and team names. | **league_id** |
| `sleeper_get_league_matchups` | Get the matchups for a league in a given week (roster_id, points, starters). | **league_id**, **week** |
| `sleeper_get_draft_picks` | Get all picks for a draft (round, pick number, roster, player_id, metadata). Get a draft_id from sleeper_get_league (draft_id) or the league's drafts. | **draft_id** |

---

## EuroLeague Basketball (`euroleague_`) — 6 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `euroleague_get_games` | Get all EuroLeague/EuroCup games for a season (teams, scores, dates, round, status). | competition?, **season_year** |
| `euroleague_get_clubs` | List the clubs participating in a EuroLeague/EuroCup season (names, codes, venues, country). | competition?, **season_year** |
| `euroleague_get_rounds` | List the rounds (game days) of a EuroLeague/EuroCup season. | competition?, **season_year** |
| `euroleague_get_game_header` | Get a game's header/summary: final and per-quarter scores, teams, coaches. Use a game code from euroleague_get_games. | **game_code**, competition?, **season_year** |
| `euroleague_get_game_boxscore` | Get a game's full box score (per-player and team stats for both teams). Use a game code from euroleague_get_games. | **game_code**, competition?, **season_year** |
| `euroleague_get_game_playbyplay` | Get a game's full play-by-play feed (every event by quarter). Use a game code from euroleague_get_games. | **game_code**, competition?, **season_year** |

---

## Football-Data.co.uk (`footballdata_uk_`) — 2 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `footballdata_uk_list_leagues` | List the football-data.co.uk league codes usable with footballdata_uk_get_matches, and how to form the season code. | _(none)_ |
| `footballdata_uk_get_matches` | Get historical matches (results + bookmaker odds) for a league and season from football-data.co.uk. Returns the most recent matches first; filter by team and cap with limit. | **league**, **season**, team?, limit? |

---

## API-Sports (`apisports_`) — 10 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `apisports_get_fixtures` | Get fixtures/matches for a sport, filtered by league, season, date range, team, or live status. | **sport**, league?, season?, date?, from?, to?, team?, live? |
| `apisports_get_standings` | Get league standings/rankings for a sport, league, and season. | **sport**, **league**, **season** |
| `apisports_get_teams` | Search for teams by name, country, league, or ID. | **sport**, id?, name?, league?, country?, season? |
| `apisports_get_players` | Get player information and statistics. | **sport**, league?, season?, team?, player_id?, page? |
| `apisports_get_odds` | Get betting odds for fixtures (not available for all sports). | **sport**, fixture_id?, league?, season?, bookmaker? |
| `apisports_get_leagues` | List available leagues/competitions for a sport. | **sport**, country?, season?, id? |
| `apisports_get_live_scores` | Get live scores for currently active matches (updated every 15 seconds). | **sport**, league? |
| `apisports_get_team_statistics` | Get detailed statistics for a team in a given league and season. | **sport**, **league**, **season**, **team** |
| `apisports_get_head2head` | Get head-to-head results between two teams. | **sport**, **h2h** |
| `apisports_get_status` | Get API account status: subscription, requests used/remaining, rate limits. | **sport** |

`sport`: enum — "football", "basketball", "baseball", "hockey", "rugby", "handball", "volleyball", "american-football", "formula-1"
For sport="formula-1" endpoints are remapped (fixtures→races, standings→rankings/races, players→drivers, leagues→competitions)
`h2h`: format 'teamId1-teamId2'

---

## API-Football (`apifootball_`) — 15 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `apifootball_get_fixtures` | Get football fixtures/matches filtered by league, team, date range, live status, round, or status. | id?, league?, season?, team?, date?, from?, to?, live?, round?, status? |
| `apifootball_get_fixture_events` | Get events (goals, cards, substitutions, VAR) for a specific fixture. | **fixture_id** |
| `apifootball_get_fixture_lineups` | Get starting lineups and substitutes for a specific fixture. | **fixture_id** |
| `apifootball_get_fixture_statistics` | Get match statistics (shots, possession, corners, fouls, etc.) for a specific fixture. | **fixture_id** |
| `apifootball_get_standings` | Get league standings/table for a specific league and season. | **league**, **season** |
| `apifootball_get_teams` | Search for teams by name, country, league, or ID. | id?, name?, league?, season?, country? |
| `apifootball_get_players` | Get player statistics by name or filtered by team/league/season (paginated 25 per page). | id?, team?, league?, season?, search?, page? |
| `apifootball_get_top_scorers` | Get the top scorers for a specific league and season. | **league**, **season** |
| `apifootball_get_transfers` | Get transfer history for a player or team. | player?, team? |
| `apifootball_get_injuries` | Get injury and suspension reports filtered by league, team, fixture, player, or date. | league?, season?, fixture?, team?, player?, date? |
| `apifootball_get_predictions` | Get AI-generated predictions (win probabilities, advice, comparison stats) for a fixture. | **fixture_id** |
| `apifootball_get_odds` | Get pre-match betting odds filtered by fixture, league, season, bookmaker, or bet type. | fixture?, league?, season?, bookmaker?, bet? |
| `apifootball_get_leagues` | List available leagues/cups filtered by name, country, season, or current status (960+ competitions). | id?, name?, country?, season?, current? |
| `apifootball_get_countries` | List all available countries with their codes and flags. | _(none)_ |
| `apifootball_get_status` | Get API-Football account status: subscription plan, request usage, and limits. | _(none)_ |

`date`/`from`/`to`: YYYY-MM-DD format
`live`: 'all' or league IDs separated by dashes (e.g. '39-61')
`status`: short code (e.g. NS, 1H, HT, 2H, FT)
`search` (players): minimum 3 characters

---

## API-Tennis (`apitennis_`) — 12 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `apitennis_get_rankings` | Get tennis player rankings (ATP, WTA), optionally search by player name. | search? |
| `apitennis_get_seasons` | Get all available tennis seasons. | _(none)_ |
| `apitennis_get_categories` | Get tournament categories (ATP, WTA, ITF), optionally filter by category ID. | id? |
| `apitennis_get_countries` | List all available countries for tennis data. | _(none)_ |
| `apitennis_get_leagues` | Get tennis tournaments/leagues, filter by ID, country, or season. | id?, country_id?, season? |
| `apitennis_get_fixtures` | Get tennis matches/fixtures, filter by ID, date, league, season, or head-to-head. | id?, date?, league?, season?, h2h? |
| `apitennis_get_live` | Get all currently live tennis matches. | _(none)_ |
| `apitennis_get_standings` | Get tournament standings for a specific league and season. | **league**, **season** |
| `apitennis_get_players` | Search for tennis players by name, ID, or country. | search?, id?, country_id? |
| `apitennis_get_head2head` | Get head-to-head record between two tennis players including all past matches. | **h2h** |
| `apitennis_get_statistics` | Get detailed match statistics for a specific fixture (aces, double faults, break points). | **fixture_id** |
| `apitennis_get_status` | Check API-Tennis account status: subscription plan, request usage, and daily limits. | _(none)_ |

`date`: YYYY-MM-DD format
`h2h`: two player IDs separated by a dash (e.g. '52-54')
`season`: year integer (e.g. 2024)

---

## BallDontLie (`bdl_`) — 10 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `bdl_get_players` | Search or list players for a sport, with name search and pagination. | **sport**, search?, cursor?, per_page? |
| `bdl_get_player_by_id` | Get detailed info about a specific player by ID. | **sport**, **player_id** |
| `bdl_get_teams` | List teams for a sport, optionally filtered by conference or division. | **sport**, conference?, division? |
| `bdl_get_games` | Get games filtered by dates, seasons, or team IDs, with pagination. | **sport**, dates?, seasons?, team_ids?, cursor?, per_page? |
| `bdl_get_game_by_id` | Get detailed info about a specific game by ID. | **sport**, **game_id** |
| `bdl_get_stats` | Get player game stats filtered by player IDs, game IDs, or seasons, with pagination. | **sport**, player_ids?, game_ids?, seasons?, cursor?, per_page? |
| `bdl_get_season_averages` | Get season averages for one or more players in a given season. | **sport**, **season**, **player_ids** |
| `bdl_get_box_scores` | Get box scores for all games on a specific date. | **sport**, **date** |
| `bdl_get_standings` | Get current or historical standings for a sport and season. | **sport**, **season** |
| `bdl_get_leaders` | Get statistical leaders for a sport, season, and stat category. | **sport**, **season**, **stat_type** |

`sport`: enum nba, nfl, mlb, or nhl (required on every tool)
`per_page`: 1-100; `cursor`: pagination cursor from a prior response
`stat_type` examples: pts, reb, ast (NBA); passing_yards, rushing_yards (NFL)

---

## CricketData (`cricket_`) — 10 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `cricket_get_current_matches` | Get live and current cricket matches across all formats (Test, ODI, T20, IPL, BBL, etc.) | offset? |
| `cricket_get_match_info` | Get detailed information about a specific cricket match | **match_id** |
| `cricket_get_match_scorecard` | Get the full scorecard for a cricket match including batting and bowling details | **match_id** |
| `cricket_get_match_bbb` | Get ball-by-ball commentary and data for a cricket match | **match_id** |
| `cricket_get_series` | List available cricket series and tournaments | offset? |
| `cricket_get_series_info` | Get detailed information about a specific cricket series or tournament | **series_id** |
| `cricket_get_players` | Search for cricket players by name | search?, offset? |
| `cricket_get_player_info` | Get detailed profile and statistics for a specific cricket player | **player_id** |
| `cricket_get_countries` | List all cricket-playing countries recognized by CricketData | _(none)_ |
| `cricket_get_match_list` | Get a list of upcoming and recent cricket matches | offset? |

---

## Entity Sport (`entitycricket_`) — 12 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `entitycricket_get_matches` | List cricket matches with optional status, date, and pagination filters. | status?, date?, paged?, per_page? |
| `entitycricket_get_match` | Get detailed information about a specific cricket match. | **match_id** |
| `entitycricket_get_match_scorecard` | Get the full scorecard for a cricket match. | **match_id** |
| `entitycricket_get_match_commentary` | Get ball-by-ball commentary for a specific inning of a match. | **match_id**, **inning** |
| `entitycricket_get_competitions` | List cricket competitions/tournaments with optional status filter. | status?, paged? |
| `entitycricket_get_competition` | Get details for a specific cricket competition. | **competition_id** |
| `entitycricket_get_competition_standings` | Get standings/points table for a cricket competition. | **competition_id** |
| `entitycricket_get_teams` | List cricket teams with optional pagination. | paged? |
| `entitycricket_get_team` | Get details for a specific cricket team. | **team_id** |
| `entitycricket_get_players` | List cricket players with optional pagination. | paged? |
| `entitycricket_get_player` | Get detailed info for a specific cricket player. | **player_id** |
| `entitycricket_get_venues` | List cricket venues/grounds with optional pagination. | paged? |

`inning`: inning number (1, 2, 3, or 4)
`status`: e.g. live, completed, upcoming
`date`: YYYY-MM-DD

---

## football-data.org (`footballdata_`) — 11 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `footballdata_get_competitions` | List available football competitions, optionally filtered by area IDs. | areas? |
| `footballdata_get_competition` | Get details for a specific competition by code. | **competition_code** |
| `footballdata_get_standings` | Get a competition's standings/league table, optionally at a given season or matchday. | **competition_code**, season?, matchday? |
| `footballdata_get_matches` | Get matches filtered by competition, team, date range, status, or matchday. | competition_code?, team_id?, dateFrom?, dateTo?, status?, matchday? |
| `footballdata_get_match` | Get detailed info for a specific match (lineups, goals, substitutions). | **match_id** |
| `footballdata_get_teams` | List teams in a competition, optionally for a given season. | **competition_code**, season? |
| `footballdata_get_team` | Get team details including squad roster. | **team_id** |
| `footballdata_get_team_matches` | Get matches for a specific team, filtered by date, status, or competitions. | **team_id**, dateFrom?, dateTo?, status?, competitions? |
| `footballdata_get_scorers` | Get top scorers for a competition, optionally by season with a result limit. | **competition_code**, season?, limit? |
| `footballdata_get_person` | Get details for a player or coach by ID. | **person_id** |
| `footballdata_get_areas` | List available football areas and countries. | _(none)_ |

competition_code: free-tier codes are PL, ELC, BL1, SA, PD, FL1, DED, PPL, CL, EC, WC, CLI
status: SCHEDULED, TIMED, IN_PLAY, PAUSED, FINISHED, POSTPONED, SUSPENDED, CANCELLED
season: year, e.g. 2024 for the 2024/25 season
dateFrom/dateTo: YYYY-MM-DD

---

## Sportmonks (`sportmonks_`) — 12 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `sportmonks_get_leagues` | List available football leagues, with optional includes and pagination. | include?, page? |
| `sportmonks_get_fixtures` | Get football fixtures filtered by league, season, date, or team. | league_id?, season_id?, date?, team_id?, include?, page? |
| `sportmonks_get_fixture_by_id` | Get detailed information about a specific fixture by its ID. | **fixture_id**, include? |
| `sportmonks_get_livescores` | Get current live scores for ongoing football matches. | include? |
| `sportmonks_get_standings` | Get league standings for a specific season. | **season_id**, include? |
| `sportmonks_get_teams` | List football teams, optionally filtered by country. | country_id?, include?, page? |
| `sportmonks_get_team_by_id` | Get detailed information about a specific team. | **team_id**, include? |
| `sportmonks_get_players` | Search football players by name or filter by country. | search?, country_id?, include?, page? |
| `sportmonks_get_player_by_id` | Get detailed information about a specific player. | **player_id**, include? |
| `sportmonks_get_topscorers` | Get top scorers for a specific season. | **season_id**, include? |
| `sportmonks_get_seasons` | List available seasons, optionally filtered by league. | league_id?, page? |
| `sportmonks_get_countries` | List all available countries. | _(none)_ |

include: comma-separated related-data embeds, e.g. 'scores,events,lineups,participants'
page: page number for pagination (positive integer)

---

## SportsDataIO (`sportsdata_`) — 12 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `sportsdata_get_games_by_date` | Get games/events scheduled for a specific date | **sport**, **date** |
| `sportsdata_get_standings` | Get standings for a sport and season | **sport**, **season** |
| `sportsdata_get_teams` | List all teams for a sport | **sport** |
| `sportsdata_get_player` | Get player information by player ID | **sport**, **player_id** |
| `sportsdata_get_player_stats_by_season` | Get player season statistics | **sport**, **season**, **player_id** |
| `sportsdata_get_injuries` | Get current injury reports for a sport | **sport** |
| `sportsdata_get_news` | Get latest news for a sport | **sport** |
| `sportsdata_get_schedules` | Get the full season schedule for a sport | **sport**, **season** |
| `sportsdata_get_scores_by_date` | Get scores for games on a specific date | **sport**, **date** |
| `sportsdata_get_odds_by_date` | Get betting odds for games on a specific date | **sport**, **date** |
| `sportsdata_get_dfs_slates` | Get DFS (Daily Fantasy Sports) slates for a specific date | **sport**, **date** |
| `sportsdata_get_active_players` | Get all active players for a sport | **sport** |

`sport`: enum of "nfl", "nba", "mlb", "nhl", "soccer", "mma", "golf", "nascar", "tennis"
`date`: YYYY-MM-DD (internally reformatted to YYYY-MMM-DD for nfl/nba/mlb/nhl)
`season`: e.g. '2024', '2024REG', '2024POST'

---

## The Odds API (`odds_`) — 9 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `odds_get_sports` | List all available sports/tournaments (70+) and their sport keys. | _(none)_ |
| `odds_get_odds` | Get pre-match and live odds for a sport from 40+ bookmakers (moneyline, spreads, totals). | **sport_key**, **regions**, markets?, oddsFormat?, bookmakers? |
| `odds_get_event_odds` | Get odds for a specific event by event ID. | **sport_key**, **event_id**, **regions**, markets?, oddsFormat? |
| `odds_get_scores` | Get live and recently completed scores for a sport. | **sport_key**, daysFrom? |
| `odds_get_events` | Get upcoming and live events for a sport, returning event IDs. | **sport_key**, dateFormat? |
| `odds_get_historical_odds` | Get historical odds for a sport at a specific point in time. | **sport_key**, **regions**, **date**, markets?, oddsFormat? |
| `odds_get_historical_events` | Get historical events for a sport available at a specific date. | **sport_key**, **date** |
| `odds_get_player_props` | Get player prop odds for a specific event (e.g. player_points, player_rebounds, player_assists). | **sport_key**, **event_id**, **regions**, **markets**, oddsFormat? |
| `odds_check_usage` | Check API usage (requests used/remaining); reads cached usage and only calls the API if none observed yet. | _(none)_ |

`sport_key`: e.g. "americanfootball_nfl", "basketball_nba", "soccer_epl"
`regions`: comma-separated: us, eu, uk, au
`markets`: comma-separated: h2h, spreads, totals (default h2h)
`oddsFormat`: "american" or "decimal" (default decimal)
`daysFrom`: integer 1-3
`date`: ISO 8601 string, e.g. "2024-01-15T12:00:00Z"

---

## Odds-API.io (`oddsio_`) — 10 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `oddsio_get_sports` | List all available sports from Odds API IO. | _(none)_ |
| `oddsio_get_leagues` | List leagues for a given sport. | **sport_id** |
| `oddsio_get_events` | Get events, optionally filtered by sport, league, or date. | sport_id?, league_id?, date? |
| `oddsio_get_event` | Get details for a specific event by ID. | **event_id** |
| `oddsio_get_odds` | Get odds for a specific event, optionally filtered by market. | **event_id**, market? |
| `oddsio_get_prematch_odds` | Get pre-match odds, optionally filtered by sport, league, or bookmaker. | sport_id?, league_id?, bookmaker? |
| `oddsio_get_live_odds` | Get live in-play odds, optionally filtered by sport. | sport_id? |
| `oddsio_get_value_bets` | Find value bets where bookmaker odds exceed estimated probability. | sport_id? |
| `oddsio_get_arbitrage` | Find arbitrage opportunities across bookmakers. | sport_id? |
| `oddsio_get_bookmakers` | List all available bookmakers. | _(none)_ |

`date`: YYYY-MM-DD format
`sport_id`/`league_id`: identifiers from oddsio_get_sports / oddsio_get_leagues

---

## Sports Game Odds (`sgo_`) — 10 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `sgo_get_leagues` | List all available leagues from Sports Game Odds. | _(none)_ |
| `sgo_get_events` | Get events with optional league, date, and status filters. | league?, date?, status? |
| `sgo_get_event` | Get details for a specific event by ID. | **event_id** |
| `sgo_get_odds` | Get odds for an event, optionally filtered by market type or bookmaker. | **event_id**, market_type?, bookmaker? |
| `sgo_get_player_props` | Get player prop odds for a specific event. | **event_id** |
| `sgo_get_scores` | Get scores with optional league and date filters. | league?, date? |
| `sgo_get_bookmakers` | List all available bookmakers. | _(none)_ |
| `sgo_get_markets` | List available betting markets, optionally filtered by league. | league? |
| `sgo_get_teams` | List teams, optionally filtered by league. | league? |
| `sgo_get_standings` | Get league standings, optionally filtered by league and season. | league?, season? |

`date`: format YYYY-MM-DD
`event_id`: event identifier, URL-encoded into the path
`league`: league identifier string

---

## Fighting Tomatoes (`mma_`) — 8 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `mma_search_fighters` | Search MMA fighters by name, returning matching fighters with basic info. | **name** |
| `mma_get_fighter` | Get detailed info about a specific MMA fighter (record, stats, bio). | **fighter_id** |
| `mma_get_fighter_fights` | Get the complete fight history for a specific MMA fighter. | **fighter_id** |
| `mma_get_events` | List MMA events, optionally filtered by organization and date, with pagination. | organization?, date?, page? |
| `mma_get_event` | Get detailed info about a specific MMA event including its fight card. | **event_id** |
| `mma_get_fight` | Get detailed info about a specific MMA fight (result, method, round, time). | **fight_id** |
| `mma_get_organizations` | List all MMA organizations in the database (UFC, Bellator, ONE, PFL, etc.). | _(none)_ |
| `mma_get_upcoming_events` | Get upcoming MMA events, optionally filtered by organization. | organization? |

`organization`: e.g. UFC, Bellator, ONE, PFL
`date`: YYYY-MM-DD format
`page`: positive integer, defaults to 1 server-side

---

## Live Golf API (`livegolf_`) — 8 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `livegolf_get_tournaments` | List golf tournaments, optionally filtered by tour or season. | tour?, season? |
| `livegolf_get_tournament` | Get details for a specific golf tournament. | **tournament_id** |
| `livegolf_get_leaderboard` | Get the live or final leaderboard for a tournament. | **tournament_id** |
| `livegolf_get_players` | Search or list golf players. | search?, tour? |
| `livegolf_get_player` | Get detailed info for a specific golf player. | **player_id** |
| `livegolf_get_player_stats` | Get statistics for a specific golf player, optionally for a given season. | **player_id**, season? |
| `livegolf_get_rankings` | Get golf world rankings, optionally filtered by tour with pagination. | tour?, page? |
| `livegolf_get_schedule` | Get the tournament schedule for a tour and/or season. | tour?, season? |

tour: tour filter string, e.g. "pga", "european"
season: season year filter string
tournament_id / player_id: provider identifiers

---

## iSportsAPI (`isports_`) — 10 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `isports_get_football_matches` | Get football (soccer) matches with optional date, league, and status filters. | date?, league_id?, status? |
| `isports_get_football_match` | Get details for a specific football match. | **match_id** |
| `isports_get_football_leagues` | List all available football leagues. | _(none)_ |
| `isports_get_football_standings` | Get standings for a football league, optionally for a specific season. | **league_id**, season? |
| `isports_get_football_teams` | List football teams, optionally filtered by league. | league_id? |
| `isports_get_basketball_matches` | Get basketball matches with optional date, league, and status filters. | date?, league_id?, status? |
| `isports_get_basketball_match` | Get details for a specific basketball match. | **match_id** |
| `isports_get_basketball_leagues` | List all available basketball leagues. | _(none)_ |
| `isports_get_basketball_standings` | Get standings for a basketball league, optionally for a specific season. | **league_id**, season? |
| `isports_get_basketball_teams` | List basketball teams, optionally filtered by league. | league_id? |

status: free-form match status filter (e.g. live/finished)
date: YYYY-MM-DD format

---

## SportDevs (`sportdevs_`) — 12 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `sportdevs_get_matches` | Get matches filtered by date, league, team, or live status | **sport**, date?, league_id?, team_id?, live? |
| `sportdevs_get_match_details` | Get full details for a specific match | **sport**, **match_id** |
| `sportdevs_get_match_lineups` | Get lineups for a specific match | **sport**, **match_id** |
| `sportdevs_get_match_statistics` | Get statistics for a specific match | **sport**, **match_id** |
| `sportdevs_get_standings` | Get league standings, optionally filtered by season | **sport**, **league_id**, season_id? |
| `sportdevs_get_teams` | List teams, optionally filtered by league or country | **sport**, league_id?, country? |
| `sportdevs_get_team` | Get detailed information for a specific team | **sport**, **team_id** |
| `sportdevs_get_players` | List players, optionally filtered by team | **sport**, team_id? |
| `sportdevs_get_player` | Get detailed information for a specific player | **sport**, **player_id** |
| `sportdevs_get_leagues` | List available leagues, optionally filtered by country | **sport**, country? |
| `sportdevs_get_livescores` | Get all currently live scores for a sport | **sport** |
| `sportdevs_get_odds` | Get betting odds for a specific match | **sport**, **match_id** |

`sport`: "rugby", "volleyball", "handball"

---

## MySportsFeeds (`msf_`) — 12 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `msf_get_games` | Get games for a sport and season, optionally filtered by date. | **sport**, **season**, date? |
| `msf_get_game_boxscore` | Get box score for a specific game. | **sport**, **season**, **game_id** |
| `msf_get_game_playbyplay` | Get play-by-play data for a specific game. | **sport**, **season**, **game_id** |
| `msf_get_standings` | Get standings for a sport and season. | **sport**, **season** |
| `msf_get_player_stats` | Get player stats totals for a sport and season, optionally filtered by player. | **sport**, **season**, player? |
| `msf_get_roster` | Get the roster for a specific team. | **sport**, **season**, **team** |
| `msf_get_injuries` | Get current injury reports for a sport and season. | **sport**, **season** |
| `msf_get_daily_dfs` | Get daily fantasy sports (DFS) data for a specific date. | **sport**, **season**, **date** |
| `msf_get_odds_gamelines` | Get betting odds and game lines for a sport and season, optionally by date. | **sport**, **season**, date? |
| `msf_get_lineups` | Get expected or confirmed daily lineups, optionally filtered by date. | **sport**, **season**, date? |
| `msf_get_schedule` | Get the full season schedule (games) for a sport. | **sport**, **season** |
| `msf_get_players` | List or search players for a sport and season. | **sport**, **season**, search? |

sport: sport slug, e.g. nfl, nba, mlb, nhl
season: season slug, e.g. 2024-regular, 2024-playoff
date: formatted YYYYMMDD

---

## PandaScore (`pandascore_`) — 14 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `pandascore_get_matches` | List esports matches, filterable by status (upcoming/running/past) and videogame across 13 titles. | filter_type?, videogame?, page?, per_page?, sort? |
| `pandascore_get_match` | Get detailed info about a specific match (teams, scores, games, streams, results). | **match_id** |
| `pandascore_get_tournaments` | List esports tournaments with names, dates, prize pools, and teams; filter by videogame. | videogame?, page?, per_page?, sort? |
| `pandascore_get_tournament` | Get detailed info about a specific tournament (brackets, matches, teams, prize pool). | **tournament_id** |
| `pandascore_get_leagues` | List esports leagues (LEC, LCS, ESL Pro League, etc.); filter by videogame. | videogame?, page?, per_page?, sort? |
| `pandascore_get_league` | Get detailed info about a specific league (series, image URLs). | **league_id** |
| `pandascore_get_series` | List esports series (seasonal groupings within a league); filter by videogame. | videogame?, page?, per_page?, sort? |
| `pandascore_get_teams` | List esports teams; filter by videogame and search by name. | videogame?, search?, page?, per_page? |
| `pandascore_get_team` | Get detailed info about a specific team (roster, recent results, current players). | **team_id** |
| `pandascore_get_players` | List esports players; filter by videogame and search by name. | videogame?, search?, page?, per_page? |
| `pandascore_get_player` | Get detailed info about a specific player (team, role, stats, image). | **player_id** |
| `pandascore_get_videogames` | List all videogame titles available on PandaScore. | _(none)_ |
| `pandascore_get_lives` | Get all currently live esports matches across all titles with real-time scores and stream links. | _(none)_ |
| `pandascore_get_incidents` | Get recent changes/incidents (new matches, score/roster updates) since a timestamp; filter by videogame. | videogame?, page?, per_page?, since? |

`videogame`: lol, cs-2, dota-2, valorant, ow, codmw, r6siege, rl, ea-sports-fc, king-of-glory, pubg, starcraft-2, free-fire
`filter_type` (get_matches): upcoming, running, past
`per_page`: max 100, default 50; `page` default 1
`sort`: field name, prefix with - for descending (e.g. -scheduled_at)

---

## GolfCourseAPI (`golfcourse_`) — 6 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `golfcourse_search_courses` | Search for golf courses by name with optional country, state, and limit filters. | **search**, country?, state?, limit? |
| `golfcourse_get_course` | Get detailed information about a specific golf course. | **course_id** |
| `golfcourse_get_courses_nearby` | Find golf courses near a geographic location. | **lat**, **lng**, radius? |
| `golfcourse_get_countries` | List all countries that have golf courses in the database. | _(none)_ |
| `golfcourse_get_states` | List states/provinces for a given country. | **country_code** |
| `golfcourse_get_course_reviews` | Get reviews for a specific golf course. | **course_id** |

`country`/`country_code`: ISO-style country codes, e.g. US, GB, CA
`radius`: search radius in miles

---

## College Football Data (`cfbd_`) — 14 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `cfbd_get_games` | List college football games, filterable by year, season type, week, team, or conference. | **year**, season_type?, week?, team?, conference? |
| `cfbd_get_game` | Get detailed info about a specific game by ID. | **game_id** |
| `cfbd_get_teams` | List college football teams, optionally filtered by conference. | conference? |
| `cfbd_get_team` | Get details for a specific team by name. | **team_name** |
| `cfbd_get_rankings` | Get poll rankings (AP, Coaches, CFP) for a year and week. | **year**, week?, season_type? |
| `cfbd_get_standings` | Get team records/standings for a season. | **year**, team?, conference? |
| `cfbd_get_drives` | Get drive data for games, filterable by year, team, game, or week. | **year**, team?, game_id?, week? |
| `cfbd_get_plays` | Get play-by-play data; requires year and week. | **year**, **week**, team?, play_type? |
| `cfbd_get_player_stats` | Get player season statistics. | **year**, team?, conference?, category? |
| `cfbd_get_team_stats` | Get team season statistics. | **year**, team?, conference? |
| `cfbd_get_recruiting` | Get recruiting rankings and player data. | **year**, team?, classification? |
| `cfbd_get_betting_lines` | Get betting lines and spreads for games. | **year**, week?, team?, conference? |
| `cfbd_get_conferences` | List all college football conferences. | _(none)_ |
| `cfbd_get_venues` | List all college football venues/stadiums. | _(none)_ |

`season_type`: "regular" or "postseason"
`conference`: abbreviation, e.g. SEC, B1G, ACC
`category` (player stats): passing, rushing, receiving, defensive
`classification` (recruiting): HighSchool, JUCO, PrepSchool

---

## Boxing Data API (`boxing_`) — 8 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `boxing_get_fighters` | Search or list boxers (records W/L/D, KOs, division, titles, physicals). Filter by name/division. | name?, division_id?, page_num?, page_size? |
| `boxing_get_fighter` | Get a single boxer's full profile by id (career record, stats, titles, bio). | **fighter_id** |
| `boxing_get_events` | List boxing events / fight cards (date, venue, broadcaster, bouts). | page_num?, page_size?, date_sort? |
| `boxing_get_event` | Get a single boxing event by id (full card with bouts and results). | **event_id** |
| `boxing_get_bouts` | List boxing bouts (matchups, results, scorecards, titles on the line). | page_num?, page_size? |
| `boxing_get_bout` | Get a single bout by id (fighters, result, method, rounds, scorecards). | **bout_id** |
| `boxing_get_divisions` | List boxing weight divisions with their ids. | _(none)_ |
| `boxing_get_titles` | List boxing titles/belts and sanctioning organizations. | _(none)_ |

---

## Highlightly (`highlightly_`) — 6 tools

| Tool | Description | Parameters |
|------|-------------|------------|
| `highlightly_get_leagues` | List leagues/competitions for a sport, optionally filtered by country or season. | **sport**, country?, season?, limit?, offset? |
| `highlightly_get_matches` | Get matches/fixtures for a sport, filtered by date, league or season. | **sport**, date?, league_id?, season?, limit?, offset? |
| `highlightly_get_standings` | Get league standings/table for a sport. Requires a league id and season. | **sport**, **league_id**, **season** |
| `highlightly_get_highlights` | Get video highlight clips for a sport, filtered by league or a specific match. | **sport**, league_id?, match_id?, season?, limit?, offset? |
| `highlightly_get_odds` | Get pre-match/live odds aggregated from 100+ bookmakers for a sport, by match or league. | **sport**, match_id?, league_id? |
| `highlightly_get_head_to_head` | Get head-to-head history between two teams for a sport. | **sport**, **team_id_1**, **team_id_2** |

