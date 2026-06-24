/**
 * Shared HTTP utilities for all providers.
 */

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
}

// ---------------------------------------------------------------------------
// In-memory cache (TTL + LRU hard cap)
// ---------------------------------------------------------------------------

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const DEFAULT_CACHE_TTL = clampInt(process.env.SPORTS_HUB_CACHE_TTL, 60, 0, 86_400);
const MAX_CACHE_ENTRIES = clampInt(process.env.SPORTS_HUB_CACHE_MAX, 500, 1, 100_000);
const DEFAULT_TIMEOUT_MS = clampInt(process.env.SPORTS_HUB_HTTP_TIMEOUT_MS, 15_000, 1_000, 600_000);

// Map preserves insertion order — re-inserting on read gives us LRU semantics.
const cache = new Map<string, CacheEntry>();

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
    cache.delete(key);
    return undefined;
  }
  // Refresh insertion order so it's the most-recently-used.
  cache.delete(key);
  cache.set(key, entry);
  return entry.data;
}

function setCache(key: string, data: unknown, ttl: number): void {
  cache.set(key, { data, expiresAt: Date.now() + ttl * 1000 });
  // Hard cap: drop oldest entries (insertion order) until we're under the limit.
  while (cache.size > MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
}

/** Test/diagnostic helper. Not exported in the README API. */
export function _cacheStatsForTests(): { size: number; max: number } {
  return { size: cache.size, max: MAX_CACHE_ENTRIES };
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------

async function rawFetch(url: string, options: HttpOptions): Promise<Response> {
  const { headers = {}, method = "GET", timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const response = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
      ...headers,
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `HTTP ${response.status} ${response.statusText}${body ? `: ${body.slice(0, 500)}` : ""}`,
    );
  }
  return response;
}

/**
 * Fetch JSON from a URL with standard error handling and optional caching.
 * Cache is keyed on URL + method. Set cacheTtl (seconds) or env SPORTS_HUB_CACHE_TTL (default 60).
 */
export async function fetchJson(
  url: string,
  options: HttpOptions = {},
): Promise<unknown> {
  const method = options.method ?? "GET";
  const ttl = options.cacheTtl ?? (method === "GET" ? DEFAULT_CACHE_TTL : 0);

  const cacheKey = `${method}:${url}`;
  if (ttl > 0) {
    const cached = getCached(cacheKey);
    if (cached !== undefined) return cached;
  }

  const response = await rawFetch(url, options);
  const data = await response.json();
  if (ttl > 0) setCache(cacheKey, data, ttl);
  return data;
}

/**
 * Like fetchJson but also returns response headers and status. NEVER cached —
 * intended for callers that need to read rate-limit headers (e.g. The Odds API).
 * Such callers should implement their own caching if needed.
 */
export async function fetchJsonWithMeta(
  url: string,
  options: HttpOptions = {},
): Promise<FetchJsonResult> {
  const response = await rawFetch(url, options);
  const data = await response.json();
  return { data, headers: response.headers, status: response.status };
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
  const cacheKey = `NDJSON:${method}:${url}`;

  if (ttl > 0) {
    const cached = getCached(cacheKey);
    if (cached !== undefined) return cached as unknown[];
  }

  const headers = { Accept: "application/x-ndjson", ...(options.headers ?? {}) };
  const response = await rawFetch(url, { ...options, headers });
  const text = await response.text();
  const lines = text.split("\n").filter((l) => l.trim() !== "");
  const data: unknown[] = lines.map((line) => JSON.parse(line));

  if (ttl > 0) setCache(cacheKey, data, ttl);
  return data;
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
  const cacheKey = `TEXT:${method}:${url}`;

  if (ttl > 0) {
    const cached = getCached(cacheKey);
    if (cached !== undefined) return cached as string;
  }

  const headers = { Accept: "text/csv, text/plain, */*", ...(options.headers ?? {}) };
  const response = await rawFetch(url, { ...options, headers });
  const text = await response.text();

  if (ttl > 0) setCache(cacheKey, text, ttl);
  return text;
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
export function toolResult(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
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
