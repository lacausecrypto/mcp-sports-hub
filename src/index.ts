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
//   Not set / empty    → load "free" preset (9 providers, ~98 tools)
//   "all"              → load ALL 29 providers (319 tools)
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
  if (!env) return PRESETS["free"]; // Default to free providers only
  if (env === "all") return Object.keys(PROVIDERS);

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
  const isAll = selected.length === Object.keys(PROVIDERS).length;

  const server = new McpServer({
    name: "sports-hub",
    version: "1.1.0",
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

  // Warn about tool bloat
  if (isAll) {
    console.error("");
    console.error("  ⚠ All 29 providers loaded (319 tools).");
    console.error("    LLMs work best with fewer tools. Consider using a preset:");
    console.error("    SPORTS_HUB_PROVIDERS=free       → 9 providers, ~98 tools (no keys needed)");
    console.error("    SPORTS_HUB_PROVIDERS=us-major   → 7 providers, ~79 tools");
    console.error("    SPORTS_HUB_PROVIDERS=soccer     → 6 providers, ~69 tools");
    console.error("");
  }

  // Transport: stdio (default) or HTTP (--http flag or SPORTS_HUB_HTTP=1)
  const useHttp = process.argv.includes("--http") || process.env.SPORTS_HUB_HTTP === "1";
  const port = parseInt(process.env.SPORTS_HUB_PORT ?? "3000", 10);

  if (useHttp) {
    const { createServer } = await import("node:http");
    const { StreamableHTTPServerTransport } = await import(
      "@modelcontextprotocol/sdk/server/streamableHttp.js"
    );
    const { randomUUID } = await import("node:crypto");

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
    });

    await server.connect(transport);

    const httpServer = createServer((req, res) => {
      // CORS headers
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, mcp-session-id, Accept");
      res.setHeader("Access-Control-Expose-Headers", "mcp-session-id");

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      // Route /mcp and / to the transport
      const path = req.url?.split("?")[0] ?? "/";
      if (path === "/mcp" || path === "/") {
        transport.handleRequest(req, res);
      } else if (path === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", providers: selected.length }));
      } else {
        res.writeHead(404);
        res.end("Not found. Use POST /mcp for MCP protocol.");
      }
    });

    httpServer.listen(port, () => {
      console.error(`Sports Hub HTTP running — ${selected.length} providers on http://localhost:${port}`);
      console.error(`  POST /mcp     → MCP protocol (Streamable HTTP)`);
      console.error(`  GET  /health  → Health check`);
    });
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`Sports Hub running — ${selected.length} providers loaded (stdio)`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
