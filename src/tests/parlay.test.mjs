import { afterEach, it } from 'node:test';
import assert from 'node:assert/strict';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { register } from '../../dist/providers/parlay.js';
import { captureToolAnnotations } from '../../dist/shared/annotations.js';
import { PROVIDER_CATALOG, PRESETS } from '../../dist/shared/catalog.js';

const oldFetch = globalThis.fetch;
const oldKey = process.env.PARLAY_API_KEY;
afterEach(() => { globalThis.fetch = oldFetch; if (oldKey === undefined) delete process.env.PARLAY_API_KEY; else process.env.PARLAY_API_KEY = oldKey; });
function handlers(key = 'test-private-key') {
  if (key === null) delete process.env.PARLAY_API_KEY; else process.env.PARLAY_API_KEY = key;
  const tools = {};
  register({ tool(name, description, schema, fn) { tools[name] = fn; } });
  return tools;
}
const value = result => JSON.parse(result.content[0].text);
const text = result => result.content[0].text;
const ok = data => new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
it('registers in catalog and odds preset, outside free preset', () => {
  assert.equal(PROVIDER_CATALOG.find(x => x.key === 'parlay').env, 'PARLAY_API_KEY');
  assert.ok(PRESETS.odds.includes('parlay'));
  assert.ok(!PRESETS.free.includes('parlay'));
  assert.deepEqual(Object.keys(handlers()), ['parlay_get_sports', 'parlay_get_bookmakers', 'parlay_get_odds']);
});
it('catalogs are anonymous even with an account key configured', async () => {
  const paths = [];
  globalThis.fetch = async (url, options) => { paths.push(new URL(url).pathname); assert.equal(options.headers['X-API-Key'], undefined); assert.equal(options.redirect, 'error'); return ok([]); };
  const h = handlers(); await h.parlay_get_sports(); await h.parlay_get_bookmakers();
  assert.deepEqual(paths, ['/v1/sports', '/v1/bookmakers']);
});
it('missing key has actionable docs and pricing without a request', async () => {
  globalThis.fetch = () => { throw Error('must not fetch'); };
  const r = await handlers(null).parlay_get_odds({ sport_key: 'basketball_nba' });
  assert.equal(r.isError, true); assert.match(text(r), /PARLAY_API_KEY/); assert.match(text(r), /\/docs/); assert.match(text(r), /\/pricing/);
});
it('sends a header key, bounded defaults and preserves upstream quote clocks', async () => {
  const body = [{ id: 'fixture', last_update: '2026-09-09T03:00:00Z', bookmakers: [{ last_update: '2026-09-09T03:01:00Z', markets: [{ key: 'h2h', last_update: '2026-09-09T02:00:00Z', outcomes: [{ price: -110 }] }] }] }];
  globalThis.fetch = async (url, options) => {
    const u = new URL(url); assert.equal(u.origin, 'https://parlay-api.com'); assert.equal(u.pathname, '/v1/sports/basketball_nba/odds');
    assert.equal(u.searchParams.get('markets'), 'h2h'); assert.equal(u.searchParams.get('regions'), 'us'); assert.equal(u.searchParams.get('oddsFormat'), 'american'); assert.equal(u.searchParams.get('include'), 'verification');
    assert.ok(!u.toString().includes('test-private-key')); assert.equal(options.headers['X-API-Key'], 'test-private-key'); assert.equal(options.method, 'GET'); assert.ok(options.signal); return ok(body);
  };
  assert.deepEqual(value(await handlers().parlay_get_odds({ sport_key: 'basketball_nba' })), body);
});
it('supports explicit global point spreads and bookmaker selection', async () => {
  globalThis.fetch = async url => { const u = new URL(url); assert.equal(u.searchParams.get('markets'), 'spreads'); assert.equal(u.searchParams.get('regions'), 'global'); assert.equal(u.searchParams.get('bookmakers'), 'betway_mz'); assert.equal(u.searchParams.get('oddsFormat'), 'decimal'); return ok([]); };
  assert.equal((await handlers().parlay_get_odds({ sport_key: 'table_tennis_tt_cup', markets: ['spreads'], regions: ['global'], bookmakers: ['betway_mz'], odds_format: 'decimal' })).isError, undefined);
});
it('rejects paths, unsupported markets and unbounded inputs before transport', async () => {
  let calls = 0; globalThis.fetch = async () => { calls++; return ok([]); }; const h = handlers();
  for (const patch of [{sport_key:'../keys'}, {sport_key:'nba?apiKey=x'}, {markets:['player_points']}, {markets:['h2h','h2h','h2h','h2h']}, {regions:['unknown']}, {regions:['us','eu','uk','au']}, {bookmakers:Array(6).fill('draftkings')}, {bookmakers:['https://evil.test']}]) {
    assert.equal((await h.parlay_get_odds({sport_key:'basketball_nba', ...patch})).isError, true);
  }
  assert.equal(calls, 0);
});
it('never caches odds or shares account responses', async () => {
  const keys=[]; globalThis.fetch = async (url, options) => { keys.push(options.headers['X-API-Key']); return ok({ sequence: keys.length }); };
  const a=handlers('first-private-key'), b=handlers('second-private-key');
  assert.equal(value(await a.parlay_get_odds({sport_key:'basketball_nba'})).sequence,1);
  assert.equal(value(await a.parlay_get_odds({sport_key:'basketball_nba'})).sequence,2);
  assert.equal(value(await b.parlay_get_odds({sport_key:'basketball_nba'})).sequence,3);
  assert.deepEqual(keys,['first-private-key','first-private-key','second-private-key']);
});
it('sanitizes HTTP and network failures without retries', async () => {
  const h=handlers(); let calls=0;
  for (const status of [401,403,429,500]) { globalThis.fetch=async()=>{calls++;return new Response('test-private-key',{status});}; const r=await h.parlay_get_odds({sport_key:'basketball_nba'}); assert.equal(r.isError,true); assert.ok(!text(r).includes('test-private-key')); }
  globalThis.fetch=async()=>{calls++;throw Error('test-private-key');}; assert.ok(!text(await h.parlay_get_odds({sport_key:'basketball_nba'})).includes('test-private-key')); assert.equal(calls,5);
});
it('rejects redirected or unexpected-origin responses', async () => {
  const h=handlers();
  for (const properties of [{url:'https://evil.test/data'}, {redirected:true}]) { globalThis.fetch=async()=>{const r=ok([]); for(const [k,v] of Object.entries(properties)) Object.defineProperty(r,k,{value:v}); return r;}; assert.equal((await h.parlay_get_odds({sport_key:'basketball_nba'})).isError,true); }
});
it('rejects direct and Unicode-escaped credential echoes in successful responses', async () => {
  const h=handlers();
  for(const body of ['{"error":"test-private-key"}', '{"error":"\\u0074est-private-key"}']) { globalThis.fetch=async()=>new Response(body); const r=await h.parlay_get_odds({sport_key:'basketball_nba'}); assert.equal(r.isError,true); assert.ok(!text(r).includes('test-private-key')); }
});
it('bounds response bytes and cancels oversized streams', async () => {
  let cancelled=false;
  globalThis.fetch=async()=>new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array(4*1024*1024+1));},cancel(){cancelled=true;}}));
  const r=await handlers().parlay_get_odds({sport_key:'basketball_nba'}); assert.equal(r.isError,true); assert.match(text(r),/4 MiB/); assert.equal(cancelled,true);
});
it('lists and invokes read-only tools through an actual MCP connection', async () => {
  process.env.PARLAY_API_KEY='test-private-key';
  globalThis.fetch=async()=>ok([{key:'basketball_nba'}]);
  const server=new McpServer({name:'parlay-test',version:'0.0.0'}); const finalize=captureToolAnnotations(server); register(server); finalize();
  const client=new Client({name:'test-client',version:'0.0.0'}); const [a,b]=InMemoryTransport.createLinkedPair();
  await server.connect(a); await client.connect(b);
  try { const listed=await client.listTools(); assert.equal(listed.tools.length,3); for(const t of listed.tools) assert.equal(t.annotations.readOnlyHint,true);
    const response=await client.callTool({name:'parlay_get_sports',arguments:{}}); assert.deepEqual(value(response),[{key:'basketball_nba'}]);
    const invalid=await client.callTool({name:'parlay_get_odds',arguments:{sport_key:'../unsafe'}}); assert.equal(invalid.isError,true);
  } finally { await client.close(); await server.close(); }
});
