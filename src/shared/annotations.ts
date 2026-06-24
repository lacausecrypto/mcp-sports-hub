/**
 * Central tool-metadata pass.
 *
 * Every tool in this server is a read-only, idempotent GET against an external
 * sports API. Rather than annotate 370+ call sites across 37 provider files, we
 * capture the RegisteredTool handles as providers register (by wrapping the
 * public `server.tool` method) and then apply uniform annotations + a friendly
 * title to each via the public `RegisteredTool.update()` API.
 *
 * MCP clients use these hints to skip needless confirmation prompts (readOnly /
 * idempotent) and to display human-friendly titles; several MCP directories
 * also require annotations for listing.
 */

import type { McpServer, RegisteredTool } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";

/** All tools here are read-only lookups; data is external/unbounded (open world). */
export const READ_ONLY_ANNOTATIONS: ToolAnnotations = {
  readOnlyHint: true,
  idempotentHint: true,
  openWorldHint: true,
};

/**
 * Derive a readable title from a prefixed tool name.
 * e.g. "espn_get_scoreboard" -> "espn: Get scoreboard".
 */
export function deriveTitle(name: string): string {
  const i = name.indexOf("_");
  const prefix = i >= 0 ? name.slice(0, i) : name;
  const action = (i >= 0 ? name.slice(i + 1) : "").replace(/_/g, " ").trim();
  if (!action) return prefix;
  return `${prefix}: ${action.charAt(0).toUpperCase()}${action.slice(1)}`;
}

type ToolFn = (...args: unknown[]) => RegisteredTool;
type ToolUpdate = (updates: { title?: string; annotations?: ToolAnnotations }) => void;

/**
 * Wrap `server.tool` so every subsequent registration is captured. Returns a
 * finalizer that applies read-only annotations + a derived title to all captured
 * tools and restores the original method. Call it AFTER all providers register.
 */
export function captureToolAnnotations(server: McpServer): () => void {
  const handles: Array<{ name: string; reg: RegisteredTool }> = [];
  const target = server as unknown as { tool: ToolFn };
  const original = target.tool.bind(server) as ToolFn;

  target.tool = (...args: unknown[]): RegisteredTool => {
    const reg = original(...args);
    const name = args[0];
    if (typeof name === "string" && reg && typeof reg.update === "function") {
      handles.push({ name, reg });
    }
    return reg;
  };

  return () => {
    target.tool = original;
    for (const { name, reg } of handles) {
      try {
        (reg.update as ToolUpdate)({ title: deriveTitle(name), annotations: READ_ONLY_ANNOTATIONS });
      } catch {
        // SDK internals changed shape — leave the tool unannotated rather than crash.
      }
    }
  };
}
