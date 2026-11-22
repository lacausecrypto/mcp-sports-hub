#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { VERSION } from "./shared/version.js";
import { captureToolAnnotations } from "./shared/annotations.js";
import { installToolPipeline } from "./shared/tool-pipeline.js";
import { installSchemaSlimming } from "./shared/slim.js";
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
  lumify:         () => import("./providers/lumify.js"),
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
//   "us-major,-cfbd"   → a preset minus some of its members
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
  const excludes = new Set(
    parts.filter((p) => p.startsWith("-")).map((p) => p.slice(1)),
  );
  const includes = parts.filter((p) => !p.startsWith("-"));

  if (includes.length > 0) {
    // Resolve: provider names take priority over preset names.
    // Only expand as preset if the name is NOT a direct provider.
    const resolved: string[] = [];
    for (const p of includes) {
      if (PROVIDERS[p]) resolved.push(p);
      else if (PRESETS[p]) resolved.push(...PRESETS[p]);
      else resolved.push(p); // will be filtered out below
    }
    // Dedupe: overlapping presets ("free,us-major") would otherwise register
    // the same provider twice, and the second registration throws — silently
    // dropping a provider the user explicitly asked for.
    // Excludes are honoured alongside includes so "us-major,-cfbd" works.
    return [...new Set(resolved)].filter((p) => PROVIDERS[p] && !excludes.has(p));
  }

  return Object.keys(PROVIDERS).filter((p) => !excludes.has(p));
}

// ---------------------------------------------------------------------------
// Server construction
// ---------------------------------------------------------------------------

/**
 * Build a fully-registered server instance.
 *
 * This is a factory rather than a singleton because the Streamable HTTP
 * transport binds one server to one session: a shared instance can only ever
 * serve the client that connected first (the second gets
 * "Server already initialized"). Provider modules are cached by the ES module
 * loader, so only the per-session registration work is repeated.
 */
/**
 * Said once, at connect time, instead of on all ~400 tool schemas where the
 * same text would cost ~400x as much context.
 */
const INSTRUCTIONS = [
  "Every tool accepts an optional `fields` parameter: a comma-separated list of key",
  "names to keep, matched at any depth (e.g. `id,displayName,abbreviation`).",
  "",
  "Use it. These sports APIs return very wide objects — a single ESPN team list is",
  "~300 KB, of which the useful part is under 3 KB. Responses over the size cap are",
  "truncated and say so; `fields` is how you avoid that.",
  "",
  "All tools are read-only GETs. A successful response with empty lists usually means",
  "the season/date/league has no data, not that the call was wrong.",
].join("\n");

async function buildServer(selected: string[], verbose: boolean): Promise<McpServer> {
  const server = new McpServer(
    { name: "sports-hub", version: VERSION },
    { instructions: INSTRUCTIONS },
  );

  // Capture tool registrations so we can apply uniform read-only annotations
  // + titles after all providers have registered (see shared/annotations.ts),
  // and route every response through the shaping pipeline (fields projection,
  // size cap, empty-result hints).
  const applyAnnotations = captureToolAnnotations(server);
  const restorePipeline = installToolPipeline(server);

  for (const name of selected) {
    const loader = PROVIDERS[name];
    if (!loader) {
      console.error(`Unknown provider: ${name} (skipping)`);
      continue;
    }
    try {
      const mod = await loader();
      mod.register(server);
      if (verbose) console.error(`  ✓ ${name}`);
    } catch (err) {
      console.error(`  ✗ ${name}: ${err instanceof Error ? err.message : err}`);
    }
  }

  restorePipeline();
  // All tools are read-only GETs — annotate them (readOnly/idempotent/openWorld)
  // and give each a friendly title, in one place, using public SDK APIs.
  applyAnnotations();

  // Expose static catalogs as MCP resources and curated workflows as prompts.
  registerResources(server);
  registerPrompts(server);

  // Drop the ~28 KB of per-tool "$schema" boilerplate from tools/list.
  installSchemaSlimming(server);

  return server;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const selected = resolveProviders();
  const isAll = selected.length === Object.keys(PROVIDERS).length;

  // Transport: stdio (default) or HTTP (--http flag or SPORTS_HUB_HTTP=1)
  const useHttp = process.argv.includes("--http") || process.env.SPORTS_HUB_HTTP === "1";

  const portRaw = process.env.SPORTS_HUB_PORT ?? "3000";
  const port = Number.parseInt(portRaw, 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error(`Invalid SPORTS_HUB_PORT: ${portRaw}. Must be 1-65535.`);
    process.exit(1);
  }

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

  if (useHttp) {
    await startHttp(selected, port);
  } else {
    const server = await buildServer(selected, true);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`Sports Hub running — ${selected.length} providers loaded (stdio)`);
  }
}

async function startHttp(selected: string[], port: number): Promise<void> {
  // Bind to loopback by default. Set SPORTS_HUB_HOST=0.0.0.0 to expose
  // on the network — only do this if you understand the implications
  // (see SPORTS_HUB_ALLOWED_HOSTS / SPORTS_HUB_ALLOWED_ORIGINS below).
  const host = process.env.SPORTS_HUB_HOST ?? "127.0.0.1";
  const loopback = host === "127.0.0.1" || host === "::1" || host === "localhost";

  // Gateway auth. When set, every request must carry `Authorization: Bearer <token>` (compared in constant time).
  // Exposing the server beyond loopback without it is refused at startup: a forgotten variable must not turn a
  // private origin public in silence. A deliberately public keyless endpoint (Smithery) says so explicitly.
  const gatewayToken = process.env.SPORTS_HUB_GATEWAY_TOKEN?.trim() || undefined;
  if (gatewayToken !== undefined && gatewayToken.length < 32) {
    console.error("SPORTS_HUB_GATEWAY_TOKEN must contain at least 32 characters.");
    process.exit(1);
  }
  if (!loopback && gatewayToken === undefined && process.env.SPORTS_HUB_ALLOW_PUBLIC !== "1") {
    console.error(
      `Refusing to listen on ${host} without SPORTS_HUB_GATEWAY_TOKEN. Set a token (≥ 32 chars), ` +
        "or SPORTS_HUB_ALLOW_PUBLIC=1 for an intentionally public endpoint.",
    );
    process.exit(1);
  }

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
  const { randomUUID, timingSafeEqual } = await import("node:crypto");
  const { isInitializeRequest } = await import("@modelcontextprotocol/sdk/types.js");

  function authorized(header: string | undefined): boolean {
    if (gatewayToken === undefined) return true;
    const expected = Buffer.from(`Bearer ${gatewayToken}`);
    const received = Buffer.from(header ?? "");
    return expected.length === received.length && timingSafeEqual(expected, received);
  }

  // DNS-rebinding protection is ON by default — correct for a local HTTP
  // server a browser could reach on localhost. Behind a managed host (e.g.
  // Smithery) the proxied Host header is not localhost, so the check would
  // reject every request; set SPORTS_HUB_DNS_REBINDING_PROTECTION=0 there.
  const dnsRebindingProtection =
    process.env.SPORTS_HUB_DNS_REBINDING_PROTECTION !== "0";

  // Stateless mode builds a throwaway server per request. Costlier per call,
  // but it lets several replicas sit behind one load balancer with no sticky
  // routing. Session mode (default) pays the build cost once per client.
  const stateless = process.env.SPORTS_HUB_STATELESS === "1";
  // Each session holds a full McpServer (~4 MB with the free preset). Idle sessions go after 5 min, and a full
  // table evicts the least recently used one instead of answering 503 to everyone: one client opening sessions
  // in a loop can no longer lock the server.
  const maxSessions = clampEnvInt(process.env.SPORTS_HUB_MAX_SESSIONS, 200, 1, 100_000);
  const sessionTtlMs =
    clampEnvInt(process.env.SPORTS_HUB_SESSION_TTL, 300, 1, 86_400) * 1000;
  // Behind an authenticated gateway, the gateway names the end client (e.g. a hash of its IP) so one client
  // cannot hold more than its share. Unauthenticated, the header is spoofable and ignored.
  const maxSessionsPerClient = clampEnvInt(process.env.SPORTS_HUB_MAX_SESSIONS_PER_CLIENT, 8, 1, 100_000);
  const MAX_INIT_BODY_BYTES = 1_048_576;

  type Session = {
    transport: InstanceType<typeof StreamableHTTPServerTransport>;
    server: McpServer;
    lastSeen: number;
    client: string | null;
  };
  const sessions = new Map<string, Session>();

  function closeSession(id: string): void {
    const session = sessions.get(id);
    if (!session) return;
    sessions.delete(id);
    void session.transport.close().catch(() => {});
    void session.server.close().catch(() => {});
  }

  /** Evict the least recently seen session, among `client`'s own when given. */
  function evictOldest(client: string | null = null): void {
    let oldest: [string, number] | null = null;
    for (const [id, session] of sessions) {
      if (client !== null && session.client !== client) continue;
      if (!oldest || session.lastSeen < oldest[1]) oldest = [id, session.lastSeen];
    }
    if (oldest) closeSession(oldest[0]);
  }

  function clientOf(req: import("node:http").IncomingMessage): string | null {
    if (gatewayToken === undefined) return null;
    const value = req.headers["x-sports-hub-client"];
    const id = Array.isArray(value) ? value[0] : value;
    return id && /^[A-Za-z0-9_-]{8,128}$/.test(id) ? id : null;
  }

  async function readJsonBody(req: import("node:http").IncomingMessage): Promise<unknown> {
    const chunks: Buffer[] = [];
    let total = 0;
    for await (const chunk of req) {
      total += (chunk as Buffer).length;
      if (total > MAX_INIT_BODY_BYTES) throw new RangeError("Request body too large");
      chunks.push(chunk as Buffer);
    }
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  }

  // Host/Origin checks run here, before any route (the SDK transport options for this are deprecated, and only
  // ever covered /mcp). Same semantics: Host must be listed; Origin, when present and a list is set, too.
  function rebindingError(req: import("node:http").IncomingMessage): string | null {
    if (!dnsRebindingProtection) return null;
    const hostHeader = req.headers.host;
    if (!hostHeader || !allowedHosts.includes(hostHeader)) return `Invalid Host header: ${hostHeader ?? "(none)"}`;
    const originHeader = req.headers.origin;
    if (allowedOrigins && originHeader && !allowedOrigins.includes(originHeader)) return `Invalid Origin header: ${originHeader}`;
    return null;
  }

  // Reap idle sessions so a long-lived server doesn't accumulate one McpServer
  // per client that ever connected. unref() keeps the timer from holding the
  // process open on its own.
  const sweeper = setInterval(() => {
    const cutoff = Date.now() - sessionTtlMs;
    for (const [id, session] of sessions) {
      if (session.lastSeen < cutoff) closeSession(id);
    }
  }, Math.min(60_000, sessionTtlMs));
  sweeper.unref();

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

  function jsonError(res: import("node:http").ServerResponse, status: number, message: string) {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32000, message }, id: null }));
  }

  const httpServer = createServer((req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
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

    const rebinding = rebindingError(req);
    if (rebinding) {
      jsonError(res, 403, rebinding);
      return;
    }

    if (!authorized(req.headers.authorization)) {
      jsonError(res, 401, "Unauthorized");
      return;
    }

    if (path === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        status: "ok",
        providers: selected.length,
        sessions: sessions.size,
        mode: stateless ? "stateless" : "session",
      }));
      return;
    }

    if (path !== "/mcp" && path !== "/") {
      res.writeHead(404);
      res.end("Not found. Use POST /mcp for MCP protocol.");
      return;
    }

    void handleMcp(req, res).catch((err) => {
      console.error("MCP request failed:", err);
      if (!res.headersSent) jsonError(res, 500, "Internal server error");
      else res.end();
    });
  });

  async function handleMcp(
    req: import("node:http").IncomingMessage,
    res: import("node:http").ServerResponse,
  ): Promise<void> {
    if (stateless) {
      // One server + one transport per request: the SDK refuses to reuse a
      // stateless transport, since message ids would collide across clients.
      const server = await buildServer(selected, false);
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      res.on("close", () => {
        void transport.close().catch(() => {});
        void server.close().catch(() => {});
      });
      await server.connect(transport);
      await transport.handleRequest(req, res);
      return;
    }

    const headerId = req.headers["mcp-session-id"];
    const sessionId = Array.isArray(headerId) ? headerId[0] : headerId;

    if (sessionId) {
      const session = sessions.get(sessionId);
      if (!session) {
        jsonError(res, 404, "Unknown or expired session. Re-initialize to get a new session id.");
        return;
      }
      session.lastSeen = Date.now();
      await session.transport.handleRequest(req, res);
      return;
    }

    // No session id: this must be an initialize request. Check that before paying for a server build
    // (~17 ms and a few MB per call).
    if (req.method !== "POST") {
      jsonError(res, 400, "Missing mcp-session-id. Initialize first with POST /mcp.");
      return;
    }
    let body: unknown;
    try {
      body = await readJsonBody(req);
    } catch (error) {
      jsonError(res, error instanceof RangeError ? 413 : 400, error instanceof RangeError ? error.message : "Invalid JSON body");
      return;
    }
    if (!isInitializeRequest(body)) {
      jsonError(res, 400, "Missing mcp-session-id. Only an initialize request may open a session.");
      return;
    }

    const client = clientOf(req);
    if (client !== null) {
      let owned = 0;
      for (const session of sessions.values()) if (session.client === client) owned++;
      if (owned >= maxSessionsPerClient) evictOldest(client);
    }
    if (sessions.size >= maxSessions) evictOldest();

    const server = await buildServer(selected, false);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (id: string) => {
        sessions.set(id, { transport, server, lastSeen: Date.now(), client });
      },
    });
    transport.onclose = () => {
      const id = transport.sessionId;
      if (id) sessions.delete(id);
      void server.close().catch(() => {});
    };

    await server.connect(transport);
    await transport.handleRequest(req, res, body);

    // A request that never completed initialization leaves nothing registered;
    // release its server rather than leaking one per malformed call.
    if (!transport.sessionId) {
      void transport.close().catch(() => {});
      void server.close().catch(() => {});
    }
  }

  httpServer.listen(port, host, () => {
    const exposedNote = host === "0.0.0.0" || host === "::"
      ? " ⚠ exposed on all interfaces"
      : "";
    console.error(`Sports Hub HTTP running — ${selected.length} providers on http://${host}:${port}${exposedNote}`);
    console.error(`  POST /mcp     → MCP protocol (Streamable HTTP, ${stateless ? "stateless" : "multi-session"})`);
    console.error(`  GET  /health  → Health check`);
    console.error(gatewayToken ? "  Gateway auth:    Bearer token required" : `  Gateway auth:    none${loopback ? " (loopback only)" : " — PUBLIC (SPORTS_HUB_ALLOW_PUBLIC=1)"}`);
    if (dnsRebindingProtection) {
      console.error(`  Allowed hosts:   ${allowedHosts.join(", ")}`);
      if (allowedOrigins) console.error(`  Allowed origins: ${allowedOrigins.join(", ")}`);
    } else {
      console.error(`  ⚠ DNS-rebinding protection DISABLED (SPORTS_HUB_DNS_REBINDING_PROTECTION=0)`);
    }
    if (corsOrigins.length > 0) console.error(`  CORS origins:    ${corsOrigins.join(", ")}`);
  });
}

function clampEnvInt(raw: string | undefined, fallback: number, min: number, max: number): number {
  if (raw === undefined) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isInteger(n) || n < min || n > max) return fallback;
  return n;
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
