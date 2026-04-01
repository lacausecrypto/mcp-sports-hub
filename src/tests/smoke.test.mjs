/**
 * Smoke tests for Sports Hub MCP Server.
 * Verifies that every provider module:
 *   1. Imports without errors
 *   2. Exports a `register` function
 *   3. Registers at least 1 tool on a mock server
 *
 * Run: node --test src/tests/smoke.test.mjs
 * (requires Node.js 18+ built-in test runner)
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const providersDir = join(__dirname, "..", "..", "dist", "providers");

// Minimal mock of McpServer that just counts tool registrations
function createMockServer() {
  const tools = [];
  return {
    tools,
    tool(name, description, schema, handler) {
      tools.push({ name, description });
    },
  };
}

describe("Provider smoke tests", async () => {
  const files = (await readdir(providersDir)).filter(
    (f) => f.endsWith(".js") && !f.endsWith(".test.js")
  );

  assert.ok(files.length >= 29, `Expected at least 29 providers, found ${files.length}`);

  for (const file of files) {
    const providerName = file.replace(".js", "");

    it(`${providerName} — imports and exports register()`, async () => {
      const mod = await import(join(providersDir, file));
      assert.ok(
        typeof mod.register === "function",
        `${providerName} must export a register() function`
      );
    });

    it(`${providerName} — registers at least 1 tool`, async () => {
      const mod = await import(join(providersDir, file));
      const mock = createMockServer();
      mod.register(mock);
      assert.ok(
        mock.tools.length >= 1,
        `${providerName} registered ${mock.tools.length} tools (expected >= 1)`
      );
    });

    it(`${providerName} — all tool names are prefixed`, async () => {
      const mod = await import(join(providersDir, file));
      const mock = createMockServer();
      mod.register(mock);
      for (const tool of mock.tools) {
        assert.ok(
          tool.name.includes("_"),
          `Tool "${tool.name}" in ${providerName} must contain an underscore (prefix_action)`
        );
      }
    });

    it(`${providerName} — no duplicate tool names`, async () => {
      const mod = await import(join(providersDir, file));
      const mock = createMockServer();
      mod.register(mock);
      const names = mock.tools.map((t) => t.name);
      const unique = new Set(names);
      assert.equal(
        names.length,
        unique.size,
        `${providerName} has duplicate tool names: ${names.filter((n, i) => names.indexOf(n) !== i)}`
      );
    });
  }
});

describe("Cross-provider checks", async () => {
  it("no tool name collisions across all providers", async () => {
    const allNames = [];
    const files = (await readdir(providersDir)).filter(
      (f) => f.endsWith(".js") && !f.endsWith(".test.js")
    );

    for (const file of files) {
      const mod = await import(join(providersDir, file));
      const mock = createMockServer();
      mod.register(mock);
      allNames.push(...mock.tools.map((t) => t.name));
    }

    const seen = new Set();
    const dupes = [];
    for (const name of allNames) {
      if (seen.has(name)) dupes.push(name);
      seen.add(name);
    }

    assert.equal(dupes.length, 0, `Tool name collisions found: ${dupes.join(", ")}`);
    console.log(`  Total tools verified: ${allNames.length}`);
  });

  it("total tool count matches expectations", async () => {
    const files = (await readdir(providersDir)).filter(
      (f) => f.endsWith(".js") && !f.endsWith(".test.js")
    );

    let total = 0;
    for (const file of files) {
      const mod = await import(join(providersDir, file));
      const mock = createMockServer();
      mod.register(mock);
      total += mock.tools.length;
    }

    assert.ok(total >= 300, `Expected 300+ tools, got ${total}`);
    console.log(`  ${files.length} providers, ${total} tools`);
  });
});
