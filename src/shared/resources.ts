/**
 * MCP Resources — expose the server's own static catalogs as readable,
 * URI-addressable context (separate from tools). Lets a host read the provider
 * list / presets once instead of guessing or spending a tool call.
 *
 * These are STATIC metadata (catalog.ts) — we deliberately do NOT mirror live
 * upstream API data as resources (that's what tools are for).
 */

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { PROVIDER_CATALOG, PRESETS } from "./catalog.js";

function json(uri: URL, data: unknown) {
  return { contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(data, null, 2) }] };
}

export function registerResources(server: McpServer): void {
  // sportshub://providers — the full provider catalog
  server.registerResource(
    "providers",
    "sportshub://providers",
    {
      title: "Provider catalog",
      description: "All Sports Hub providers: key, tool prefix, name, coverage, and required env var (null = no key needed).",
      mimeType: "application/json",
    },
    async (uri) => json(uri, PROVIDER_CATALOG),
  );

  // sportshub://presets — SPORTS_HUB_PROVIDERS presets
  server.registerResource(
    "presets",
    "sportshub://presets",
    {
      title: "Provider presets",
      description: "SPORTS_HUB_PROVIDERS presets mapped to the providers they load. 'free' is the default.",
      mimeType: "application/json",
    },
    async (uri) => json(uri, PRESETS),
  );

  // sportshub://provider/{key} — details for one provider (with key completion)
  server.registerResource(
    "provider",
    new ResourceTemplate("sportshub://provider/{key}", {
      list: undefined,
      complete: {
        key: (value: string) => PROVIDER_CATALOG.map((p) => p.key).filter((k) => k.startsWith(value)),
      },
    }),
    {
      title: "Provider detail",
      description: "Details for one provider by key, e.g. sportshub://provider/espn.",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const raw = variables.key;
      const key = Array.isArray(raw) ? raw[0] : raw;
      const info = PROVIDER_CATALOG.find((p) => p.key === key);
      return json(uri, info ?? { error: `Unknown provider "${key}"`, known: PROVIDER_CATALOG.map((p) => p.key) });
    },
  );
}
