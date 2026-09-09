import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buildUrl, errorResult, toolResult } from "../shared/http.js";
import { USER_AGENT } from "../shared/version.js";

const BASE = "https://parlay-api.com";
const DOCS = "https://parlay-api.com/docs";
const PRICING = "https://parlay-api.com/pricing";
const MAX_BYTES = 4 * 1024 * 1024;
const Key = z.string().min(1).max(100).regex(/^[a-z0-9][a-z0-9_]*$/);
const OddsInput = z.object({
  sport_key: Key.describe("Sport key from parlay_get_sports, such as basketball_nba or table_tennis_tt_cup."),
  markets: z.array(z.enum(["h2h", "spreads", "totals"])).min(1).max(3)
    .default(["h2h"]).describe("Market families to request. Defaults to h2h; additional markets may consume more account credits."),
  regions: z.array(z.enum(["us", "us2", "uk", "eu", "au", "fr", "ca", "mx", "latam", "br", "asia", "global"]))
    .min(1).max(3).default(["us"]).describe("At most three regions. Use the bookmaker catalog to choose; global includes international sources."),
  bookmakers: z.array(Key).min(1).max(5).optional()
    .describe("Optional one to five bookmaker keys from parlay_get_bookmakers."),
  odds_format: z.enum(["american", "decimal"]).default("american"),
});

/** One uncached, bounded GET. Never forward the private header on a redirect. */
async function request(path: string, params?: Record<string, string>, apiKey?: string) {
  try {
    const response = await fetch(buildUrl(BASE + path, params), {
      method: "GET",
      redirect: "error",
      signal: AbortSignal.timeout(15_000),
      headers: { Accept: "application/json", "User-Agent": USER_AGENT,
        ...(apiKey ? { "X-API-Key": apiKey } : {}) },
    });
    if (response.redirected || (response.url && new URL(response.url).origin !== BASE)) {
      await response.body?.cancel();
      return errorResult("ParlayAPI returned an unexpected origin; the response was refused.");
    }
    if (!response.ok) {
      await response.body?.cancel();
      // Do not reflect upstream error bodies, headers, URLs or exception text.
      if (response.status === 401 || response.status === 403) {
        return errorResult(`ParlayAPI rejected the request. Check PARLAY_API_KEY and account access. ${DOCS} ${PRICING}`);
      }
      if (response.status === 429) {
        return errorResult(`ParlayAPI rate or credit limit reached. Check your account before retrying. ${PRICING}`);
      }
      return errorResult(`ParlayAPI request failed (HTTP ${response.status}). Check catalog keys and ${DOCS}`);
    }
    const reader = response.body?.getReader();
    if (!reader) return errorResult("ParlayAPI returned an empty response.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > MAX_BYTES) {
          await reader.cancel();
          return errorResult("ParlayAPI response exceeded 4 MiB. Request fewer markets or bookmakers.");
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    const body = Buffer.concat(chunks).toString("utf8");
    if (apiKey && body.includes(apiKey)) {
      return errorResult("ParlayAPI response contained credential material and was refused.");
    }
    // Keep upstream timestamps and prices unchanged. The shared tool pipeline
    // may project fields or truncate large outputs, with its usual notice.
    const parsed: unknown = JSON.parse(body);
    if (apiKey && JSON.stringify(parsed).includes(apiKey)) {
      return errorResult("ParlayAPI response contained credential material and was refused.");
    }
    return toolResult(parsed);
  } catch {
    return errorResult(`ParlayAPI request failed or timed out. Check connectivity and ${DOCS}`);
  }
}

export function register(server: McpServer): void {
  const apiKey = process.env.PARLAY_API_KEY?.trim();
  server.tool("parlay_get_sports",
    "List ParlayAPI sport and league keys anonymously. Catalog inclusion does not guarantee currently priced events or markets.",
    {}, async () => request("/v1/sports"));
  server.tool("parlay_get_bookmakers",
    "List ParlayAPI bookmaker keys and advertised endpoint coverage anonymously. Check returned odds for current priced availability.",
    {}, async () => request("/v1/bookmakers"));
  server.tool("parlay_get_odds",
    "Get moneylines, spreads or totals using your own PARLAY_API_KEY for private research. Requests may consume account credits. No wagers, payments or public redistribution; no local response cache or automatic retries. Source timestamps are retained.",
    OddsInput.shape,
    async (params) => {
      const input = OddsInput.safeParse(params);
      if (!input.success) return errorResult("Invalid ParlayAPI filters. Use catalog sport/bookmaker keys and the listed markets and regions.");
      if (!apiKey || apiKey.length > 4096 || /[\x00-\x20\x7f]/.test(apiKey)) {
        return errorResult(`Set your own PARLAY_API_KEY in this server's environment to retrieve odds. Catalog tools need no key. ${DOCS} ${PRICING}`);
      }
      const { sport_key, markets, regions, bookmakers, odds_format } = input.data;
      return request(`/v1/sports/${sport_key}/odds`, {
        markets: [...new Set(markets)].join(","),
        regions: [...new Set(regions)].join(","),
        ...(bookmakers ? { bookmakers: [...new Set(bookmakers)].join(",") } : {}),
        oddsFormat: odds_format,
        include: "verification",
      }, apiKey);
    });
}
