/**
 * Tests for SPORTS_HUB_PROVIDERS resolution (shared/catalog.ts).
 *
 * A provider selected twice registers its tools twice, and the MCP SDK throws
 * on the duplicate tool name — so the resolved list must never repeat a
 * provider, and must honour exclusions even when includes are also present.
 *
 * Run via: npm test
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { PRESETS, PROVIDER_CATALOG, resolveProviders } = await import(
  join(__dirname, "..", "..", "dist", "shared", "catalog.js")
);

// Stand-in for the registry in index.ts — same keys, same order.
const KEYS = PROVIDER_CATALOG.map((p) => p.key);

const resolve = (env) => resolveProviders(env, KEYS);

describe("resolveProviders", () => {
  const cases = [
    ["unset falls back to the free preset", undefined, PRESETS["free"]],
    ["blank falls back to the free preset", "  ", PRESETS["free"]],
    ["'all' selects every provider", "all", KEYS],
    ["a bare preset name expands to that preset", "us-major", PRESETS["us-major"]],
    ["a provider list is kept in order", "espn,nhl,odds", ["espn", "nhl", "odds"]],
    ["unknown names are dropped", "espn,not-a-provider,nhl", ["espn", "nhl"]],
    ["whitespace around names is ignored", " espn , nhl ", ["espn", "nhl"]],

    // Overlapping presets: "us-major" and "soccer" both contain espn.
    [
      "overlapping presets select each provider once",
      "us-major,soccer",
      [...PRESETS["us-major"], ...PRESETS["soccer"].filter((p) => p !== "espn")],
    ],
    [
      "a preset plus one of its own members selects it once",
      "soccer,espn",
      PRESETS["soccer"],
    ],
    ["a repeated provider name is selected once", "espn,espn", ["espn"]],

    // Exclusions.
    [
      "exclusions alone remove from the full set",
      "-espn,-nhl",
      KEYS.filter((p) => p !== "espn" && p !== "nhl"),
    ],
    [
      "exclusions apply to an included preset",
      "free,-espn",
      PRESETS["free"].filter((p) => p !== "espn"),
    ],
    [
      "exclusions apply to an included provider list",
      "espn,nhl,-nhl",
      ["espn"],
    ],
  ];

  for (const [name, env, expected] of cases) {
    it(name, () => {
      assert.deepEqual(resolve(env), expected);
    });
  }

  it("never returns the same provider twice", () => {
    for (const [, env] of cases) {
      const selected = resolve(env);
      assert.equal(
        selected.length,
        new Set(selected).size,
        `SPORTS_HUB_PROVIDERS=${env} resolved to a list with duplicates: ${selected}`
      );
    }
  });

  it("only ever returns known providers", () => {
    const known = new Set(KEYS);
    for (const [, env] of cases) {
      for (const p of resolve(env)) {
        assert.ok(known.has(p), `SPORTS_HUB_PROVIDERS=${env} selected unknown provider "${p}"`);
      }
    }
  });
});
