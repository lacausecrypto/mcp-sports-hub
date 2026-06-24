#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { VERSION } from "./shared/version.js";
import { captureToolAnnotations } from "./shared/annotations.js";
import { PRESETS } from "./shared/catalog.js";
import { registerResources } from "./shared/resources.js";
import { registerPrompts } from "./shared/prompts.js";

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
  lichess:        () => import("./providers/lichess.js"),
  chesscom:       () => import("./providers/chess-com.js"),
  squiggle:       () => import("./providers/squiggle.js"),
  motogp:         () => import("./providers/motogp.js"),
  formulae:       () => import("./providers/formula-e.js"),
  nascar:         () => import("./providers/nascar.js"),
  opendota:       () => import("./providers/opendota.js"),
  sleeper:        () => import("./providers/sleeper.js"),
  euroleague:     () => import("./providers/euroleague.js"),
  footballdatauk: () => import("./providers/football-data-uk.js"),

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
  boxing:         () => import("./providers/boxing.js"),
  highlightly:    () => import("./providers/highlightly.js"),
};

// ---------------------------------------------------------------------------
// Provider filtering
// ---------------------------------------------------------------------------
// SPORTS_HUB_PROVIDERS controls which providers to load.
//
//   Not set / empty    → load "free" preset (19 providers, ~165 tools)
//   "all"              → load ALL 41 providers (396 tools)
//   "espn,nhl,mlb"     → load only these 3 (36 tools)
//   "-odds,-oddsio"    → load all EXCEPT these (prefix with -)
//
// Presets (defined in shared/catalog.ts):
//   "us-major", "soccer", "f1", "motorsport", "esports", "odds", "cricket",
//   "golf", "chess", and "free" (all 19 no-key providers — the default).
// ---------------------------------------------------------------------------

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
    version: VERSION,
  });

  // Capture tool registrations so we can apply uniform read-only annotations
  // + titles after all providers have registered (see shared/annotations.ts).
  const applyAnnotations = captureToolAnnotations(server);

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

  // All tools are read-only GETs — annotate them (readOnly/idempotent/openWorld)
  // and give each a friendly title, in one place, using public SDK APIs.
  applyAnnotations();

  // Expose static catalogs as MCP resources and curated workflows as prompts.
  registerResources(server);
  registerPrompts(server);

  // Warn about tool bloat
  if (isAll) {
    console.error("");
    console.error(`  ⚠ All ${Object.keys(PROVIDERS).length} providers loaded (396 tools).`);
    console.error("    LLMs work best with fewer tools. Consider using a preset:");
    console.error("    SPORTS_HUB_PROVIDERS=free        → 19 providers, ~165 tools (no keys needed)");
    console.error("    SPORTS_HUB_PROVIDERS=us-major    → 9 providers, ~93 tools");
    console.error("    SPORTS_HUB_PROVIDERS=motorsport  → 5 providers, ~42 tools (no keys needed)");
    console.error("    SPORTS_HUB_PROVIDERS=soccer      → 8 providers, ~73 tools");
    console.error("");
  }

  // Transport: stdio (default) or HTTP (--http flag or SPORTS_HUB_HTTP=1)
  const useHttp = process.argv.includes("--http") || process.env.SPORTS_HUB_HTTP === "1";

  const portRaw = process.env.SPORTS_HUB_PORT ?? "3000";
  const port = Number.parseInt(portRaw, 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error(`Invalid SPORTS_HUB_PORT: ${portRaw}. Must be 1-65535.`);
    process.exit(1);
  }

  if (useHttp) {
    // Bind to loopback by default. Set SPORTS_HUB_HOST=0.0.0.0 to expose
    // on the network — only do this if you understand the implications
    // (see SPORTS_HUB_ALLOWED_HOSTS / SPORTS_HUB_ALLOWED_ORIGINS below).
    const host = process.env.SPORTS_HUB_HOST ?? "127.0.0.1";

    // DNS-rebinding protection. Allowed hosts are matched against the Host
    // header; allowed origins against the Origin header. The MCP spec
    // recommends enabling this for local HTTP servers because a malicious
    // page can otherwise fool a browser into hitting localhost on the
    // user's machine.
    const allowedHosts = (process.env.SPORTS_HUB_ALLOWED_HOSTS
      ?? `127.0.0.1,127.0.0.1:${port},localhost,localhost:${port}`)
      .split(",").map((s) => s.trim()).filter(Boolean);
    const allowedOriginsEnv = process.env.SPORTS_HUB_ALLOWED_ORIGINS;
    const allowedOrigins = allowedOriginsEnv
      ? allowedOriginsEnv.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined;

    const { createServer } = await import("node:http");
    const { StreamableHTTPServerTransport } = await import(
      "@modelcontextprotocol/sdk/server/streamableHttp.js"
    );
    const { randomUUID } = await import("node:crypto");

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      enableDnsRebindingProtection: true,
      allowedHosts,
      ...(allowedOrigins ? { allowedOrigins } : {}),
    });

    await server.connect(transport);

    // CORS allowlist. Defaults to "no CORS" — only set
    // SPORTS_HUB_CORS_ORIGINS if you actually need browser clients.
    let corsOrigins = (process.env.SPORTS_HUB_CORS_ORIGINS ?? "")
      .split(",").map((s) => s.trim()).filter(Boolean);
    if (corsOrigins.includes("*")) {
      console.error(
        "  ⚠ SPORTS_HUB_CORS_ORIGINS includes '*'. Wildcard CORS is not supported — " +
        "list explicit origins (e.g. https://example.com). The '*' entry is ignored."
      );
      corsOrigins = corsOrigins.filter((o) => o !== "*");
    }

    const httpServer = createServer((req, res) => {
      const origin = req.headers.origin;
      if (corsOrigins.length > 0 && origin && corsOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, mcp-session-id, Accept");
        res.setHeader("Access-Control-Expose-Headers", "mcp-session-id");
      }

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

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

    httpServer.listen(port, host, () => {
      const exposedNote = host === "0.0.0.0" || host === "::"
        ? " ⚠ exposed on all interfaces"
        : "";
      console.error(`Sports Hub HTTP running — ${selected.length} providers on http://${host}:${port}${exposedNote}`);
      console.error(`  POST /mcp     → MCP protocol (Streamable HTTP)`);
      console.error(`  GET  /health  → Health check`);
      console.error(`  Allowed hosts:   ${allowedHosts.join(", ")}`);
      if (allowedOrigins) console.error(`  Allowed origins: ${allowedOrigins.join(", ")}`);
      if (corsOrigins.length > 0) console.error(`  CORS origins:    ${corsOrigins.join(", ")}`);
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
