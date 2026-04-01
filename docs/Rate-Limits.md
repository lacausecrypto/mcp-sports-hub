# Rate Limits

## Overview

| Provider | Prefix | Rate Limit | Period | Auth Required |
|----------|--------|------------|--------|---------------|
| ESPN | `espn_` | No published limit | - | No |
| NHL Web API | `nhl_` | No published limit | - | No |
| MLB Stats API | `mlb_` | No published limit | - | No |
| Jolpica F1 | `f1_` | No published limit | - | No |
| OpenF1 | `openf1_` | No published limit | - | No |
| OpenLigaDB | `openliga_` | No published limit | - | No |
| TheSportsDB | `sportsdb_` | 30 req/min | Per minute | No (test key) |
| API-Sports | `apisports_` | 100 req/day per sport | Daily | Yes |
| API-Football | `apifootball_` | 100 req/day | Daily | Yes |
| API-Tennis | `apitennis_` | 100 req/day | Daily | Yes |
| BallDontLie | `bdl_` | Varies by plan | - | Yes |
| CricketData | `cricket_` | 100 req/day | Daily | Yes |
| football-data.org | `footballdata_` | 10 req/min | Per minute | Yes |
| Sportmonks | `sportmonks_` | 3000 req/hr | Hourly | Yes |
| SportsDataIO | `sportsdata_` | 1000 req/mo | Monthly | Yes |
| The Odds API | `odds_` | 500 req/mo | Monthly | Yes |
| Fighting Tomatoes | `mma_` | 200 req/mo | Monthly | Yes |
| SportDevs | `sportdevs_` | Trial limits | - | Yes |

## Providers Without Published Limits

ESPN, NHL, MLB, Jolpica F1, OpenF1, and OpenLigaDB do not document rate limits. They are free and open, but fair use applies. Avoid sending hundreds of requests per minute.

- **ESPN** is an unofficial API -- excessive use could lead to IP blocking.
- **NHL and MLB** are official APIs but not formally documented for third-party use.
- **Jolpica F1** is community-maintained. Be respectful of their hosting costs.
- **OpenF1** returns large payloads for telemetry data. Use filters to limit data volume.

## Daily-Limited Providers

These providers reset their quota daily (typically at midnight UTC):

| Provider | Daily Limit | How to Check |
|----------|-------------|--------------|
| API-Sports | 100 req/day per sport | `apisports_get_status` |
| API-Football | 100 req/day total | `apifootball_get_status` |
| API-Tennis | 100 req/day total | `apitennis_get_status` |
| CricketData | 100 req/day total | Response includes usage info |

**Tips for daily-limited providers:**
- Use `get_status` tools to check remaining quota before making multiple calls.
- Prefer broad queries over many narrow ones. For example, get all fixtures for a date rather than looking up fixtures one by one.
- API-Sports counts each sport separately, so 100 req/day for football plus 100 req/day for basketball.

## Per-Minute Limited Providers

| Provider | Limit | Behavior When Exceeded |
|----------|-------|----------------------|
| TheSportsDB (test key) | 30 req/min | HTTP 429 error |
| football-data.org | 10 req/min | HTTP 429 error |

**Tips for per-minute limits:**
- Space out requests when doing bulk lookups.
- football-data.org's 10 req/min is strict. If you need multiple data points, batch them into fewer calls using date ranges and filters.

## Monthly-Limited Providers

| Provider | Monthly Limit | How to Check |
|----------|---------------|--------------|
| SportsDataIO | 1000 req/mo | Dashboard at sportsdata.io |
| The Odds API | 500 req/mo | `odds_check_usage` |
| Fighting Tomatoes | 200 req/mo | Dashboard at fightingtomatoes.com |

**Tips for monthly-limited providers:**
- The Odds API includes usage headers on every response. Use `odds_check_usage` to check your remaining quota.
- SportsDataIO's free tier returns scrambled/fake data. Consider if you actually need it before spending quota.
- Fighting Tomatoes at 200 req/mo means roughly 6-7 requests per day. Plan carefully.

## What Happens When You Hit a Limit

The behavior depends on the provider:

- **HTTP 429 (Too Many Requests):** Most providers return this status code. The tool will return an error message like `"HTTP 429 Too Many Requests"`.
- **HTTP 403 (Forbidden):** Some providers return 403 when the daily/monthly quota is exhausted.
- **Error in response body:** Some providers return HTTP 200 with an error in the JSON body (e.g., API-Sports returns `{"errors": {"rateLimit": "..."}}`).

In all cases, the MCP tool will return an error message. No data is lost -- just wait for the limit to reset and try again.

## Tips for Staying Within Limits

1. **Start with free providers.** ESPN, NHL, MLB, Jolpica F1, OpenF1, and OpenLigaDB have no rate limits and cover many common use cases.

2. **Check status first.** Use `apisports_get_status`, `apifootball_get_status`, `apitennis_get_status`, or `odds_check_usage` before making a series of calls.

3. **Use broad queries.** Get fixtures for a full date range instead of checking day by day.

4. **Cache results.** If your AI assistant looks up the same standings or schedule multiple times in a conversation, the repeated calls count against your quota.

5. **Use the right provider for the job.** For Premier League standings, `footballdata_get_standings` (free, 10 req/min) is better than using `apifootball_get_standings` (100 req/day total across all endpoints).

6. **Sportmonks `include` parameter.** Use includes to get scores, events, lineups, and statistics in a single request instead of making 4 separate calls.
