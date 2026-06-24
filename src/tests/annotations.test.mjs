/**
 * Tests for the central read-only annotation pass (src/shared/annotations.ts).
 * Verifies the title derivation and that annotations actually land on a REAL
 * McpServer's registered tools — this catches SDK shape changes that would
 * silently drop the annotations.
 *
 * Run via: npm test
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const annotationsPath = join(__dirname, "..", "..", "dist", "shared", "annotations.js");
const { deriveTitle, captureToolAnnotations } = await import(annotationsPath);

describe("tool annotations", () => {
  it("deriveTitle formats prefixed tool names", () => {
    assert.equal(deriveTitle("espn_get_scoreboard"), "espn: Get scoreboard");
    assert.equal(deriveTitle("sleeper_search_players"), "sleeper: Search players");
    assert.equal(deriveTitle("nhl_get_game_boxscore"), "nhl: Get game boxscore");
    assert.equal(deriveTitle("noprefix"), "noprefix");
  });

  it("applies read-only annotations + title on a real McpServer", () => {
    const server = new McpServer({ name: "test", version: "0.0.0" });
    const finalize = captureToolAnnotations(server);
    server.tool("demo_get_thing", "A demo tool", {}, async () => ({
      content: [{ type: "text", text: "ok" }],
    }));
    finalize();

    // Test-only access to the internal registry to confirm the update() stuck.
    const reg = server._registeredTools?.["demo_get_thing"];
    assert.ok(reg, "tool should be registered");
    assert.equal(reg.annotations?.readOnlyHint, true, "readOnlyHint should be set");
    assert.equal(reg.annotations?.idempotentHint, true, "idempotentHint should be set");
    assert.equal(reg.annotations?.openWorldHint, true, "openWorldHint should be set");
    assert.equal(reg.title, "demo: Get thing", "title should be derived");
  });
});
