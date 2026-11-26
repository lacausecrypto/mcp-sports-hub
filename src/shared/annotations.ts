/**
 * Central tool-metadata pass.
 *
 * Capture each sports-data tool at registration and apply a readable title and
 * its MCP hints. A credit-consuming lookup has an account side effect even
 * when the upstream resource is retrieved by GET.
 */

import type { McpServer, RegisteredTool } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";

/** Default hints for read-only lookups against external sports data. */
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
        // Repeating a private odds read can debit another account credit.
        const annotations = name === "parlay_get_odds"
          ? { ...READ_ONLY_ANNOTATIONS, readOnlyHint: false, destructiveHint: false, idempotentHint: false }
          : READ_ONLY_ANNOTATIONS;
        (reg.update as ToolUpdate)({ title: deriveTitle(name), annotations });
      } catch {
        // SDK internals changed shape — leave the tool unannotated rather than crash.
      }
    }
  };
}
