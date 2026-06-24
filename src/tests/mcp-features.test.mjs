/**
 * Tests for MCP Resources (catalogs) and Prompts (curated workflows).
 * Registers them on a REAL McpServer and asserts they land in the internal
 * registries — catches SDK shape changes that would silently drop them.
 *
 * Run via: npm test
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const shared = (p) => join(__dirname, "..", "..", "dist", "shared", p);
const { registerResources } = await import(shared("resources.js"));
const { registerPrompts } = await import(shared("prompts.js"));

describe("MCP resources & prompts", () => {
  it("registers the provider/preset catalog resources", () => {
    const server = new McpServer({ name: "t", version: "0.0.0" });
    registerResources(server);
    const res = server._registeredResources ?? {};
    const tpl = server._registeredResourceTemplates ?? {};
    assert.ok(res["sportshub://providers"], "providers resource should be registered");
    assert.ok(res["sportshub://presets"], "presets resource should be registered");
    assert.ok(Object.keys(tpl).length >= 1, "provider resource template should be registered");
  });

  it("registers all curated prompts", () => {
    const server = new McpServer({ name: "t", version: "0.0.0" });
    registerPrompts(server);
    const prompts = server._registeredPrompts ?? {};
    for (const name of ["whats-on-today", "compare-odds", "motorsport-weekend", "league-standings", "team-deep-dive", "f1-race"]) {
      assert.ok(prompts[name], `prompt "${name}" should be registered`);
    }
  });
});
