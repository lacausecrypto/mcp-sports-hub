/**
 * Shared HTTP utilities for all providers.
 */

import { createHash } from "node:crypto";
import { USER_AGENT } from "./version.js";

export interface HttpOptions {
  headers?: Record<string, string>;
  method?: "GET" | "POST";
  /** Cache TTL in seconds. 0 = no cache (default for non-GET). */
  cacheTtl?: number;
  /** Per-request timeout in ms. Defaults to 15_000. */
  timeoutMs?: number;
}

export interface FetchJsonResult {
  data: unknown;
  headers: Headers;
  status: number;
  /** True when served from the in-memory cache (headers are those of the original response). */
  cached: boolean;
}

// ---------------------------------------------------------------------------
// In-memory cache (TTL + LRU hard cap)
// ---------------------------------------------------------------------------

interface CacheEntry {
  data: unknown;
  expiresAt: number;
  bytes: number;
}

interface NegativeEntry {
  message: string;
  expiresAt: number;
}

const DEFAULT_CACHE_TTL = clampInt(process.env.SPORTS_HUB_CACHE_TTL, 60, 0, 86_400);
const MAX_CACHE_ENTRIES = clampInt(process.env.SPORTS_HUB_CACHE_MAX, 500, 1, 100_000);
/** Total size budget of the cache (serialized bytes). Entry count alone let a few multi-MB payloads eat the heap. */
const MAX_CACHE_BYTES = clampInt(process.env.SPORTS_HUB_CACHE_MAX_BYTES, 64 * 1024 * 1024, 1024, 2 ** 31 - 1);
/** Payloads above this are never cached: one telemetry dump must not evict hundreds of small entries. */
const MAX_CACHE_ENTRY_BYTES = Math.min(2 * 1024 * 1024, MAX_CACHE_BYTES);
const DEFAULT_TIMEOUT_MS = clampInt(process.env.SPORTS_HUB_HTTP_TIMEOUT_MS, 15_000, 1_000, 600_000);
/** How long a 404/410 is remembered, so a wrong ID doesn't re-hit upstream in a loop. */
const NEGATIVE_CACHE_TTL = clampInt(process.env.SPORTS_HUB_NEGATIVE_CACHE_TTL, 30, 0, 3_600);
/** Extra attempts after the first on 429/5xx. 0 disables retrying. */
const MAX_RETRIES = clampInt(process.env.SPORTS_HUB_MAX_RETRIES, 2, 0, 5);
const RETRY_BASE_MS = clampInt(process.env.SPORTS_HUB_RETRY_BASE_MS, 300, 10, 10_000);
/** Longest Retry-After we are willing to sit on before giving up. */
const MAX_RETRY_AFTER_MS = 10_000;

/** Serialized tool payloads larger than this are truncated before reaching the model. */
export const MAX_RESULT_BYTES = clampInt(
  process.env.SPORTS_HUB_MAX_RESULT_BYTES,
  40_000,
  1_000,
  10_000_000,
);

// Map preserves insertion order — re-inserting on read gives us LRU semantics.
const cache = new Map<string, CacheEntry>();
let cacheBytes = 0;
const negativeCache = new Map<string, NegativeEntry>();
/** Requests currently in flight, keyed like the cache: collapses duplicate concurrent calls. */
const inFlight = new Map<string, Promise<unknown>>();

function clampInt(raw: string | undefined, fallback: number, min: number, max: number): number {
  if (raw === undefined) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isInteger(n) || n < min || n > max) return fallback;
  return n;
}

function getCached(key: string): unknown | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    dropCached(key);
    return undefined;
  }
  // Refresh insertion order so it's the most-recently-used.
  cache.delete(key);
  cache.set(key, entry);
  return entry.data;
}

function dropCached(key: string): void {
  const entry = cache.get(key);
  if (!entry) return;
  cacheBytes -= entry.bytes;
  cache.delete(key);
}

function sizeOf(data: unknown): number {
  if (typeof data === "string") return data.length;
  try {
    return (JSON.stringify(data) ?? "").length;
  } catch {
    return Number.POSITIVE_INFINITY; // Unserializable: never cache it.
  }
}

function setCache(key: string, data: unknown, ttl: number): void {
  const bytes = sizeOf(data);
  dropCached(key);
  if (bytes > MAX_CACHE_ENTRY_BYTES) return;
  cache.set(key, { data, expiresAt: Date.now() + ttl * 1000, bytes });
  cacheBytes += bytes;
  // Hard caps: drop least-recently-used entries until both count and bytes fit.
  while (cache.size > MAX_CACHE_ENTRIES || cacheBytes > MAX_CACHE_BYTES) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    dropCached(oldest);
  }
}

function getNegative(key: string): string | undefined {
  const entry = negativeCache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    negativeCache.delete(key);
    return undefined;
  }
  return entry.message;
}

function setNegative(key: string, message: string): void {
  if (NEGATIVE_CACHE_TTL <= 0) return;
  negativeCache.set(key, { message, expiresAt: Date.now() + NEGATIVE_CACHE_TTL * 1000 });
  while (negativeCache.size > MAX_CACHE_ENTRIES) {
    const oldest = negativeCache.keys().next().value;
    if (oldest === undefined) break;
    negativeCache.delete(oldest);
  }
}

/**
 * Cache identity for a request.
 *
 * The auth headers are part of the key. Two callers hitting the same URL with
 * different API keys can legitimately get different responses (entitlements,
 * per-plan fields), so a URL-only key would serve one account's data to
 * another in any process handling more than one key. Only a digest of the
 * header values is kept, never the values themselves.
 */
function cacheKeyFor(prefix: string, method: string, url: string, headers?: Record<string, string>): string {
  const auth = headers
    ? Object.entries(headers)
        .filter(([k]) => !/^(accept|user-agent|content-type)$/i.test(k))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k.toLowerCase()}=${v}`)
        .join("&")
    : "";
  const suffix = auth ? `:${createHash("sha256").update(auth).digest("hex").slice(0, 16)}` : "";
  return `${prefix}${method}:${url}${suffix}`;
}

/** Test/diagnostic helper. Not exported in the README API. */
export function _cacheStatsForTests(): { size: number; max: number; bytes: number; maxBytes: number; negative: number; inFlight: number } {
  return { size: cache.size, max: MAX_CACHE_ENTRIES, bytes: cacheBytes, maxBytes: MAX_CACHE_BYTES, negative: negativeCache.size, inFlight: inFlight.size };
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Parse Retry-After (delta-seconds or HTTP-date) into ms, or undefined. */
function retryAfterMs(header: string | null): number | undefined {
  if (!header) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const at = Date.parse(header);
  if (Number.isNaN(at)) return undefined;
  return Math.max(0, at - Date.now());
}

/** Error carrying the upstream status, so callers can special-case 404 vs 429. */
export class HttpError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

async function rawFetch(url: string, options: HttpOptions): Promise<Response> {
  const { headers = {}, method = "GET", timeoutMs = DEFAULT_TIMEOUT_MS } = options;

  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        "User-Agent": USER_AGENT,
        ...headers,
      },
      // A timed-out request is not retried: three 15s waits is worse for the
      // caller than one honest failure.
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (response.ok) return response;

    const advised = retryAfterMs(response.headers.get("retry-after"));
    // A 429 without Retry-After is usually an exhausted daily/monthly quota: retrying only burns latency (and,
    // on some providers, more quota). Retry it only when the server says when.
    const retryable = RETRYABLE_STATUS.has(response.status) && (response.status !== 429 || advised !== undefined);
    const shouldRetry = attempt < MAX_RETRIES && retryable;
    if (shouldRetry) {
      if (advised === undefined || advised <= MAX_RETRY_AFTER_MS) {
        const backoff = RETRY_BASE_MS * 2 ** attempt + Math.floor(Math.random() * RETRY_BASE_MS);
        await response.body?.cancel().catch(() => {});
        await sleep(advised ?? backoff);
        continue;
      }
    }

    const body = await response.text().catch(() => "");
    throw new HttpError(
      response.status,
      `HTTP ${response.status} ${response.statusText}${body ? `: ${body.slice(0, 500)}` : ""}`,
    );
  }
}

/**
 * Run `work`, collapsing concurrent callers on the same key onto one upstream
 * request and remembering 404/410 briefly so a wrong ID can't be re-fetched in
 * a loop.
 */
async function withCoalescing<T>(key: string, work: () => Promise<T>): Promise<T> {
  const negative = getNegative(key);
  if (negative !== undefined) throw new HttpError(404, negative);

  const existing = inFlight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = work()
    .catch((err: unknown) => {
      if (err instanceof HttpError && (err.status === 404 || err.status === 410)) {
        setNegative(key, err.message);
      }
      throw err;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, promise as Promise<unknown>);
  return promise;
}

/**
 * Fetch JSON from a URL with standard error handling and optional caching.
 * Cache is keyed on URL + method + auth headers. Set cacheTtl (seconds) or env
 * SPORTS_HUB_CACHE_TTL (default 60).
 */
export async function fetchJson(
  url: string,
  options: HttpOptions = {},
): Promise<unknown> {
  const method = options.method ?? "GET";
  const ttl = options.cacheTtl ?? (method === "GET" ? DEFAULT_CACHE_TTL : 0);

  const cacheKey = cacheKeyFor("", method, url, options.headers);
  if (ttl > 0) {
    const cached = getCached(cacheKey);
    if (cached !== undefined) return cached;
  }

  return withCoalescing(cacheKey, async () => {
    const response = await rawFetch(url, options);
    const data = await response.json();
    if (ttl > 0) setCache(cacheKey, data, ttl);
    return data;
  });
}

/**
 * Like fetchJson but also returns response headers and status, for callers that read rate-limit headers
 * (e.g. The Odds API). Cached and coalesced like fetchJson: on quota-metered APIs a repeated identical call
 * must not cost a second credit. A cached hit returns the headers of the response that filled the cache.
 */
export async function fetchJsonWithMeta(
  url: string,
  options: HttpOptions = {},
): Promise<FetchJsonResult> {
  const method = options.method ?? "GET";
  const ttl = options.cacheTtl ?? (method === "GET" ? DEFAULT_CACHE_TTL : 0);
  const cacheKey = cacheKeyFor("META:", method, url, options.headers);
  type Stored = { data: unknown; headers: [string, string][]; status: number };
  const revive = (stored: Stored, cached: boolean): FetchJsonResult =>
    ({ data: stored.data, headers: new Headers(stored.headers), status: stored.status, cached });

  if (ttl > 0) {
    const cached = getCached(cacheKey) as Stored | undefined;
    if (cached !== undefined) return revive(cached, true);
  }

  const stored = await withCoalescing(cacheKey, async (): Promise<Stored> => {
    const response = await rawFetch(url, options);
    const value: Stored = { data: await response.json(), headers: [...response.headers.entries()], status: response.status };
    if (ttl > 0) setCache(cacheKey, value, ttl);
    return value;
  });
  return revive(stored, false);
}

/**
 * Fetch a newline-delimited JSON stream and return it as a JSON array.
 * Useful for APIs like Lichess that return NDJSON (e.g. /api/tournament).
 * Reads the full response into memory, so cap it via callers that pass
 * pagination params (e.g. ?max=50).
 */
export async function fetchNdjson(
  url: string,
  options: HttpOptions = {},
): Promise<unknown[]> {
  const method = options.method ?? "GET";
  const ttl = options.cacheTtl ?? (method === "GET" ? DEFAULT_CACHE_TTL : 0);
  const headers = { Accept: "application/x-ndjson", ...(options.headers ?? {}) };
  const cacheKey = cacheKeyFor("NDJSON:", method, url, options.headers);

  if (ttl > 0) {
    const cached = getCached(cacheKey);
    if (cached !== undefined) return cached as unknown[];
  }

  return withCoalescing(cacheKey, async () => {
    const response = await rawFetch(url, { ...options, headers });
    const text = await response.text();
    const lines = text.split("\n").filter((l) => l.trim() !== "");
    const data: unknown[] = lines.map((line) => JSON.parse(line));
    if (ttl > 0) setCache(cacheKey, data, ttl);
    return data;
  });
}

/**
 * Fetch raw text (e.g. CSV) with the same caching/timeout/error handling as
 * fetchJson. Used by providers whose upstream serves non-JSON payloads.
 */
export async function fetchText(
  url: string,
  options: HttpOptions = {},
): Promise<string> {
  const method = options.method ?? "GET";
  const ttl = options.cacheTtl ?? (method === "GET" ? DEFAULT_CACHE_TTL : 0);
  const headers = { Accept: "text/csv, text/plain, */*", ...(options.headers ?? {}) };
  const cacheKey = cacheKeyFor("TEXT:", method, url, options.headers);

  if (ttl > 0) {
    const cached = getCached(cacheKey);
    if (cached !== undefined) return cached as string;
  }

  return withCoalescing(cacheKey, async () => {
    const response = await rawFetch(url, { ...options, headers });
    const text = await response.text();
    if (ttl > 0) setCache(cacheKey, text, ttl);
    return text;
  });
}

/**
 * Build a URL with query parameters, skipping undefined/null/empty values.
 */
export function buildUrl(
  base: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  const url = new URL(base);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

/**
 * Encode a path segment so user-supplied IDs cannot escape into adjacent
 * path components. Use for any `${id}` interpolated into URL paths.
 */
export function pathSegment(value: string | number): string {
  return encodeURIComponent(String(value));
}

/**
 * Standard tool result helpers.
 */

/**
 * The un-serialized payload, hung off the result so the central tool pipeline
 * (shared/annotations.ts) can project fields without re-parsing the JSON it
 * just produced. Non-enumerable, so it never reaches the wire.
 */
export const RAW_PAYLOAD = Symbol.for("sports-hub.rawPayload");

export function toolResult(data: unknown) {
  // Compact, not pretty-printed: indentation is 56% of the bytes on a payload
  // like ESPN's team list and buys the model nothing.
  const result = {
    content: [{ type: "text" as const, text: JSON.stringify(data) }],
  };
  Object.defineProperty(result, RAW_PAYLOAD, { value: data, enumerable: false });
  return result;
}

export function errorResult(message: string) {
  return {
    content: [{ type: "text" as const, text: `Error: ${message}` }],
    isError: true,
  };
}

/**
 * Wrap a tool handler so any thrown error is converted to errorResult.
 * Use this in new providers to remove try/catch boilerplate. Older
 * providers keep their inline try/catch because some attach
 * provider-specific error suffixes (e.g. ESPN fallback hints).
 */
export function safe<T>(
  fn: (params: T) => Promise<ReturnType<typeof toolResult>>,
): (params: T) => Promise<ReturnType<typeof toolResult> | ReturnType<typeof errorResult>> {
  return async (params: T) => {
    try {
      return await fn(params);
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err));
    }
  };
}
