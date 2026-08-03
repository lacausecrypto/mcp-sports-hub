/**
 * Slim the JSON Schemas emitted for tools/list.
 *
 * The zod -> JSON Schema conversion the SDK performs adds two things that no
 * MCP client needs but every client pays for in context:
 *
 *   - a "$schema": "http://json-schema.org/draft-07/schema#" line on each of
 *     the ~400 tools (measured: 27.8 KB of the 244 KB catalog);
 *   - "maximum": 9007199254740991 on every integer, an artifact of
 *     z.number().int() rather than a real bound anyone would hit.
 *
 * Stripping both is behaviour-preserving: validation still happens server-side
 * against the original zod schema, which this never touches.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const JS_MAX_SAFE = 9007199254740991;

/** Mutates `schema` in place. Returns it for convenience. */
export function slimJsonSchema(schema: unknown, depth = 0): unknown {
  if (depth > 40 || schema === null || typeof schema !== "object") return schema;

  if (Array.isArray(schema)) {
    for (const item of schema) slimJsonSchema(item, depth + 1);
    return schema;
  }

  const obj = schema as Record<string, unknown>;
  delete obj.$schema;
  if (obj.maximum === JS_MAX_SAFE) delete obj.maximum;
  if (obj.minimum === -JS_MAX_SAFE) delete obj.minimum;

  for (const key of ["properties", "items", "anyOf", "oneOf", "allOf", "definitions", "$defs"]) {
    if (obj[key] !== undefined) slimJsonSchema(obj[key], depth + 1);
  }
  // "properties" holds a map of name -> subschema; walk its values too.
  if (obj.properties && typeof obj.properties === "object") {
    for (const value of Object.values(obj.properties as Record<string, unknown>)) {
      slimJsonSchema(value, depth + 1);
    }
  }
  return schema;
}

interface ListToolsResult {
  tools?: Array<{ inputSchema?: unknown; outputSchema?: unknown }>;
}
type Handler = (request: unknown, extra: unknown) => Promise<unknown>;

/**
 * Wrap the already-registered tools/list handler so every emitted schema is
 * slimmed on the way out. Must be called AFTER at least one tool is
 * registered, since the SDK installs that handler lazily.
 *
 * Reaches into `_requestHandlers` because the SDK exposes no post-processing
 * hook; if that internal ever changes shape we silently keep the fat schemas
 * rather than break the server.
 */
export function installSchemaSlimming(server: McpServer): boolean {
  try {
    const low = (server as unknown as { server: { _requestHandlers: Map<string, Handler> } }).server;
    const handlers = low?._requestHandlers;
    if (!(handlers instanceof Map)) return false;
    const original = handlers.get("tools/list");
    if (!original) return false;

    handlers.set("tools/list", async (request, extra) => {
      const result = (await original(request, extra)) as ListToolsResult;
      for (const tool of result?.tools ?? []) {
        if (tool.inputSchema) slimJsonSchema(tool.inputSchema);
        if (tool.outputSchema) slimJsonSchema(tool.outputSchema);
      }
      return result;
    });
    return true;
  } catch {
    return false;
  }
}
