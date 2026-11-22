/**
 * HTTP transport hardening (src/index.ts startHttp): gateway auth, fail-closed public bind, Host check,
 * initialize-only session creation, LRU eviction instead of 503.
 *
 * Run via: npm test
 */
import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const entry = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "dist", "index.js");
const TOKEN = "t".repeat(40);
const children = [];
after(() => { for (const child of children) child.kill("SIGTERM"); });

async function freePort() {
  const srv = createServer();
  await new Promise((resolve) => srv.listen(0, "127.0.0.1", resolve));
  const { port } = srv.address();
  await new Promise((resolve) => srv.close(resolve));
  return port;
}

async function start(env) {
  const port = await freePort();
  const child = spawn(process.execPath, [entry], {
    env: { ...process.env, SPORTS_HUB_HTTP: "1", SPORTS_HUB_PORT: String(port), SPORTS_HUB_PROVIDERS: "f1", ...env },
    stdio: ["ignore", "ignore", "pipe"],
  });
  children.push(child);
  let stderr = "";
  child.stderr.on("data", (d) => { stderr += d; });
  for (let i = 0; i < 100; i++) {
    if (stderr.includes("Sports Hub HTTP running")) return { base: `http://127.0.0.1:${port}`, child };
    if (child.exitCode !== null) return { exitCode: child.exitCode, stderr };
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error(`server did not start: ${stderr}`);
}

const INIT = { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "0" } } };
const post = (base, body, headers = {}) => fetch(`${base}/mcp`, {
  method: "POST",
  headers: { "content-type": "application/json", accept: "application/json, text/event-stream", ...headers },
  body: JSON.stringify(body),
});

describe("HTTP transport", () => {
  it("refuses to bind a public interface without a gateway token", async () => {
    const result = await start({ SPORTS_HUB_HOST: "0.0.0.0", SPORTS_HUB_GATEWAY_TOKEN: "", SPORTS_HUB_ALLOW_PUBLIC: "" });
    assert.equal(result.exitCode, 1);
    assert.match(result.stderr, /Refusing to listen/);
  });

  it("requires the bearer token when one is configured", async () => {
    const { base } = await start({ SPORTS_HUB_GATEWAY_TOKEN: TOKEN });
    assert.equal((await post(base, INIT)).status, 401);
    assert.equal((await post(base, INIT, { authorization: "Bearer wrong" })).status, 401);
    const ok = await post(base, INIT, { authorization: `Bearer ${TOKEN}` });
    assert.equal(ok.status, 200);
    assert.ok(ok.headers.get("mcp-session-id"));
  });

  it("rejects a foreign Host header (DNS rebinding) on every route", async () => {
    const { base } = await start({});
    // fetch() drops a custom Host header (forbidden header), so go through node:http.
    const { request } = await import("node:http");
    const status = await new Promise((resolve, reject) => {
      request(`${base}/health`, { headers: { host: "evil.example" } }, (res) => { res.resume(); resolve(res.statusCode); }).on("error", reject).end();
    });
    assert.equal(status, 403);
  });

  it("only an initialize request opens a session", async () => {
    const { base } = await start({});
    const response = await post(base, { jsonrpc: "2.0", id: 1, method: "tools/list" });
    assert.equal(response.status, 400);
  });

  it("evicts the least recently used session instead of answering 503", async () => {
    const { base } = await start({ SPORTS_HUB_MAX_SESSIONS: "2" });
    const ids = [];
    for (let i = 0; i < 3; i++) {
      const response = await post(base, INIT);
      assert.equal(response.status, 200, `initialize #${i + 1}`);
      ids.push(response.headers.get("mcp-session-id"));
    }
    const list = (id) => post(base, { jsonrpc: "2.0", id: 2, method: "tools/list" }, { "mcp-session-id": id, "mcp-protocol-version": "2025-06-18" });
    assert.equal((await list(ids[0])).status, 404, "oldest session evicted");
    assert.equal((await list(ids[2])).status, 200, "newest session alive");
  });
});
