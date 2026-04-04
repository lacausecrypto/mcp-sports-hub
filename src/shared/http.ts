/**
 * Shared HTTP utilities for all providers.
 */

export interface HttpOptions {
  headers?: Record<string, string>;
  method?: "GET" | "POST";
  /** Cache TTL in seconds. 0 = no cache (default). */
  cacheTtl?: number;
}

// ---------------------------------------------------------------------------
// In-memory cache (simple TTL-based)
// ---------------------------------------------------------------------------

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

const DEFAULT_CACHE_TTL = parseInt(process.env.SPORTS_HUB_CACHE_TTL ?? "60", 10);

function getCached(key: string): unknown | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.data;
}

function setCache(key: string, data: unknown, ttl: number): void {
  cache.set(key, { data, expiresAt: Date.now() + ttl * 1000 });
  // Evict old entries if cache grows too large (>500 entries)
  if (cache.size > 500) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (now > v.expiresAt) cache.delete(k);
    }
  }
}

// ---------------------------------------------------------------------------
// HTTP
// ---------------------------------------------------------------------------

/**
 * Fetch JSON from a URL with standard error handling and optional caching.
 * Cache is keyed on URL + method. Set cacheTtl (seconds) or env SPORTS_HUB_CACHE_TTL (default 60).
 */
export async function fetchJson(
  url: string,
  options: HttpOptions = {},
): Promise<unknown> {
  const { headers = {}, method = "GET", cacheTtl } = options;
  const ttl = cacheTtl ?? (method === "GET" ? DEFAULT_CACHE_TTL : 0);

  // Check cache for GET requests
  const cacheKey = `${method}:${url}`;
  if (ttl > 0) {
    const cached = getCached(cacheKey);
    if (cached !== undefined) return cached;
  }

  const response = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      "User-Agent": "mcp-sports-hub/1.1.0",
      ...headers,
    },
    signal: AbortSignal.timeout(15_000), // 15s timeout
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `HTTP ${response.status} ${response.statusText}${body ? `: ${body.slice(0, 500)}` : ""}`,
    );
  }

  const data = await response.json();

  // Store in cache
  if (ttl > 0) setCache(cacheKey, data, ttl);

  return data;
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
 * Wrap a tool handler with try/catch error handling.
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

/**
 * Extract rate limit info from response headers (API-Sports pattern).
 */
export function extractRateLimit(headers: Headers): string {
  const remaining = headers.get("x-ratelimit-remaining");
  const limit = headers.get("x-ratelimit-requests-limit");
  if (remaining && limit) return `\n\n[Rate limit: ${remaining}/${limit} remaining]`;
  return "";
}
