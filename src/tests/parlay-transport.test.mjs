import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { createInterface } from 'node:readline';
import { test } from 'node:test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

test('the HTTP tool list omits the private account provider', { timeout: 15000 }, async t => {
  const reservation = createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise(resolve => reservation.close(resolve));

  const child = spawn(process.execPath, ['dist/index.js', '--http'], {
    env: {
      SPORTS_HUB_PROVIDERS: 'nhl,parlay',
      SPORTS_HUB_PORT: String(port),
      SPORTS_HUB_HOST: '127.0.0.1',
      PARLAY_API_KEY: 'unused-private-fixture',
    },
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  const closed = once(child, 'close');
  t.after(async () => { child.kill(); await closed; });
  const lines = createInterface({ input: child.stderr });
  let ready = false;
  for await (const line of lines) {
    if (line.includes('Sports Hub HTTP running')) { ready = true; break; }
  }
  assert.ok(ready, 'The local HTTP server must start.');

  const client = new Client({ name: 'private-provider-test', version: '1' });
  try {
    await client.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${port}/mcp`)));
    const { tools } = await client.listTools();
    assert.ok(tools.some(tool => tool.name.startsWith('nhl_')));
    assert.ok(!tools.some(tool => tool.name.startsWith('parlay_')));
  } finally {
    await client.close();
  }
});
