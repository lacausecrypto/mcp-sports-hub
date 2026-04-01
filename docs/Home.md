# Sports Hub MCP Server

A unified [Model Context Protocol](https://modelcontextprotocol.io/) server that aggregates **27 sports API providers** into a single service. **297 tools** covering scores, stats, odds, esports, and more.

Works with any MCP client (Claude, ChatGPT, Gemini, Cursor, Windsurf, Continue, Cline, Zed) on macOS, Linux, and Windows.

## Quick Start

```bash
git clone https://github.com/sports-mcp/hub.git
cd mcp-sports-hub
npm install
npm run build
```

Add to Claude Desktop config:

```json
{
  "mcpServers": {
    "sports-hub": {
      "command": "node",
      "args": ["/path/to/mcp-sports-hub/dist/index.js"]
    }
  }
}
```

This gives you access to all free providers (ESPN, NHL, MLB, F1, OpenF1, OpenLigaDB, GolfCourseAPI, TheSportsDB) with zero configuration. See [Configuration](Configuration.md) for API key setup.

## Providers

### No API key required (8 providers, 90 tools)

| Prefix | Provider | Coverage | Tools |
|--------|----------|----------|-------|
| `espn_` | ESPN (unofficial) | 20+ sports | 10 |
| `nhl_` | NHL Web API | NHL | 13 |
| `mlb_` | MLB Stats API | MLB/MiLB | 13 |
| `f1_` | Jolpica F1 | Formula 1 (1950-present) | 13 |
| `openf1_` | OpenF1 | F1 live telemetry | 12 |
| `openliga_` | OpenLigaDB | German football | 10 |
| `golfcourse_` | GolfCourseAPI | 30K+ courses | 6 |
| `sportsdb_` | TheSportsDB | 40+ sports | 13 |

### API key required (19 providers, 207 tools)

| Prefix | Provider | Coverage | Tools | Free Limit |
|--------|----------|----------|-------|------------|
| `pandascore_` | PandaScore | Esports (13 titles) | 14 | 1000 req/hr |
| `apifootball_` | API-Football | Soccer (960+ leagues) | 15 | 100 req/day |
| `apisports_` | API-Sports | 9 sports | 10 | 100 req/day/sport |
| `apitennis_` | API-Tennis | Tennis (ATP/WTA/ITF) | 12 | 100 req/day |
| `bdl_` | BallDontLie | NBA/NFL/MLB/NHL | 10 | Basic tier |
| `cricket_` | CricketData | Cricket | 10 | 100 req/day |
| `entitycricket_` | Entity Sport | Cricket (250+ comps) | 12 | Free plan |
| `footballdata_` | football-data.org | Soccer (12 leagues) | 11 | 10 req/min |
| `sportmonks_` | Sportmonks | Soccer | 12 | 3000 req/hr |
| `sportsdata_` | SportsDataIO | 9 sports | 12 | 1000 req/mo |
| `odds_` | The Odds API | 70+ sports odds | 9 | 500 req/mo |
| `oddsio_` | Odds-API.io | 34 sports odds | 10 | Free account |
| `sgo_` | Sports Game Odds | 55+ leagues odds | 10 | Trial |
| `mma_` | Fighting Tomatoes | MMA | 8 | 200 req/mo |
| `livegolf_` | Live Golf API | Golf (PGA/DP World) | 8 | Free tier |
| `isports_` | iSportsAPI | Football/Basketball (Asia) | 10 | Free tier |
| `sportdevs_` | SportDevs | Rugby/Volleyball/Handball | 12 | Trial |
| `msf_` | MySportsFeeds | NFL/NBA/MLB/NHL | 12 | Free non-commercial |
| `sportsrc_` | SportSRC | Football/NBA/UFC + xG | 10 | 1000 req/day |

## Wiki Pages

- **[Configuration](Configuration.md)** -- Environment variables, API keys, Claude Desktop/Code/Windows/Linux setup
- **[Providers](Providers.md)** -- Detailed reference for all 27 providers with full tool lists
- **[Tools Reference](Tools-Reference.md)** -- All 297 tools with descriptions and parameters
- **[Rate Limits](Rate-Limits.md)** -- Rate limit details and strategies
- **[Architecture](Architecture.md)** -- Project structure, provider pattern, how to contribute
