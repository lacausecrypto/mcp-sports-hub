# Changelog

All notable changes to this project are documented here. This project follows [semantic versioning](https://semver.org/).

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
