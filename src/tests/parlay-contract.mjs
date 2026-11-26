import assert from 'node:assert/strict';
import { test } from 'node:test';
import { register } from '../../dist/providers/parlay.js';

// Opt-in private check. Invoke via npm run test:parlay-contract.
test('live ParlayAPI catalogs and one account-backed American odds request', async () => {
  assert.ok(process.env.PARLAY_API_KEY?.trim(), 'Set a designated private test key before running this contract.');
  const sport = process.env.PARLAY_TEST_SPORT ?? 'basketball_nba';
  const book = process.env.PARLAY_TEST_BOOK ?? 'draftkings';
  const calls = new Map();
  register({ tool(name, _description, _schema, handler) { calls.set(name, handler); } });
  async function rows(name, args) {
    const response = await calls.get(name)(args);
    assert.ok(!response.isError, `${name} did not return a successful response`);
    const items = JSON.parse(response.content[0].text);
    assert.ok(Array.isArray(items), `${name} did not return an array`);
    return items;
  }
  const sports = await rows('parlay_get_sports', {});
  assert.ok(sports.some(row => row.key === sport), 'Sport absent from the public catalog.');
  const books = await rows('parlay_get_bookmakers', {});
  assert.ok(books.some(row => row.key === book), 'Bookmaker absent from the public catalog.');

  const events = await rows('parlay_get_odds', {
    sport_key: sport, bookmakers: [book], markets: ['h2h'], regions: ['us'], odds_format: 'american',
  });
  let quotes = 0;
  for (const event of events) {
    assert.ok(typeof event.id === 'string' && event.sport_key === sport && Array.isArray(event.bookmakers),
      'Unexpected event shape or sport.');
    for (const bookmaker of event.bookmakers) {
      assert.ok(bookmaker.key === book && Array.isArray(bookmaker.markets), 'Bookmaker filter or shape mismatch.');
      for (const market of bookmaker.markets) {
        assert.ok(market.key === 'h2h' && Array.isArray(market.outcomes), 'Market filter or shape mismatch.');
        for (const outcome of market.outcomes) {
          assert.ok(typeof outcome.name === 'string' && Number.isFinite(outcome.price) && Math.abs(outcome.price) >= 100,
            'Expected a named outcome with a numeric American price.');
          quotes++;
        }
      }
      for (const field of ['verified_at', 'line_changed_at']) {
        assert.ok(Object.hasOwn(bookmaker, field) && (bookmaker[field] === null ||
          (typeof bookmaker[field] === 'string' && Number.isFinite(Date.parse(bookmaker[field])))),
          `Unexpected ${field} verification field.`);
      }
      assert.ok(Object.hasOwn(bookmaker, 'is_current') &&
        (bookmaker.is_current === null || typeof bookmaker.is_current === 'boolean'), 'Unexpected is_current field.');
    }
  }
  assert.ok(quotes > 0, 'No matching priced row in this observation. The live quote contract is inconclusive.');
});
