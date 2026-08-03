# Changelog

All notable changes to this project are documented here. This project follows [semantic versioning](https://semver.org/).

## [Unreleased]

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
