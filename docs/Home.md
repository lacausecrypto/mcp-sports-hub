# Sports Hub MCP Server

A unified [Model Context Protocol](https://modelcontextprotocol.io/) server that aggregates **41 sports API providers** into a single service. **396 tools** covering scores, stats, odds, esports, college sports, chess, AFL, and more across 70+ sports.

Works with any MCP client (Claude, ChatGPT, Gemini, Cursor, Windsurf, Continue, Cline, Zed) on macOS, Linux, and Windows.

## Quick Start

```bash
npx mcp-sports-hub
```

Or from source:

```bash
git clone https://github.com/lacausecrypto/mcp-sports-hub.git
cd mcp-sports-hub
npm install
npm run build
```

Add to Claude Desktop config:

```json
{
  "mcpServers": {
    "sports-hub": {
      "command": "npx",
      "args": ["mcp-sports-hub"]
    }
  }
}
```

By default this loads the `free` preset (19 no-key providers, ~165 tools) with zero configuration. Set `SPORTS_HUB_PROVIDERS=all` for all 41 providers (396 tools), or a preset like `us-major`, `soccer`, `f1`, `esports`, `odds`, `chess`. See [Configuration](Configuration.md) for API key setup.

## Providers

### No API key required (19 providers, ~165 tools)

| Prefix | Provider | Coverage | Tools |
|--------|----------|----------|-------|
| `espn_` | ESPN (unofficial) | 20+ sports | 10 |
| `nhl_` | NHL Web API | NHL | 13 |
| `mlb_` | MLB Stats API | MLB/MiLB | 13 |
| `f1_` | Jolpica F1 (Ergast successor) | Formula 1 (1950–present) | 13 |
| `openf1_` | OpenF1 | F1 live telemetry | 12 |
| `openliga_` | OpenLigaDB | German football | 10 |
| `sportsdb_` | TheSportsDB | 40+ sports | 13 |
| `ncaa_` | NCAA API | College sports | 8 |
| `sportsrc_` | SportSRC | Football/Basketball/MMA | 7 |
| `lichess_` | Lichess | Chess | 7 |
| `chesscom_` | Chess.com | Chess | 7 |
| `squiggle_` | Squiggle (AFL) | AFL | 6 |
| `motogp_` | MotoGP | MotoGP/Moto2/Moto3 | 7 |
| `formulae_` | Formula E | Formula E | 7 |
| `nascar_` | NASCAR | NASCAR | 3 |
| `opendota_` | OpenDota | Dota 2 analytics | 11 |
| `sleeper_` | Sleeper | NFL fantasy | 10 |
| `euroleague_` | EuroLeague Basketball | EuroLeague/EuroCup | 6 |
| `footballdata_uk_` | Football-Data.co.uk | Historical odds | 2 |

### API key required (22 providers, ~231 tools)

| Prefix | Provider | Coverage | Tools | Free Limit |
|--------|----------|----------|-------|------------|
| `apisports_` | API-Sports | 9 sports | 10 | 100/day/sport |
| `apifootball_` | API-Football | Soccer (960+ leagues) | 15 | 100/day |
| `apitennis_` | API-Tennis | Tennis (ATP/WTA/ITF) | 12 | 100/day |
| `bdl_` | BallDontLie | NBA/NFL/MLB/NHL | 10 | Basic tier |
| `cricket_` | CricketData | Cricket | 10 | 100/day |
| `entitycricket_` | Entity Sport | Cricket (250+ comps) | 12 | Free plan |
| `footballdata_` | football-data.org | Soccer (12 leagues) | 11 | 10/min |
| `sportmonks_` | Sportmonks | Soccer | 12 | 3000/hr |
| `sportsdata_` | SportsDataIO | 9 sports | 12 | 1000/mo |
| `odds_` | The Odds API | 70+ sports odds | 9 | 500/mo |
| `oddsio_` | Odds-API.io | 34 sports odds | 10 | Free account |
| `sgo_` | Sports Game Odds | 55+ leagues odds | 10 | Trial |
| `mma_` | Fighting Tomatoes | MMA | 8 | 200/mo |
| `livegolf_` | Live Golf API | Golf (PGA/DP World) | 8 | Free tier |
| `isports_` | iSportsAPI | Football/Basketball (Asia) | 10 | Free tier |
| `sportdevs_` | SportDevs | Rugby/Volleyball/Handball | 12 | Trial |
| `msf_` | MySportsFeeds | NFL/NBA/MLB/NHL | 12 | Free non-commercial |
| `pandascore_` | PandaScore | Esports (13 titles) | 14 | 1000/hr |
| `golfcourse_` | GolfCourseAPI | 30K+ golf courses | 6 | 300/day |
| `cfbd_` | College Football Data | NCAA football | 14 | 1000/mo |
| `boxing_` | Boxing Data API | Boxing | 8 | 100/mo |
| `highlightly_` | Highlightly | Highlights + odds | 6 | 100/day |

## Wiki Pages

- **[Configuration](Configuration.md)** — Environment variables, API keys, Claude Desktop/Code/Windows/Linux setup
- **[Providers](Providers.md)** — Detailed reference for all 41 providers with full tool lists
- **[Tools Reference](Tools-Reference.md)** — All 396 tools with descriptions and parameters
- **[Rate Limits](Rate-Limits.md)** — Rate limit details and strategies
- **[Architecture](Architecture.md)** — Project structure, provider pattern, how to contribute
