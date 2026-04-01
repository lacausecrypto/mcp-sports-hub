#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// ---------------------------------------------------------------------------
// Provider registry — maps provider name to its register function (lazy import)
// ---------------------------------------------------------------------------

const PROVIDERS: Record<string, () => Promise<{ register: (s: McpServer) => void }>> = {
  // No key required
  espn:           () => import("./providers/espn.js"),
  nhl:            () => import("./providers/nhl.js"),
  mlb:            () => import("./providers/mlb-stats.js"),
  f1:             () => import("./providers/jolpica-f1.js"),
  openf1:         () => import("./providers/openf1.js"),
  openliga:       () => import("./providers/openligadb.js"),
  golfcourse:     () => import("./providers/golfcourse.js"),
  sportsdb:       () => import("./providers/thesportsdb.js"),
  ncaa:           () => import("./providers/ncaa.js"),

  // Key required
  apisports:      () => import("./providers/api-sports.js"),
  apifootball:    () => import("./providers/api-football.js"),
  apitennis:      () => import("./providers/api-tennis.js"),
  bdl:            () => import("./providers/balldontlie.js"),
  cricket:        () => import("./providers/cricketdata.js"),
  entitycricket:  () => import("./providers/entity-sport-cricket.js"),
  footballdata:   () => import("./providers/football-data.js"),
  sportmonks:     () => import("./providers/sportmonks.js"),
  sportsdata:     () => import("./providers/sportsdata-io.js"),
  odds:           () => import("./providers/the-odds-api.js"),
  oddsio:         () => import("./providers/odds-api-io.js"),
  sgo:            () => import("./providers/sports-game-odds.js"),
  mma:            () => import("./providers/fighting-tomatoes.js"),
  livegolf:       () => import("./providers/live-golf.js"),
  isports:        () => import("./providers/isportsapi.js"),
  sportdevs:      () => import("./providers/sportdevs.js"),
  msf:            () => import("./providers/mysportsfeeds.js"),
  pandascore:     () => import("./providers/pandascore.js"),
  sportsrc:       () => import("./providers/sportsrc.js"),
  cfbd:           () => import("./providers/cfbd.js"),
};

// ---------------------------------------------------------------------------
// Provider filtering
// ---------------------------------------------------------------------------
// SPORTS_HUB_PROVIDERS controls which providers to load.
//
//   Not set / empty    → load ALL 29 providers (319 tools)
//   "espn,nhl,mlb"     → load only these 3 (36 tools)
//   "-odds,-oddsio"    → load all EXCEPT these (prefix with -)
//
// Presets for common use cases:
//   "us-major"         → espn,nhl,mlb,ncaa,cfbd,bdl,msf
//   "soccer"           → espn,apifootball,footballdata,sportmonks,openliga,sportsrc
//   "f1"               → f1,openf1
//   "esports"          → pandascore
//   "odds"             → odds,oddsio,sgo
//   "free"             → espn,nhl,mlb,f1,openf1,openliga,golfcourse,sportsdb,ncaa
// ---------------------------------------------------------------------------

const PRESETS: Record<string, string[]> = {
  "us-major":  ["espn", "nhl", "mlb", "ncaa", "cfbd", "bdl", "msf"],
  "soccer":    ["espn", "apifootball", "footballdata", "sportmonks", "openliga", "sportsrc"],
  "f1":        ["f1", "openf1"],
  "esports":   ["pandascore"],
  "odds":      ["odds", "oddsio", "sgo"],
  "cricket":   ["cricket", "entitycricket"],
  "golf":      ["livegolf", "golfcourse"],
  "free":      ["espn", "nhl", "mlb", "f1", "openf1", "openliga", "golfcourse", "sportsdb", "ncaa"],
};

function resolveProviders(): string[] {
  const env = process.env.SPORTS_HUB_PROVIDERS?.trim();
  if (!env) return Object.keys(PROVIDERS);

  // Check for preset
  if (PRESETS[env]) return PRESETS[env];

  const parts = env.split(",").map((s) => s.trim()).filter(Boolean);
  const excludes = parts.filter((p) => p.startsWith("-")).map((p) => p.slice(1));
  const includes = parts.filter((p) => !p.startsWith("-"));

  // If we have includes, use only those. If we have excludes, remove from all.
  if (includes.length > 0) {
    // Resolve: provider names take priority over preset names.
    // Only expand as preset if the name is NOT a direct provider.
    const resolved: string[] = [];
    for (const p of includes) {
      if (PROVIDERS[p]) resolved.push(p);
      else if (PRESETS[p]) resolved.push(...PRESETS[p]);
      else resolved.push(p); // will be filtered out below
    }
    return resolved.filter((p) => PROVIDERS[p]);
  }

  return Object.keys(PROVIDERS).filter((p) => !excludes.includes(p));
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

async function main() {
  const selected = resolveProviders();

  const server = new McpServer({
    name: "sports-hub",
    version: "1.0.0",
  });

  // Load and register selected providers
  for (const name of selected) {
    const loader = PROVIDERS[name];
    if (!loader) {
      console.error(`Unknown provider: ${name} (skipping)`);
      continue;
    }
    try {
      const mod = await loader();
      mod.register(server);
      console.error(`  ✓ ${name}`);
    } catch (err) {
      console.error(`  ✗ ${name}: ${err instanceof Error ? err.message : err}`);
    }
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Sports Hub running — ${selected.length} providers loaded`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
