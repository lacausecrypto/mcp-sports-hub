# Sports Hub MCP Server

Unified MCP server — 41 providers, 396 tools, one process.
Covers: NFL, NBA, EuroLeague, MLB, NHL, Soccer, F1, MotoGP, Formula E, NASCAR, Tennis, Cricket, MMA, Boxing, Golf, Esports, Rugby, Volleyball, Handball, College Sports, Chess, AFL, NFL fantasy, and more.
Also exposes MCP **resources** (provider/preset catalogs at `sportshub://...`) and **prompts** (curated workflows like `whats-on-today`, `compare-odds`, `motorsport-weekend`).

Works with any MCP client (Claude, ChatGPT, Gemini, Cursor, Windsurf, Continue, Cline, Zed).
Uses stdio transport — compatible with any LLM supporting the Model Context Protocol.

## Provider Reference

### No API key required (19 providers, ~165 tools)

| Prefix | Provider | Coverage | Tools |
|--------|----------|----------|-------|
| `espn_` | ESPN (unofficial) | 20+ sports — scores, standings, news | 10 |
| `nhl_` | NHL Web API | NHL schedules, rosters, player stats | 13 |
| `mlb_` | MLB Stats API | MLB/MiLB games, players, standings | 13 |
| `f1_` | Jolpica F1 | F1 results, standings, circuits (1950-now) | 13 |
| `openf1_` | OpenF1 | F1 live telemetry, lap times, race control | 12 |
| `openliga_` | OpenLigaDB | German football (Bundesliga focus) | 10 |
| `sportsdb_` | TheSportsDB | 40+ sports, teams, players, events | 13 |
| `ncaa_` | NCAA API | College sports (football, basketball, etc.) | 8 |
| `sportsrc_` | SportSRC | Football/Basketball/MMA + streams | 7 |
| `lichess_` | Lichess | Chess (users, top players, broadcasts, tournaments, daily puzzle) | 7 |
| `chesscom_` | Chess.com | Chess (profiles, stats, clubs, archives, leaderboards) | 7 |
| `squiggle_` | Squiggle | AFL (Australian Football League): teams, games, ladder, tips, sources | 6 |
| `motogp_` | MotoGP (unofficial) | MotoGP/Moto2/Moto3/MotoE: seasons, results, sessions, standings, riders | 7 |
| `formulae_` | Formula E (unofficial) | Formula E: championships, races, results, teams, standings | 7 |
| `nascar_` | NASCAR (unofficial) | NASCAR Cup/Xfinity/Truck: schedule, live feed, lap times | 3 |
| `opendota_` | OpenDota | Dota 2: pro matches, match/player/hero analytics, teams, leagues | 11 |
| `sleeper_` | Sleeper | NFL fantasy: player search, injuries, trending, leagues, rosters | 10 |
| `euroleague_` | EuroLeague Basketball | EuroLeague + EuroCup: games, clubs, boxscores, play-by-play | 6 |
| `footballdata_uk_` | Football-Data.co.uk | Historical football results + bookmaker odds (CSV, 25+ leagues) | 2 |

`sportsdb_` defaults to test key "3" (free, watermarked images). Set `THESPORTSDB_API_KEY` for a personal key.
`sportsrc_` V1 endpoints are free with no key. V2 (xG, momentum, lineups) needs `SPORTSRC_API_KEY` and is currently NOT exposed.

### API key required (22 providers, ~231 tools)

| Prefix | Provider | Env var | Coverage | Tools | Free limit |
|--------|----------|---------|----------|-------|------------|
| `apisports_` | API-Sports | `API_SPORTS_KEY` | 9 sports multi-stat | 10 | 100/day/sport |
| `apifootball_` | API-Football | `API_FOOTBALL_KEY` | Soccer 960+ leagues | 15 | 100/day |
| `apitennis_` | API-Tennis | `API_TENNIS_KEY` | ATP, WTA, ITF | 12 | 100/day |
| `bdl_` | BallDontLie | `BALLDONTLIE_API_KEY` | NBA, NFL, MLB, NHL | 10 | Basic tier |
| `cricket_` | CricketData | `CRICKETDATA_API_KEY` | Cricket (Test, ODI, T20, IPL) | 10 | 100/day |
| `entitycricket_` | Entity Sport | `ENTITY_SPORT_KEY` | Cricket 250+ competitions | 12 | Free plan |
| `footballdata_` | football-data.org | `FOOTBALL_DATA_API_KEY` | Soccer 12 European leagues | 11 | 10/min |
| `sportmonks_` | Sportmonks | `SPORTMONKS_API_KEY` | Soccer (Danish + Scottish free) | 12 | 3000/hr |
| `sportsdata_` | SportsDataIO | `SPORTSDATA_IO_KEY` | 9 sports (data scrambled) | 12 | 1000/mo |
| `odds_` | The Odds API | `THE_ODDS_API_KEY` | Odds 70+ sports, 40+ bookmakers | 9 | 500/mo |
| `oddsio_` | Odds-API.io | `ODDS_API_IO_KEY` | Odds 34 sports, 265+ bookmakers | 10 | Free account |
| `sgo_` | Sports Game Odds | `SPORTS_GAME_ODDS_KEY` | Odds 55+ leagues, player props | 10 | Trial |
| `mma_` | Fighting Tomatoes | `FIGHTING_TOMATOES_API_KEY` | MMA fight history | 8 | 200/mo |
| `livegolf_` | Live Golf API | `LIVE_GOLF_API_KEY` | Golf PGA, DP World Tour | 8 | Free tier |
| `isports_` | iSportsAPI | `ISPORTSAPI_KEY` | Football + Basketball (Asia-Pacific) | 10 | Free tier |
| `sportdevs_` | SportDevs | `SPORTDEVS_API_KEY` | Rugby, Volleyball, Handball | 12 | Trial |
| `msf_` | MySportsFeeds | `MYSPORTSFEEDS_USER` + `_PASS` | NFL, NBA, MLB, NHL (detailed) | 12 | Free non-commercial |
| `pandascore_` | PandaScore | `PANDASCORE_TOKEN` | Esports 13 titles (LoL, CS2, Dota2...) | 14 | 1000/hr |
| `golfcourse_` | GolfCourseAPI | `GOLFCOURSE_API_KEY` | 30K+ golf courses worldwide | 6 | 300/day |
| `cfbd_` | College Football Data | `CFBD_API_KEY` | NCAA football (games, stats, recruiting) | 14 | 1000/mo |
| `boxing_` | Boxing Data API | `BOXING_DATA_API_KEY` | Pro boxing (fighters, bouts, events, titles) — via RapidAPI | 8 | 100/mo |
| `highlightly_` | Highlightly | `HIGHLIGHTLY_API_KEY` | Multi-sport video highlights, odds, standings, predictions | 6 | 100/day |

## Choosing the right tool

**Live scores**: `espn_get_scoreboard` (multi-sport), `nhl_get_scores`, `openliga_get_current_matchday`, `sportsrc_get_live`
**Standings**: `espn_get_standings`, `nhl_get_standings`, `mlb_get_standings`, `apifootball_get_standings`, `footballdata_get_standings`
**Player stats**: `mlb_get_player_stats`, `nhl_get_player`, `bdl_get_stats`, `apisports_get_players`
**Game details**: `mlb_get_game_boxscore`, `nhl_get_game_boxscore`, `espn_get_event_summary`
**Soccer fixtures**: `apifootball_get_fixtures` (960+ leagues), `footballdata_get_matches` (12 top leagues), `sportsrc_get_matches`
**F1 data**: `f1_get_race_results` (historical 1950+), `openf1_get_laps` (live telemetry)
**Motorsport (beyond F1)**: `motogp_get_standings`, `formulae_get_driver_standings`, `nascar_get_schedule`, `nascar_get_live`
**Betting odds (live)**: `odds_get_odds`, `oddsio_get_odds`, `sgo_get_odds`, `highlightly_get_odds`
**Betting odds (historical, for backtesting)**: `footballdata_uk_get_matches` (results + closing odds, 2000-now)
**Basketball (beyond NBA)**: `euroleague_get_games`, `euroleague_get_game_boxscore` (EuroLeague + EuroCup), `bdl_get_*` (NBA)
**Boxing**: `boxing_get_fighters`, `boxing_get_bouts`, `boxing_get_events` (distinct from MMA)
**Video highlights**: `highlightly_get_highlights` (multi-sport clips)
**Esports**: `pandascore_get_matches`, `pandascore_get_lives` (LoL, CS2, Valorant), `opendota_get_pro_matches`, `opendota_get_match` (deep Dota 2 analytics)
**NFL fantasy**: `sleeper_search_players` (injuries/depth charts), `sleeper_get_trending_players`, `sleeper_get_league_matchups`
**Cricket**: `cricket_get_current_matches`, `entitycricket_get_matches`
**Golf**: `livegolf_get_leaderboard`, `golfcourse_search_courses`
**MMA**: `mma_search_fighters`, `mma_get_fighter_fights`
**College sports**: `ncaa_get_scoreboard`, `ncaa_get_rankings`, `cfbd_get_games`, `cfbd_get_plays`
**Chess**: `lichess_get_top_players`, `lichess_get_user`, `lichess_get_daily_puzzle`, `chesscom_get_player_stats`, `chesscom_get_leaderboards`
**AFL (Australian football)**: `squiggle_get_games`, `squiggle_get_ladder`, `squiggle_get_tips`
**Niche sports**: `sportdevs_get_matches` (rugby, volleyball, handball)
**Team/player search**: `sportsdb_search_teams`, `sportsdb_search_players`, `mlb_search_players`

## Rate limits — use with care

| Provider | Limit | Strategy |
|----------|-------|----------|
| The Odds API | 500 req/month | Use `odds_check_usage` before heavy queries |
| Fighting Tomatoes | 200 req/month | Cache results, use sparingly |
| SportsDataIO | 1000 req/month | Data is scrambled on free tier anyway |
| API-Sports family | 100 req/day each | Batch queries, avoid redundant calls |
| football-data.org | 10 req/min | Space out requests |
| PandaScore | 1000 req/hour | Generous, but paginate wisely |

Providers without published limits (ESPN, NHL, MLB, F1, OpenF1, OpenLigaDB, GolfCourseAPI): fair use applies.

## Caveats

- **ESPN** (`espn_`): Unofficial API — can break without notice.
- **MotoGP / Formula E / NASCAR** (`motogp_`, `formulae_`, `nascar_`): Unofficial/undocumented vendor backends — can change without notice (same risk class as ESPN). MotoGP/Formula E results use chained UUID lookups; Formula E standings need a `championshipId`.
- **Sleeper** (`sleeper_`): NFL only for player data; the player DB is large (cached 24h) — use `sleeper_search_players`, never expect a full dump. ~1000 req/min cap.
- **OpenDota** (`opendota_`): Keyless free tier ~60 req/min, 50k/mo. `opendota_search_players` is a slow DB query (20-30s).
- **EuroLeague** (`euroleague_`): Keyless official feeds (JSON). Use competition `E` (EuroLeague) or `U` (EuroCup) + season start year. v1 XML feeds are not wrapped (JSON-only).
- **Football-Data.co.uk** (`footballdata_uk_`): CSV parsed to JSON; historical (updated within days of each round), not live. Cryptic column codes — see https://www.football-data.co.uk/notes.txt.
- **Boxing** (`boxing_`): Via RapidAPI; free Basic plan is only **100 requests/month** — use sparingly.
- **Highlightly** (`highlightly_`): Free Basic = 100 req/day. `sport` is part of the path (e.g. "football" = soccer). Standings need leagueId + season.
- **TheSportsDB** (`sportsdb_`): Test key "3" = watermarked images. $1/mo Patreon for clean images.
- **SportsDataIO** (`sportsdata_`): Free tier data is partially randomized/scrambled.
- **Sportmonks** (`sportmonks_`): Free = only Danish Superliga + Scottish Premiership.
- **OpenF1** (`openf1_get_car_data`): Returns massive data volumes — always use `date_gte`/`date_lte` filters.
- **MySportsFeeds** (`msf_`): Free for non-commercial only. V1.x free, V2.0 requires donation.

## Provider Filtering

By default, only the `free` preset is loaded (19 providers, ~165 tools — no API keys needed).
Set `SPORTS_HUB_PROVIDERS=all` for all 41 providers (396 tools), but that many tools can overwhelm LLMs.
Use `SPORTS_HUB_PROVIDERS` to control which providers are active.

### Presets (recommended)

| Preset | Providers loaded | Use case |
|--------|-----------------|----------|
| `us-major` | espn, nhl, mlb, ncaa, cfbd, bdl, msf, nascar, sleeper | US sports fans |
| `soccer` | espn, apifootball, footballdata, sportmonks, openliga, sportsrc, footballdatauk, highlightly | Football/soccer |
| `f1` | f1, openf1 | Formula 1 |
| `motorsport` | f1, openf1, motogp, formulae, nascar | F1, MotoGP, Formula E, NASCAR |
| `esports` | pandascore, opendota | LoL, CS2, Dota 2 (+ deep Dota analytics)... |
| `odds` | odds, oddsio, sgo | Betting odds |
| `cricket` | cricket, entitycricket | Cricket |
| `golf` | livegolf, golfcourse | Golf |
| `chess` | lichess, chesscom | Chess (Lichess + Chess.com) |
| `free` | espn, nhl, mlb, f1, openf1, openliga, sportsdb, ncaa, sportsrc, lichess, chesscom, squiggle, motogp, formulae, nascar, opendota, sleeper, euroleague, footballdatauk | All no-key providers (19) |

### Usage

```bash
# Default — free preset, 19 no-key providers, ~165 tools
node dist/index.js

# All 41 providers (396 tools)
SPORTS_HUB_PROVIDERS=all node dist/index.js

# Preset — recommended for most users
SPORTS_HUB_PROVIDERS=us-major node dist/index.js

# Custom selection
SPORTS_HUB_PROVIDERS=espn,nhl,odds node dist/index.js

# Exclude specific providers (prefix with -)
SPORTS_HUB_PROVIDERS=-sportsdata,-mma node dist/index.js

# Combine presets with extra providers
SPORTS_HUB_PROVIDERS=soccer,odds node dist/index.js
```

In Claude Desktop config:
```json
{
  "mcpServers": {
    "sports-hub": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "SPORTS_HUB_PROVIDERS": "us-major",
        "THE_ODDS_API_KEY": "your-key"
      }
    }
  }
}
```

### Why filter?

LLMs work best with fewer, focused tools. Recommendations:
- **General use**: `free` preset (19 providers, ~165 tools)
- **Specific sport**: use the sport preset (`f1`, `soccer`, `esports`, etc.)
- **Full access**: `SPORTS_HUB_PROVIDERS=all` (396 tools — works but slower tool selection)

## Transport

Two modes available:

**Stdio** (default) — for Claude Desktop, Cursor, Windsurf, Cline, etc.:
```bash
npx mcp-sports-hub
```

**HTTP/SSE** — for remote clients, web apps, custom integrations:
```bash
SPORTS_HUB_HTTP=1 npx mcp-sports-hub
# POST /mcp    → MCP Streamable HTTP (SSE)
# GET  /health → {"status":"ok","providers":9}
```

Port configurable via `SPORTS_HUB_PORT` (default 3000). CORS enabled.

## Cache

All GET responses are cached in memory for 60 seconds. This protects rate-limited providers from duplicate calls within the same conversation. Configure with `SPORTS_HUB_CACHE_TTL` (seconds, 0 to disable).

## Setup

```bash
npm install && npm run build
node dist/index.js
```

Or just: `npx mcp-sports-hub`

Set env vars for providers you need. Missing keys don't block startup.

## Project Structure

```
src/index.ts           → Lazy-imports, provider filtering, stdio/HTTP transport
src/shared/http.ts     → fetchJson() with TTL cache, buildUrl(), toolResult(), errorResult()
src/providers/*.ts     → One file per API, exports register(server)
src/tests/smoke.test.mjs → 118 smoke tests (run: npm test)
```
