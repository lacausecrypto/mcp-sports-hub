/**
 * Tests for the central response pipeline (src/shared/tool-pipeline.ts),
 * field projection (src/shared/projection.ts) and schema slimming
 * (src/shared/slim.ts).
 *
 * These three exist to keep tool output inside a model's context window, so
 * the assertions are about bytes and shape, not just "it ran".
 *
 * Run via: npm test
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, "..", "..", "dist", "shared");
const { projectFields, parseFields } = await import(join(dist, "projection.js"));
const { slimJsonSchema, installSchemaSlimming } = await import(join(dist, "slim.js"));
const { installToolPipeline } = await import(join(dist, "tool-pipeline.js"));
const { toolResult, errorResult, MAX_RESULT_BYTES } = await import(join(dist, "http.js"));

/** Register one tool through the pipeline and return a caller for it. */
function harness(name, handler, shape = {}) {
  const server = new McpServer({ name: "test", version: "0.0.0" });
  const restore = installToolPipeline(server);
  server.tool(name, "a tool", shape, handler);
  restore();
  const reg = server._registeredTools?.[name];
  assert.ok(reg, "tool should be registered");
  return {
    server,
    reg,
    call: (args = {}) => reg.handler(args, {}),
  };
}

describe("field projection", () => {
  it("keeps named keys at any depth and drops the rest", () => {
    const payload = {
      sports: [{ id: "40", junk: "x", leagues: [{ teams: [{ team: { id: "1", name: "Lakers", logos: [1, 2, 3] } }] }] }],
    };
    const out = projectFields(payload, parseFields("name"));
    assert.deepEqual(out, { sports: [{ leagues: [{ teams: [{ team: { name: "Lakers" } }] }] }] });
  });

  it("keeps a matched subtree whole", () => {
    const out = projectFields({ a: { b: { c: 1, d: 2 } } }, parseFields("b"));
    assert.deepEqual(out, { a: { b: { c: 1, d: 2 } } });
  });

  it("returns undefined when nothing matches", () => {
    assert.equal(projectFields({ a: 1 }, parseFields("zzz")), undefined);
  });

  it("is a no-op for an empty field set", () => {
    const payload = { a: 1 };
    assert.equal(projectFields(payload, parseFields("")), payload);
  });

  it("cuts a wide payload by orders of magnitude", () => {
    // Shaped like ESPN's team list: a few useful keys buried in wide records.
    const teams = Array.from({ length: 30 }, (_, i) => ({
      team: {
        id: String(i),
        displayName: `Team ${i}`,
        logos: Array.from({ length: 8 }, (_, j) => ({ href: `https://example.com/${i}/${j}.png`, width: 500, height: 500, alt: "", rel: ["full", "default"] })),
        links: Array.from({ length: 12 }, (_, j) => ({ href: `https://example.com/l/${i}/${j}`, text: "Link", isExternal: false, isPremium: false })),
      },
    }));
    const full = JSON.stringify({ sports: [{ leagues: [{ teams }] }] }).length;
    const slim = JSON.stringify(projectFields({ sports: [{ leagues: [{ teams }] }], }, parseFields("id,displayName"))).length;
    assert.ok(slim < full / 10, `expected >10x reduction, got ${full} -> ${slim}`);
  });
});

describe("schema slimming", () => {
  it("strips $schema and MAX_SAFE_INTEGER bounds, recursively", () => {
    const schema = {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      properties: {
        limit: { type: "integer", exclusiveMinimum: 0, maximum: 9007199254740991 },
        nested: { $schema: "http://json-schema.org/draft-07/schema#", type: "object" },
      },
    };
    slimJsonSchema(schema);
    assert.equal(schema.$schema, undefined);
    assert.equal(schema.properties.limit.maximum, undefined);
    assert.equal(schema.properties.limit.exclusiveMinimum, 0, "real bounds must survive");
    assert.equal(schema.properties.nested.$schema, undefined);
    assert.equal(schema.type, "object", "type must survive");
  });

  it("removes $schema from what tools/list actually emits", async () => {
    const server = new McpServer({ name: "test", version: "0.0.0" });
    server.tool("demo_get_thing", "a tool", { limit: z.number().int().positive().optional() }, async () => toolResult({ ok: true }));
    assert.equal(installSchemaSlimming(server), true, "slimming should install");
    const handler = server.server._requestHandlers.get("tools/list");
    const result = await handler({ method: "tools/list", params: {} }, {});
    const emitted = JSON.stringify(result.tools);
    assert.ok(!emitted.includes("$schema"), "$schema should be gone");
    assert.ok(!emitted.includes("9007199254740991"), "MAX_SAFE bound should be gone");
  });
});

describe("tool pipeline", () => {
  it("adds a fields parameter to every tool", () => {
    const { reg } = harness("demo_get_thing", async () => toolResult({ a: 1 }));
    assert.ok(reg.inputSchema?.shape?.fields, "fields should be injected");
  });

  it("applies projection when fields is passed, and leaves it alone otherwise", async () => {
    const payload = { a: { keep: 1, drop: 2 } };
    const { call } = harness("demo_get_thing", async () => toolResult(payload));

    const plain = await call({});
    assert.deepEqual(JSON.parse(plain.content[0].text), payload);

    const projected = await call({ fields: "keep" });
    assert.deepEqual(JSON.parse(projected.content[0].text), { a: { keep: 1 } });
  });

  it("does not leak the fields argument into the handler", async () => {
    let seen;
    const { call } = harness("demo_get_thing", async (args) => {
      seen = args;
      return toolResult({ ok: true });
    }, { q: z.string().optional() });
    await call({ q: "x", fields: "ok" });
    assert.deepEqual(seen, { q: "x" }, "handler must not receive fields");
  });

  it("explains itself when no field matches instead of returning nothing", async () => {
    const { call } = harness("demo_get_thing", async () => toolResult({ alpha: 1, beta: 2 }));
    const out = await call({ fields: "zzz" });
    assert.match(out.content[0].text, /No field matched/);
    assert.match(out.content[0].text, /alpha, beta/);
  });

  it("caps oversized payloads and keeps the JSON parseable", async () => {
    const big = { items: Array.from({ length: 20000 }, (_, i) => ({ id: i, name: `item-${i}`, blob: "x".repeat(40) })) };
    assert.ok(JSON.stringify(big).length > MAX_RESULT_BYTES, "fixture must exceed the cap");
    const { call } = harness("demo_get_thing", async () => toolResult(big));
    const out = await call({});
    assert.ok(out.content[0].text.length <= MAX_RESULT_BYTES, "payload must fit the cap");
    assert.doesNotThrow(() => JSON.parse(out.content[0].text), "truncated payload must still parse");
    assert.match(out.content[1].text, /Truncated/);
  });

  it("flags a successful response whose lists are all empty", async () => {
    const { call } = harness("demo_get_thing", async () => toolResult({ wildCardIndicator: true, standings: [] }));
    const out = await call({});
    assert.match(out.content[1]?.text ?? "", /every result list is empty/);
  });

  it("flags a suspiciously small payload", async () => {
    const { call } = harness("demo_get_thing", async () => toolResult({ fullViewLink: { text: "Full Standings" } }));
    const out = await call({});
    assert.match(out.content[1]?.text ?? "", /unusually small payload/);
  });

  it("passes errors through untouched", async () => {
    const { call } = harness("demo_get_thing", async () => errorResult("boom"));
    const out = await call({});
    assert.equal(out.isError, true);
    assert.equal(out.content[0].text, "Error: boom");
  });

  it("serializes compactly", async () => {
    const { call } = harness("demo_get_thing", async () => toolResult({ a: 1, b: [1, 2] }));
    const out = await call({});
    assert.equal(out.content[0].text, '{"a":1,"b":[1,2]}', "no pretty-printing on the wire");
  });
});
