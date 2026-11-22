# Changelog

All notable changes to this project are documented here. This project follows [semantic versioning](https://semver.org/).

## [2.0.0] — 2026-11-22

Audit fixes: valid and much smaller tool output, quota protection, and a hardened HTTP mode. Three breaking changes, listed below.

### Fixed
- **`espn_get_scoreboard` returned invalid JSON.** The size cap halved the list with the most *items*: ESPN nests hundreds of 2-item lists under a 6-item `events`, so the cap shrank those, missed the budget and fell back to a mid-object string cut (NBA/NHL: 40 KB that did not parse; NFL: one team dropped per game). The cap now halves the list that weighs the most in *bytes* (whole items go, kept items stay complete) and never cuts a string: an unshrinkable payload becomes a parseable stub naming its keys.
- **OpenF1 comparison filters never worked.** `date>=`, `speed<=`, `pit_duration<=`… were URL-encoded into the key (`date%3E%3D=`), which OpenF1 answers with 404 — then negatively cached. They are now sent raw (`date>=<encoded value>`).
- **`odds_*` (500 credits/month) bypassed cache, coalescing, `fields` and the size cap.** Metered calls are now cached (2 min live, 1 h sport list, 24 h historical) and coalesced; usage moves to a separate content block so the payload is projected and capped like any other.
- **One client could lock the HTTP server.** 200 `initialize` calls pinned ~1 GB and answered 503 to everyone for 30 min. Idle TTL is now 5 min, a full table evicts the least recently used session, and a gateway can cap sessions per client (`X-Sports-Hub-Client`, trusted only with a token). Non-`initialize` requests without a session are rejected before a server is built.
- **CricketData** errors could echo the API key back to the model; it is stripped before any serialization.
- User-supplied path segments are now encoded in OpenLigaDB, Jolpica F1, NHL, football-data.org, BallDontLie, EuroLeague and Entity Sport.

### Changed (breaking)
- **Node.js 20+ required.** HTTP mode already failed on Node 18 (the SDK's `@hono/node-server` needs Node ≥ 20); the new HTTP tests exposed it. CI now runs Node 20, 22 and 24.
- **Public bind is fail-closed.** On a non-loopback `SPORTS_HUB_HOST`, the server exits unless `SPORTS_HUB_GATEWAY_TOKEN` (≥ 32 chars, constant-time Bearer check) or `SPORTS_HUB_ALLOW_PUBLIC=1` is set. `smithery.yaml` sets the latter.
- **`openf1_get_car_data` requires `date_gte` and `date_lte`.** A whole session is several MB of telemetry.
- **`espn_get_scoreboard` is compact by default** (no highlights, headlines, leaders, team stats, odds, link sets, calendar): 145 KB → 17 KB for an NBA night, every game kept. `detail: "full"` restores the raw payload.
- A `429` without `Retry-After` (exhausted quota) is no longer retried.

### Security
- Transitive dependency advisories resolved (`body-parser` DoS, `@hono/node-server`, `fast-uri`); `npm audit` reports 0.

### Added
- Cache byte budget (`SPORTS_HUB_CACHE_MAX_BYTES`, 64 MB; entries over 2 MB are not cached) alongside the entry cap.
- Per-provider TTLs: finished F1 seasons 24 h (current 5 min), golf courses 24 h, boxing and MMA 6 h, SportsDataIO 1 h, Chess.com 10 min, Highlightly 10 min, API-Sports family and CricketData 5 min.
- Gateway auth (`SPORTS_HUB_GATEWAY_TOKEN`), ported from the private web origin.
- Host/Origin (DNS-rebinding) checks moved in front of every route, replacing the deprecated SDK transport options.
- `tools/list` drops the default `execution: {taskSupport: "forbidden"}` block from each tool.
- 16 tests: real ESPN fixture through the cap, compact scoreboard, metered caching, byte budget, quota 429, HTTP auth/fail-closed/Host/init-only/LRU eviction (208 total).

## [1.4.1] — 2026-10-14

### Security
- Resolved npm dependency advisories; `npm audit` now gates CI.

## [1.4.0] — 2026-10-14

Context cost and multi-client correctness. No provider or tool was added, removed or renamed.

### Fixed
- **HTTP mode served only one client.** A single `StreamableHTTPServerTransport` was shared by every request, so the second client to `initialize` got `400 Invalid Request: Server already initialized`. This affected the Smithery-hosted endpoint, which is HTTP by definition. Each client now gets its own session (or set `SPORTS_HUB_STATELESS=1` for a throwaway server per request).
- **Overlapping presets silently dropped providers.** `SPORTS_HUB_PROVIDERS="free,us-major"` tried to register `espn` twice; the second attempt threw `Tool espn_get_scoreboard is already registered` and the provider was skipped. The list is now deduped, and excludes are honoured alongside includes (`us-major,-cfbd`).
- **The cache ignored auth headers.** Two API keys hitting the same URL shared one cache entry, so in any process handling more than one key, one account could be served another's response. The key now includes a digest of the auth headers.

### Added
- **`fields` parameter on every tool.** Comma-separated key names to keep, matched at any depth. `espn_get_teams` for the NBA goes from 297 KB to 2.9 KB with `fields=id,abbreviation,displayName,location`. When nothing matches, the tool says so and lists the keys it did see.
- **Response size cap** (`SPORTS_HUB_MAX_RESULT_BYTES`, default 40 KB). Over the limit, the longest lists in the payload are shortened until it fits, so the result still parses, and a note reports how many items were dropped.
- **Empty-response hints.** A successful call whose lists are all empty (common out of season) now says so, instead of looking to the model like a working tool that returned nothing.
- **Retry with backoff** on `429`/`5xx`, honouring `Retry-After`. Client errors and timeouts are not retried.
- **In-flight coalescing.** Concurrent identical requests share one upstream call.
- **Negative caching** of `404`/`410` for 30s, so a wrong ID is not re-fetched in a loop.
- **Server instructions** describing `fields` once at connect time rather than on 396 tool schemas.
- 22 tests covering projection, slimming, capping, retries, coalescing and cache isolation (192 total).

### Changed
- Tool results are serialized compactly. The previous `JSON.stringify(data, null, 2)` spent 56% of the bytes on indentation no model reads.
- `tools/list` no longer emits the per-tool `$schema` boilerplate (~28 KB across 396 tools) or `maximum: 9007199254740991` artifacts from `z.number().int()`. Validation is unchanged: it still runs server-side against the original zod schema.

## [1.3.0] — 2026-06-24

Big release: **41 providers / 396 tools** (up from 32 / 336), new MCP capabilities, and a round of security/doc fixes.

### Added — 9 new providers
- **Motorsport** (no key): `motogp_` (MotoGP/Moto2/Moto3/MotoE), `formulae_` (Formula E), `nascar_` (Cup/Xfinity/Truck + live feed) — plus a new `motorsport` preset.
- **Esports / fantasy** (no key): `opendota_` (deep Dota 2 match/player/hero analytics), `sleeper_` (NFL fantasy — player search, injuries, depth charts, trending, leagues).
- **Basketball / archives** (no key): `euroleague_` (EuroLeague + EuroCup), `footballdata_uk_` (historical football results + closing bookmaker odds for backtesting).
- **API key required**: `boxing_` (Boxing Data API), `highlightly_` (multi-sport video highlights, odds, predictions).

### Added — MCP capabilities
- **Tool annotations**: every tool is now marked `readOnly` / `idempotent` / `openWorld` with a friendly title, so clients can skip confirmation prompts.
- **Resources**: readable catalogs — `sportshub://providers`, `sportshub://presets`, `sportshub://provider/{key}` (with key autocompletion).
- **Prompts**: 6 curated workflows — `whats-on-today`, `compare-odds`, `motorsport-weekend`, `league-standings`, `team-deep-dive`, `f1-race`.

### Added — distribution
- MCPB bundle (`manifest.json` + `npm run bundle`) for one-click Claude Desktop install.
- GitHub Actions workflow to republish to the MCP Registry via OIDC on each release.

### Fixed / changed
- Corrected provider/tool counts and the "default preset" description across README, CLAUDE.md, server.json, and the `docs/` wiki (the default is the `free` preset, now 19 providers / ~165 tools).
- `zod` widened to `^3.25 || ^4.0` (resolves to v4); `npm audit fix` → **0 vulnerabilities**.
- `sportsdata-io` now encodes path segments (`pathSegment()`); HTTP transport rejects a literal `*` CORS origin and warns when bound to a non-loopback host.
- New `fetchText` HTTP helper; provider catalog/presets centralized in `src/shared/catalog.ts`.

## [1.2.0] — 2025-05-07
- Added Lichess, Chess.com, and Squiggle (AFL) providers; security hardening and bug fixes.

## [1.1.0]
- Default `free` preset, in-memory cache, CI, `npx` support, HTTP/SSE transport.

[1.3.0]: https://github.com/lacausecrypto/mcp-sports-hub/releases/tag/v1.3.0
[1.2.0]: https://github.com/lacausecrypto/mcp-sports-hub/releases/tag/v1.2.0
