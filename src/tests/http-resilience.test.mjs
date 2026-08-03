/**
 * Tests for the HTTP layer's resilience behaviour (src/shared/http.ts):
 * retry with backoff, in-flight coalescing, negative caching, and cache
 * isolation between API keys.
 *
 * Everything runs against a local server so the assertions are about the
 * number of upstream requests, which is the whole point of these features.
 *
 * Run via: npm test
 */

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Read at import time by http.js, so it must be set before the dynamic import.
process.env.SPORTS_HUB_RETRY_BASE_MS = "10";
process.env.SPORTS_HUB_CACHE_TTL = "60";
process.env.SPORTS_HUB_NEGATIVE_CACHE_TTL = "30";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { fetchJson, HttpError } = await import(
  join(__dirname, "..", "..", "dist", "shared", "http.js")
);

let server;
let base;
/** Upstream hits per path, so a test can assert "one request, not five". */
const hits = new Map();
/** Per-path scripted behaviour. */
const routes = new Map();

function count(path) {
  return hits.get(path) ?? 0;
}

before(async () => {
  server = createServer((req, res) => {
    const path = req.url.split("?")[0];
    hits.set(path, count(path) + 1);
    const route = routes.get(path);
    if (route) return route(req, res, count(path));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ path, key: req.headers["x-api-key"] ?? null }));
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server?.close());

describe("retry", () => {
  it("retries a 429 and succeeds", async () => {
    routes.set("/flaky", (req, res, n) => {
      if (n < 3) {
        res.writeHead(429, { "retry-after": "0" });
        res.end("slow down");
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    });
    const data = await fetchJson(`${base}/flaky`, { cacheTtl: 0 });
    assert.deepEqual(data, { ok: true });
    assert.equal(count("/flaky"), 3, "should have taken two retries");
  });

  it("gives up after the retry budget and reports the status", async () => {
    routes.set("/always-429", (req, res) => {
      res.writeHead(429);
      res.end("nope");
    });
    await assert.rejects(
      () => fetchJson(`${base}/always-429`, { cacheTtl: 0 }),
      (err) => err instanceof HttpError && err.status === 429,
    );
    assert.equal(count("/always-429"), 3, "1 attempt + 2 retries");
  });

  it("does not retry a 400", async () => {
    routes.set("/bad-request", (req, res) => {
      res.writeHead(400);
      res.end("bad");
    });
    await assert.rejects(() => fetchJson(`${base}/bad-request`, { cacheTtl: 0 }));
    assert.equal(count("/bad-request"), 1, "client errors must not be retried");
  });
});

describe("coalescing", () => {
  it("collapses concurrent identical requests into one upstream call", async () => {
    routes.set("/slow", (req, res) => {
      setTimeout(() => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      }, 80);
    });
    const results = await Promise.all(
      Array.from({ length: 8 }, () => fetchJson(`${base}/slow`, { cacheTtl: 0 })),
    );
    assert.equal(results.length, 8);
    for (const r of results) assert.deepEqual(r, { ok: true });
    assert.equal(count("/slow"), 1, "8 concurrent callers, 1 upstream request");
  });
});

describe("negative caching", () => {
  it("remembers a 404 instead of re-asking", async () => {
    routes.set("/missing", (req, res) => {
      res.writeHead(404);
      res.end("no such id");
    });
    for (let i = 0; i < 4; i++) {
      await assert.rejects(() => fetchJson(`${base}/missing`, { cacheTtl: 0 }));
    }
    assert.equal(count("/missing"), 1, "a known-missing id must not be re-fetched");
  });
});

describe("cache isolation", () => {
  it("does not serve one API key's response to another", async () => {
    const url = `${base}/keyed`;
    const a = await fetchJson(url, { headers: { "x-api-key": "key-a" } });
    const b = await fetchJson(url, { headers: { "x-api-key": "key-b" } });
    assert.equal(a.key, "key-a");
    assert.equal(b.key, "key-b", "different key must not read the other's cache entry");
    assert.equal(count("/keyed"), 2);

    // Same key still hits the cache.
    const again = await fetchJson(url, { headers: { "x-api-key": "key-a" } });
    assert.equal(again.key, "key-a");
    assert.equal(count("/keyed"), 2, "repeat with the same key should be cached");
  });
});
