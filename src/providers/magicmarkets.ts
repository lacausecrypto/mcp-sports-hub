import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { fetchJson, pathSegment, toolResult, errorResult } from "../shared/http.js";

// ---------------------------------------------------------------------------
// MagicMarkets provider — 12 read-only tools
// Base: https://magicmarkets.com/v2
// Auth: X-Api-Key: <key>  (MAGICMARKETS_API_KEY)
// Docs: https://docs.magicmarkets.com
//
// MagicMarkets is a peer-to-peer sports betting exchange (zero fees, USDT
// stakes). These tools cover the READ half of the v2 REST API: balance,
// orders, positions, betslip quotes, bet-type payout grids, exchange rates
// and heartbeats.
//
// Deliberately NOT exposed (all are POST/DELETE and commit or cancel real
// money, which would contradict this server's read-only tool annotations):
//   POST   /v2/orders/                  place an order
//   POST   /v2/orders/{id}/close/       close an order
//   POST   /v2/orders/close_many|close_all/
//   POST   /v2/betslips/                create a betslip
//   POST   /v2/heartbeats/              open a dead-man's-switch timer
//   DELETE /v2/heartbeats/{id}/         cancel that timer
//
// Live event discovery and streaming prices are WebSocket-only
// (wss://magicmarkets.com/v2/stream) and therefore out of scope here.
// ---------------------------------------------------------------------------

const BASE_URL = "https://magicmarkets.com/v2";

/** Account state moves on every fill: keep it near-live rather than 60s stale. */
const ACCOUNT_TTL = 5;
/** Reference data that barely moves within a conversation. */
const REFERENCE_TTL = 60;

const StatusSchema = z
  .array(z.string())
  .optional()
  .describe('Filter by status: open, pending, done, failed');

const SportSchema = z
  .array(z.string())
  .optional()
  .describe('Filter by sport code: fb (football), af (American football), basket, tennis, ih, baseball, cricket, mma, golf, moto — see "Sports & bet types" in the docs');

const EventIdSchema = z
  .array(z.string())
  .optional()
  .describe('Filter by event ID, formatted "date,home_id,away_id" (e.g. "2026-09-10,21641,21632"). Read it off an order\'s event_info or the exchange feed.');

const OrderTypeSchema = z
  .array(z.string())
  .optional()
  .describe("Filter by order type: normal, lay, parlay");

const DateFromSchema = z.string().optional().describe("Start of date range (ISO 8601)");
const DateToSchema = z.string().optional().describe("End of date range (ISO 8601)");
const SearchSchema = z.string().optional().describe("Free-text search");

/** Filters shared by list-orders and calculate-position. */
type OrderFilters = {
  status?: string[];
  sport?: string[];
  event_id?: string[];
  order_type?: string[];
  date_from?: string;
  date_to?: string;
  search?: string;
};

/**
 * Build a query string. Array values repeat the key (`?status=open&status=done`),
 * which is what the API's OpenAPI spec declares — the shared buildUrl() helper
 * only sets one value per key, so arrays are appended here.
 */
function buildQuery(
  params: Record<string, string | number | boolean | string[] | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      for (const item of value) if (item !== "") search.append(key, String(item));
    } else {
      search.append(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function register(server: McpServer): void {
  const API_KEY = process.env.MAGICMARKETS_API_KEY;

  async function callApi(
    path: string,
    params: Record<string, string | number | boolean | string[] | undefined> = {},
    cacheTtl: number = ACCOUNT_TTL,
  ) {
    if (!API_KEY) {
      return errorResult(
        "MAGICMARKETS_API_KEY env var is required. Create a key at https://magicmarkets.com under Settings -> API.",
      );
    }
    try {
      const url = `${BASE_URL}${path}${buildQuery(params)}`;
      const data = await fetchJson(url, { headers: { "X-Api-Key": API_KEY }, cacheTtl });
      return toolResult(data);
    } catch (err) {
      return errorResult(err instanceof Error ? err.message : String(err));
    }
  }

  // 1. get_balance
  server.tool(
    "magicmarkets_get_balance",
    "Get the authenticated account's MagicMarkets balance, total stake on open bets, and smart credit. All values are USDT.",
    {},
    async () => callApi("/balance/"),
  );

  // 2. get_xrates
  server.tool(
    "magicmarkets_get_xrates",
    "Get current MagicMarkets exchange rates. Also the cheapest call for checking that an API key is valid.",
    {},
    async () => callApi("/xrates/", {}, REFERENCE_TTL),
  );

  // 3. list_orders
  server.tool(
    "magicmarkets_list_orders",
    "List the account's orders on the MagicMarkets exchange, with filters for status, sport, event, order type and date range. Paginated; stakes in USDT.",
    {
      page: z.number().int().min(1).optional().describe("Page number (default 1)"),
      page_size: z
        .number()
        .int()
        .min(1)
        .max(1000)
        .optional()
        .describe("Results per page (default 25, max 1000)"),
      status: StatusSchema,
      sport: SportSchema,
      event_id: EventIdSchema,
      order_type: OrderTypeSchema,
      date_from: DateFromSchema,
      date_to: DateToSchema,
      search: SearchSchema,
    },
    async (args) => callApi("/orders/", args),
  );

  // 4. get_order
  server.tool(
    "magicmarkets_get_order",
    "Get a single MagicMarkets order by its order ID, with all stakes in USDT.",
    {
      order_id: z.string().describe("Order ID"),
    },
    async ({ order_id }) => callApi(`/orders/${pathSegment(order_id)}/`),
  );

  // 5. get_order_by_uuid
  server.tool(
    "magicmarkets_get_order_by_uuid",
    "Get a MagicMarkets order by the client-supplied request UUID, for reconciling an order whose ID was never received.",
    {
      uuid: z.string().describe("The request_uuid supplied when the order was created"),
    },
    async ({ uuid }) => callApi(`/orders/tracked/${pathSegment(uuid)}/`),
  );

  // 6. get_order_updates
  server.tool(
    "magicmarkets_get_order_updates",
    "List MagicMarkets orders updated inside a time window, for syncing a local copy. Both bounds must be at least 60 seconds in the past and the window must not exceed 70 minutes.",
    {
      updated_at_from: z.string().describe("Window start (ISO 8601), at least 60s in the past"),
      updated_at_to: z.string().describe("Window end (ISO 8601), at least 60s in the past"),
    },
    async (args) => callApi("/orders/updates/", args),
  );

  // 7. get_position
  server.tool(
    "magicmarkets_get_position",
    "Calculate the profit/loss payoff grid across filtered MagicMarkets orders. Takes the same filters as list_orders, but the filters must narrow to a SINGLE event: an unfiltered call fails with 'filters match orders from multiple events'. Pass one event_id.",
    {
      status: StatusSchema,
      sport: SportSchema,
      event_id: EventIdSchema,
      order_type: OrderTypeSchema,
      date_from: DateFromSchema,
      date_to: DateToSchema,
      search: SearchSchema,
      include_cashout_info: z
        .boolean()
        .optional()
        .describe("Include cash-out information in the response"),
    },
    async (args: OrderFilters & { include_cashout_info?: boolean }) =>
      callApi("/orders/position/", args),
  );

  // 8. list_betslips
  server.tool(
    "magicmarkets_list_betslips",
    "List the open betslip IDs on the authenticated MagicMarkets account.",
    {},
    async () => callApi("/betslips/"),
  );

  // 9. get_betslip
  server.tool(
    "magicmarkets_get_betslip",
    "Get one MagicMarkets betslip with its live quotes (price_list) and stakes in USDT. price_list is empty until quotes arrive, or when nothing is quoting the selection.",
    {
      betslip_id: z.string().describe("Betslip ID"),
    },
    async ({ betslip_id }) => callApi(`/betslips/${pathSegment(betslip_id)}/`),
  );

  // 10. get_bet_type
  server.tool(
    "magicmarkets_get_bet_type",
    "Explain a MagicMarkets bet type, including its win/loss payout grid. Use it to decode a bet_type string read off the exchange feed.",
    {
      sport: z.string().describe('Sport code, e.g. "fb" (football) or "af" (American football)'),
      bet_type: z.string().describe('Bet type string as carried on the feed, e.g. "for,h" (home win) or "for,over,2.5"'),
      home_team: z.string().optional().describe("Home team name, for labelling the grid"),
      away_team: z.string().optional().describe("Away team name, for labelling the grid"),
    },
    async ({ sport, bet_type, home_team, away_team }) =>
      callApi(
        `/sports/${pathSegment(sport)}/bet_types/${pathSegment(bet_type)}/`,
        { home_team, away_team },
        REFERENCE_TTL,
      ),
  );

  // 11. list_heartbeats
  server.tool(
    "magicmarkets_list_heartbeats",
    "List the open heartbeat timers on the account. A heartbeat is a dead-man's switch: if it expires, MagicMarkets closes every open order on the account.",
    {},
    async () => callApi("/heartbeats/"),
  );

  // 12. get_heartbeat
  server.tool(
    "magicmarkets_get_heartbeat",
    "Get a single MagicMarkets heartbeat timer by ID, including the time left before it expires.",
    {
      heartbeat_id: z.string().describe("Heartbeat ID"),
    },
    async ({ heartbeat_id }) => callApi(`/heartbeats/${pathSegment(heartbeat_id)}/`),
  );
}
