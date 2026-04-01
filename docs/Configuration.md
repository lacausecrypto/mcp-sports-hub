# Configuration

## Environment Variables

You only need to set keys for providers you intend to use. Missing keys do not prevent the server from starting.

### Free Providers (no key needed)

These providers work out of the box with no configuration:

- ESPN (`espn_`)
- NHL Web API (`nhl_`)
- MLB Stats API (`mlb_`)
- Jolpica F1 (`f1_`)
- OpenF1 (`openf1_`)
- OpenLigaDB (`openliga_`)

### Optional Key

| Variable | Provider | Notes |
|----------|----------|-------|
| `THESPORTSDB_API_KEY` | TheSportsDB | Defaults to test key `"3"` if not set. Get a Patreon key for higher limits at [thesportsdb.com](https://www.thesportsdb.com/patreon) |

### Required Keys (free registration)

| Variable | Provider | Where to Get It |
|----------|----------|-----------------|
| `API_SPORTS_KEY` | API-Sports | [api-sports.io](https://api-sports.io/) |
| `API_FOOTBALL_KEY` | API-Football | [api-football.com](https://www.api-football.com/) (uses API-Sports platform) |
| `API_TENNIS_KEY` | API-Tennis | [api-tennis.com](https://api-tennis.com/) (uses API-Sports platform) |
| `BALLDONTLIE_API_KEY` | BallDontLie | [balldontlie.io](https://www.balldontlie.io/) |
| `CRICKETDATA_API_KEY` | CricketData | [cricketdata.org](https://cricketdata.org/) |
| `FOOTBALL_DATA_API_KEY` | football-data.org | [football-data.org](https://www.football-data.org/client/register) |
| `SPORTMONKS_API_KEY` | Sportmonks | [sportmonks.com](https://www.sportmonks.com/) |
| `SPORTSDATA_IO_KEY` | SportsDataIO | [sportsdata.io](https://sportsdata.io/) |
| `THE_ODDS_API_KEY` | The Odds API | [the-odds-api.com](https://the-odds-api.com/) |
| `FIGHTING_TOMATOES_API_KEY` | Fighting Tomatoes | [fightingtomatoes.com/API](https://fightingtomatoes.com/API) |
| `SPORTDEVS_API_KEY` | SportDevs | [sportdevs.com](https://sportdevs.com/) |

## Claude Desktop Configuration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "sports-hub": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-sports-hub/dist/index.js"],
      "env": {
        "THESPORTSDB_API_KEY": "your-patreon-key",
        "API_SPORTS_KEY": "your-key",
        "API_FOOTBALL_KEY": "your-key",
        "API_TENNIS_KEY": "your-key",
        "BALLDONTLIE_API_KEY": "your-key",
        "CRICKETDATA_API_KEY": "your-key",
        "FOOTBALL_DATA_API_KEY": "your-key",
        "SPORTMONKS_API_KEY": "your-key",
        "SPORTSDATA_IO_KEY": "your-key",
        "THE_ODDS_API_KEY": "your-key",
        "FIGHTING_TOMATOES_API_KEY": "your-key",
        "SPORTDEVS_API_KEY": "your-key"
      }
    }
  }
}
```

Only include the `env` entries for providers you have keys for. Remove any lines where you do not have a key.

## Claude Code Configuration

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "sports-hub": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-sports-hub/dist/index.js"],
      "env": {
        "API_FOOTBALL_KEY": "your-key",
        "THE_ODDS_API_KEY": "your-key"
      }
    }
  }
}
```

Or in your global Claude Code settings at `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "sports-hub": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-sports-hub/dist/index.js"],
      "env": {
        "API_FOOTBALL_KEY": "your-key"
      }
    }
  }
}
```

## Notes

- Keys are checked at **call time**, not at startup. The server always starts with all 205 tools registered. If you call a tool that requires a missing key, you get an error message like `"API_FOOTBALL_KEY env var is required"`.
- You can use shell environment variables instead of the `env` block in the config file. The `env` block in the config overrides shell variables.
- The `args` path must be absolute. Use the full path to `dist/index.js` in your clone of the repo.
- Run `npm run build` after cloning or updating the repo. The server runs the compiled JavaScript from `dist/`.
