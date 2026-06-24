# P0 Execution Plan — feat/p0-roadmap

Derived from the 2026-06-24 opportunities research (70 verified candidates). Executes only the **P0** items.

## Phase A — 5 new no-key providers (all live-verified 2026-06-24)
- [ ] `motogp_` — api.motogp.pulselive.com/motogp/v1 (no-key, unofficial). MotoGP/Moto2/Moto3/MotoE: seasons, categories, events, sessions, classification, standings, riders. (7 tools)
- [ ] `formulae_` — api.formula-e.pulselive.com/formula-e/v1 (no-key, unofficial). Championships, races, race detail/results, teams, driver/team standings. (7 tools)
- [ ] `nascar_` — cf.nascar.com (no-key, unofficial CDN). Schedule (race_list_basic), live feed, lap times. (3 tools)
- [ ] `sleeper_` — api.sleeper.app/v1 (no-key). NFL state, player search (24h-cached dump), trending, users, leagues, rosters, matchups, drafts. (10 tools)
- [ ] `opendota_` — api.opendota.com/api (no-key, 60/min). Pro matches, match detail, players, hero stats, teams, leagues, search. (11 tools)
- [ ] Register in index.ts; add `motorsport` preset (f1, openf1, motogp, formulae, nascar); add opendota to `esports`; add nascar+sleeper to `us-major`; new no-key providers join `free`.
- [ ] Build + smoke tests green.

## Phase B — MCP tool annotations + titles (P0)
- [ ] Central pass in index.ts (public API only: wrap `server.tool`, then `RegisteredTool.update`) applying `{readOnlyHint, idempotentHint, openWorldHint}` + a derived `title` to every tool. All 374 tools are read-only GETs.
- [ ] Guard defensively; add a test asserting annotations are applied on a real McpServer.
- Note: literal `registerTool()` API migration (for `outputSchema` + SDK v2) deferred to a future P1.

## Phase C — Distribution artifacts (files; external submission needs user)
- [ ] `.mcpb` manifest for Claude Desktop one-click install.
- [ ] GitHub Actions workflow to (re)publish to the MCP Registry via OIDC on release.
- [ ] Prepared `awesome-mcp-servers` entry text (PR is outward-facing → user confirms).

## Phase D — Docs
- [ ] Regenerate docs/ wiki (Providers/Tools-Reference/Home) for the 5 new providers.
- [ ] Update README.md + CLAUDE.md provider tables, counts, presets.

## Gate
- [x] `npm run build` clean, `npm test` green (152), server boots (default 17 / motorsport 5 / all 37), counts consistent across all docs.

## Outcome (executed on feat/p0-roadmap)
- 5 new no-key providers (+38 tools) → **37 providers / 374 tools**. All live-verified via `npm run test:e2e`.
- Central read-only annotations + titles on every tool (`src/shared/annotations.ts`), with a guard test.
- New `motorsport` preset; `opendota` added to `esports`; `nascar`+`sleeper` added to `us-major`; `free` now 17 providers / ~157 tools.
- `manifest.json` (MCPB, schema-validated) + `npm run bundle`; `.github/workflows/publish-registry.yml` (OIDC).

### Manual / outward-facing steps (need you — not done automatically)
1. **Build + publish the .mcpb**: `npm run bundle` → upload `sports-hub.mcpb` to a GitHub Release.
2. **awesome-mcp-servers PR** (prepared entry — submit under the "Sports" / "Other Tools and Integrations" section):
   `- [lacausecrypto/mcp-sports-hub](https://github.com/lacausecrypto/mcp-sports-hub) 📇 ☁️ - 37 sports APIs (scores, stats, odds, esports, F1/MotoGP/NASCAR, chess, AFL, NFL fantasy) in one MCP server; 17 work with no API key.`
3. **Directory listings**: Glama / PulseMCP / mcp.so auto-crawl from the repo — claim ownership where offered.
4. **VS Code MCP gallery** + **Cline Marketplace**: submit per each platform's process.

### Version sync at release (4 files — `/ship` must bump together)
`package.json`, `server.json` (×2: top + packages[].version), `manifest.json`. Recommend shipping as **1.3.0** (features). The registry-publish workflow requires the npm version to exist first.

---

## P1 — Outcome (also on this branch)
- 4 new providers (+22 tools) → **41 providers / 396 tools**:
  - `euroleague_` (6, no-key) — EuroLeague + EuroCup basketball
  - `footballdata_uk_` (2, no-key, CSV) — historical results + closing odds for backtesting
  - `boxing_` (8, `BOXING_DATA_API_KEY`) — pro boxing
  - `highlightly_` (6, `HIGHLIGHTLY_API_KEY`) — multi-sport video highlights + odds
  - No-key ones verified live; key ones build per docs and skip in e2e without a key.
- **MCP Resources** (`src/shared/resources.ts`): `sportshub://providers`, `sportshub://presets`, `sportshub://provider/{key}` (with completion). Catalog single-sourced in `src/shared/catalog.ts`.
- **MCP Prompts** (`src/shared/prompts.ts`): `whats-on-today`, `compare-odds`, `motorsport-weekend`, `league-standings`, `team-deep-dive`, `f1-race` (with arg completion).
- `free` preset now 19 / ~165 tools; `soccer` gains footballdatauk + highlightly; new `fetchText` helper for CSV. Guard test added (`mcp-features.test.mjs`).

### P1 manual / outward-facing steps (need you)
- **VS Code MCP gallery** and **Cline MCP Marketplace** submissions (per each platform's process) — same as the P0 directory items.
