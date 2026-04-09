# Sports Hub MCP Server

<p align="center">
  <a href="https://www.npmjs.com/package/mcp-sports-hub"><img src="https://img.shields.io/npm/v/mcp-sports-hub?color=CB3837&logo=npm&logoColor=white" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/mcp-sports-hub"><img src="https://img.shields.io/npm/dt/mcp-sports-hub?color=CB3837&logo=npm&logoColor=white" alt="npm downloads"></a>
  <a href="https://github.com/lacausecrypto/mcp-sports-hub/actions"><img src="https://github.com/lacausecrypto/mcp-sports-hub/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Providers-29-orange" alt="29 Providers">
  <img src="https://img.shields.io/badge/Tools-319-green" alt="319 Tools">
  <a href="https://registry.modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP_Registry-published-8B5CF6?logo=anthropic&logoColor=white" alt="MCP Registry"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/macOS-supported-lightgrey?logo=apple&logoColor=white" alt="macOS">
  <img src="https://img.shields.io/badge/Linux-supported-lightgrey?logo=linux&logoColor=white" alt="Linux">
  <img src="https://img.shields.io/badge/Windows-supported-lightgrey?logo=windows&logoColor=white" alt="Windows">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
</p>

A unified MCP server that aggregates **29 sports API providers** into a single service. **319 tools** covering scores, stats, odds, esports, college sports, and more across 70+ sports.

> Each provider works independently. You only need API keys for the providers you use. Missing keys don't block startup — tools return an error when called without their key.

**Works with:**
[![Claude](https://img.shields.io/badge/Claude-Desktop_%7C_Code-D97706?logo=anthropic&logoColor=white)](https://claude.ai)
[![ChatGPT](https://img.shields.io/badge/ChatGPT-Desktop-74AA9C?logo=openai&logoColor=white)](https://openai.com)
[![Cursor](https://img.shields.io/badge/Cursor-IDE-000000?logo=cursor&logoColor=white)](https://cursor.com)
[![Windsurf](https://img.shields.io/badge/Windsurf-IDE-09B6A2)](https://codeium.com/windsurf)
[![Zed](https://img.shields.io/badge/Zed-Editor-084CCF)](https://zed.dev)
[![Continue](https://img.shields.io/badge/Continue-OSS-000000)](https://continue.dev)
[![Cline](https://img.shields.io/badge/Cline-VS_Code-007ACC?logo=visualstudiocode&logoColor=white)](https://github.com/cline/cline)

## Demo

![mcp-sports-hub demo](docs/demo.gif)

> NBA scores, Premier League odds, Tennis H2H — all from a single MCP server.

## Compatibility

### Platforms

| OS | Status |
|----|--------|
| macOS | Supported |
| Linux | Supported |
| Windows | Supported |

### MCP Clients

| Client | Status | Notes |
|--------|--------|-------|
| **Claude Desktop** | Supported | Anthropic's desktop app |
| **Claude Code (CLI)** | Supported | `claude mcp add` |
| **Cursor** | Supported | Built-in MCP |
| **Windsurf (Codeium)** | Supported | Built-in MCP |
| **Continue.dev** | Supported | Open-source AI assistant |
| **Cline** | Supported | VS Code extension |
| **Zed** | Supported | Built-in MCP |
| **ChatGPT Desktop** | Supported | OpenAI desktop app |
| **Gemini CLI** | Supported | Google CLI |
| **Any MCP client** | Supported | Stdio + HTTP/SSE transport |

Uses the **stdio transport** from the [MCP SDK](https://modelcontextprotocol.io). Works with any LLM (Claude, GPT, Gemini, Llama, Mistral, etc.).

**Requirements**: Node.js 18+, npm.

## Providers (29)

### Works instantly — no API key, no signup (9 providers, 98 tools)

These providers work out of the box. Just build and run.

| Prefix | Provider | Coverage | Tools | Notes |
|--------|----------|----------|-------|-------|
| `espn_` | [ESPN](https://site.api.espn.com/) | 20+ sports | 10 | Unofficial — can break |
| `nhl_` | [NHL Web API](https://api-web.nhle.com/) | NHL | 13 | Undocumented but stable |
| `mlb_` | [MLB Stats API](https://statsapi.mlb.com/) | MLB/MiLB | 13 | Official, undocumented |
| `f1_` | [Jolpica F1](http://api.jolpi.ca/ergast/f1/) | Formula 1 (1950+) | 13 | Community-maintained |
| `openf1_` | [OpenF1](https://openf1.org/) | F1 live telemetry | 12 | Live race weekends only |
| `openliga_` | [OpenLigaDB](https://api.openligadb.de/) | German football | 10 | Bundesliga focus |
| `golfcourse_` | [GolfCourseAPI](https://golfcourseapi.com/) | 30K+ courses | 6 | Course data only |
| `sportsdb_` | [TheSportsDB](https://www.thesportsdb.com/) | 40+ sports | 13 | Test key auto, watermarks |
| `ncaa_` | [NCAA API](https://github.com/henrygd/ncaa-api) | College sports | 8 | 5 req/s rate limit |

> **Tip**: Use `SPORTS_HUB_PROVIDERS=free` to load only these 9 providers.

### Free tier with API key — signup required, no credit card (20 providers, 221 tools)

Registration takes 1-2 minutes. All keys are free.

| Prefix | Provider | Coverage | Tools | Free Limit | Get Key |
|--------|----------|----------|-------|------------|---------|
| `pandascore_` | PandaScore | Esports (13 titles) | 14 | 1000 req/hr | [Sign up](https://pandascore.co/) |
| `apifootball_` | API-Football | Soccer (960+ leagues) | 15 | 100 req/day | [Sign up](https://www.api-football.com/) |
| `apisports_` | API-Sports | 9 sports | 10 | 100 req/day/sport | [Sign up](https://api-sports.io/) |
| `apitennis_` | API-Tennis | Tennis (ATP/WTA/ITF) | 12 | 100 req/day | [Sign up](https://api-tennis.com/) |
| `bdl_` | BallDontLie | NBA/NFL/MLB/NHL | 10 | Basic tier | [Sign up](https://www.balldontlie.io/) |
| `cricket_` | CricketData | Cricket | 10 | 100 req/day | [Sign up](https://cricketdata.org/) |
| `entitycricket_` | Entity Sport | Cricket (250+ comps) | 12 | Free plan | [Sign up](https://www.entitysport.com/) |
| `footballdata_` | football-data.org | Soccer (12 leagues) | 11 | 10 req/min | [Sign up](https://www.football-data.org/) |
| `sportmonks_` | Sportmonks | Soccer | 12 | 3000 req/hr | [Sign up](https://www.sportmonks.com/) |
| `sportsdata_` | SportsDataIO | 9 sports | 12 | 1000 req/mo | [Sign up](https://sportsdata.io/) |
| `odds_` | The Odds API | 70+ sports odds | 9 | 500 req/mo | [Sign up](https://the-odds-api.com/) |
| `oddsio_` | Odds-API.io | 34 sports odds | 10 | Free account | [Sign up](https://odds-api.io/) |
| `sgo_` | Sports Game Odds | 55+ leagues odds | 10 | Trial | [Sign up](https://sportsgameodds.com/) |
| `mma_` | Fighting Tomatoes | MMA | 8 | 200 req/mo | [Sign up](https://fightingtomatoes.com/) |
| `livegolf_` | Live Golf API | Golf (PGA/DP World) | 8 | Free tier | [Sign up](https://livegolfapi.com/) |
| `isports_` | iSportsAPI | Football/Basketball (Asia) | 10 | Free tier | [Sign up](https://www.isportsapi.com/) |
| `sportdevs_` | SportDevs | Rugby/Volleyball/Handball | 12 | Trial | [Sign up](https://sportdevs.com/) |
| `msf_` | MySportsFeeds | NFL/NBA/MLB/NHL | 12 | Free non-commercial | [Sign up](https://www.mysportsfeeds.com/) |
| `sportsrc_` | SportSRC | Football/NBA/UFC + xG | 10 | 1000 req/day | [Sign up](https://sportsrc.org/) |
| `cfbd_` | College Football Data | NCAA football | 14 | 1000 req/mo | [Sign up](https://collegefootballdata.com/key) |

> Providers with missing keys don't block the server — they just return an error when called. Register keys incrementally as you need them.

## Installation

### Quick (npx — no install)

```bash
npx mcp-sports-hub
```

### npm global

```bash
npm install -g mcp-sports-hub
mcp-sports-hub
```

### From source

```bash
git clone https://github.com/lacausecrypto/mcp-sports-hub.git
cd mcp-sports-hub
npm install
npm run build
```

### MCP Registry

This server is published on the [official MCP Registry](https://registry.modelcontextprotocol.io) as `io.github.lacausecrypto/sports-hub`. MCP clients that support the registry can discover and install it automatically.

## Transport Modes

### Stdio (default — Claude Desktop, Cursor, etc.)

```bash
npx mcp-sports-hub
```

### HTTP/SSE (remote clients, web apps, custom integrations)

```bash
# Via flag
npx mcp-sports-hub --http

# Via env
SPORTS_HUB_HTTP=1 SPORTS_HUB_PORT=3000 npx mcp-sports-hub
```

Endpoints:
- `POST /mcp` — MCP protocol (Streamable HTTP with SSE)
- `GET /health` — Health check (`{"status":"ok","providers":9}`)

Supports CORS, session management via `mcp-session-id` header. Default port: 3000.

## Configuration

### Environment Variables

Only set keys for providers you want:

```bash
# Free — no key needed:
# ESPN, NHL, MLB, Jolpica F1, OpenF1, OpenLigaDB, GolfCourseAPI

# Optional (defaults to test key)
export THESPORTSDB_API_KEY="your-key"          # https://www.thesportsdb.com/

# Requires free registration
export PANDASCORE_TOKEN="your-token"            # https://pandascore.co/
export API_SPORTS_KEY="your-key"                # https://api-sports.io/
export API_FOOTBALL_KEY="your-key"              # https://www.api-football.com/
export API_TENNIS_KEY="your-key"                # https://api-tennis.com/
export BALLDONTLIE_API_KEY="your-key"           # https://www.balldontlie.io/
export CRICKETDATA_API_KEY="your-key"           # https://cricketdata.org/
export ENTITY_SPORT_KEY="your-key"              # https://www.entitysport.com/
export FOOTBALL_DATA_API_KEY="your-key"         # https://www.football-data.org/
export SPORTMONKS_API_KEY="your-key"            # https://www.sportmonks.com/
export SPORTSDATA_IO_KEY="your-key"             # https://sportsdata.io/
export THE_ODDS_API_KEY="your-key"              # https://the-odds-api.com/
export ODDS_API_IO_KEY="your-key"               # https://odds-api.io/
export SPORTS_GAME_ODDS_KEY="your-key"          # https://sportsgameodds.com/
export FIGHTING_TOMATOES_API_KEY="your-key"     # https://fightingtomatoes.com/
export LIVE_GOLF_API_KEY="your-key"             # https://livegolfapi.com/
export ISPORTSAPI_KEY="your-key"                # https://www.isportsapi.com/
export SPORTDEVS_API_KEY="your-key"             # https://sportdevs.com/
export SPORTSRC_API_KEY="your-key"              # https://sportsrc.org/
export MYSPORTSFEEDS_USER="your-user"           # https://www.mysportsfeeds.com/
export MYSPORTSFEEDS_PASS="your-pass"
export CFBD_API_KEY="your-key"                  # https://collegefootballdata.com/key
```

**Windows** (PowerShell):
```powershell
$env:API_SPORTS_KEY = "your-key"
$env:PANDASCORE_TOKEN = "your-token"
```

**Windows** (cmd):
```cmd
set API_SPORTS_KEY=your-key
set PANDASCORE_TOKEN=your-token
```

### Claude Desktop

Config file locations:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "sports-hub": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-sports-hub/dist/index.js"],
      "env": {
        "PANDASCORE_TOKEN": "your-token",
        "API_SPORTS_KEY": "your-key",
        "THE_ODDS_API_KEY": "your-key"
      }
    }
  }
}
```

Windows path: `"args": ["C:/Users/you/mcp-sports-hub/dist/index.js"]`

Only include env vars for providers you need. Omit `env` entirely for free-only providers.

### Claude Code (CLI)

```bash
claude mcp add sports-hub node /absolute/path/to/mcp-sports-hub/dist/index.js
```

Or in `.claude/settings.json`:
```json
{
  "mcpServers": {
    "sports-hub": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-sports-hub/dist/index.js"],
      "env": {
        "PANDASCORE_TOKEN": "your-token"
      }
    }
  }
}
```

## Provider Filtering

By default, only the **free preset** is loaded (9 providers, ~98 tools — no API keys needed). Use `SPORTS_HUB_PROVIDERS` to change what's loaded:

```bash
# Default — free providers only (no config needed)
npx mcp-sports-hub

# Load ALL 29 providers (319 tools)
SPORTS_HUB_PROVIDERS=all npx mcp-sports-hub

# Use a preset
SPORTS_HUB_PROVIDERS=us-major npx mcp-sports-hub

# Pick specific providers
SPORTS_HUB_PROVIDERS=espn,nhl,odds npx mcp-sports-hub

# Exclude from all (prefix with -)
SPORTS_HUB_PROVIDERS=-sportsdata,-mma npx mcp-sports-hub
```

### Presets

| Preset | Providers | Tools | Needs keys? |
|--------|-----------|-------|-------------|
| `free` (default) | espn, nhl, mlb, f1, openf1, openliga, golfcourse, sportsdb, ncaa | ~98 | No |
| `all` | all 29 providers | 319 | Yes (for key-required providers) |
| `us-major` | espn, nhl, mlb, ncaa, cfbd, bdl, msf | ~79 | Some |
| `soccer` | espn, apifootball, footballdata, sportmonks, openliga, sportsrc | ~69 | Some |
| `f1` | f1, openf1 | 25 | No |
| `esports` | pandascore | 14 | Yes |
| `odds` | odds, oddsio, sgo | 29 | Yes |
| `cricket` | cricket, entitycricket | 22 | Yes |
| `golf` | livegolf, golfcourse | 14 | Some |

### Cache

All GET responses are cached in memory for 60 seconds by default. This protects against duplicate calls and rate limit waste. Configure with:

```bash
SPORTS_HUB_CACHE_TTL=120  # seconds (0 to disable)
```

In Claude Desktop config:
```json
"env": {
  "SPORTS_HUB_PROVIDERS": "us-major",
  "THE_ODDS_API_KEY": "your-key"
}
```

## Tool Naming

All tools follow `{provider}_{action}`:

```
espn_get_scoreboard        — Live scores (ESPN)
nhl_get_standings          — NHL standings
mlb_get_game_boxscore      — MLB box score
f1_get_race_results        — F1 results (1950+)
openf1_get_laps            — F1 live telemetry
pandascore_get_lives       — Live esports matches
apifootball_get_fixtures   — Soccer fixtures (960+ leagues)
odds_get_odds              — Betting odds (70+ sports)
sportsrc_get_xg_stats      — Expected goals (xG)
```

## Architecture

```
src/
├── index.ts                    # Imports + registers all 29 providers
├── shared/
│   └── http.ts                 # fetchJson, buildUrl, toolResult, errorResult
└── providers/
    ├── espn.ts                 #  10 tools — no key
    ├── nhl.ts                  #  13 tools — no key
    ├── mlb-stats.ts            #  13 tools — no key
    ├── jolpica-f1.ts           #  13 tools — no key
    ├── openf1.ts               #  12 tools — no key
    ├── openligadb.ts           #  10 tools — no key
    ├── golfcourse.ts           #   6 tools — no key
    ├── thesportsdb.ts          #  13 tools — optional key
    ├── pandascore.ts           #  14 tools — PANDASCORE_TOKEN
    ├── api-football.ts         #  15 tools — API_FOOTBALL_KEY
    ├── api-sports.ts           #  10 tools — API_SPORTS_KEY
    ├── api-tennis.ts           #  12 tools — API_TENNIS_KEY
    ├── balldontlie.ts          #  10 tools — BALLDONTLIE_API_KEY
    ├── cricketdata.ts          #  10 tools — CRICKETDATA_API_KEY
    ├── entity-sport-cricket.ts #  12 tools — ENTITY_SPORT_KEY
    ├── football-data.ts        #  11 tools — FOOTBALL_DATA_API_KEY
    ├── sportmonks.ts           #  12 tools — SPORTMONKS_API_KEY
    ├── sportsdata-io.ts        #  12 tools — SPORTSDATA_IO_KEY
    ├── the-odds-api.ts         #   9 tools — THE_ODDS_API_KEY
    ├── odds-api-io.ts          #  10 tools — ODDS_API_IO_KEY
    ├── sports-game-odds.ts     #  10 tools — SPORTS_GAME_ODDS_KEY
    ├── fighting-tomatoes.ts    #   8 tools — FIGHTING_TOMATOES_API_KEY
    ├── live-golf.ts            #   8 tools — LIVE_GOLF_API_KEY
    ├── isportsapi.ts           #  10 tools — ISPORTSAPI_KEY
    ├── sportdevs.ts            #  12 tools — SPORTDEVS_API_KEY
    ├── mysportsfeeds.ts        #  12 tools — MYSPORTSFEEDS_USER/PASS
    ├── sportsrc.ts             #  10 tools — SPORTSRC_API_KEY
    ├── ncaa.ts                 #   8 tools — no key
    └── cfbd.ts                 #  14 tools — CFBD_API_KEY
```

Each provider exports `register(server)`. Keys are checked at call time, not startup.

## Contributing

1. Fork the repository
2. Create `src/providers/my-api.ts` exporting `register(server: McpServer)`
3. Prefix tool names: `myapi_get_something`
4. Import + call in `src/index.ts`
5. `npm run build` to verify
6. Submit a PR

## License

MIT
