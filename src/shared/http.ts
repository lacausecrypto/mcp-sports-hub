/**
 * Shared HTTP utilities for all providers.
 */

export interface HttpOptions {
  headers?: Record<string, string>;
  method?: "GET" | "POST";
}

/**
 * Fetch JSON from a URL with standard error handling.
 */
export async function fetchJson(
  url: string,
  options: HttpOptions = {},
): Promise<unknown> {
  const { headers = {}, method = "GET" } = options;

  const response = await fetch(url, {
    method,
    headers: {
      Accept: "application/json",
      "User-Agent": "mcp-sports-hub/1.0.0",
      ...headers,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `HTTP ${response.status} ${response.statusText}${body ? `: ${body.slice(0, 500)}` : ""}`,
    );
  }

  return response.json();
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
