/**
 * Central response pipeline for every tool.
 *
 * Same trick as shared/annotations.ts: wrap the public `server.tool` method so
 * all ~400 registrations are treated uniformly instead of editing 41 provider
 * files. This pass does three things a sports aggregator needs and none of the
 * providers should have to reimplement:
 *
 *   1. adds a `fields` parameter to every tool, so a caller can ask for the
 *      three keys it needs instead of the 297 KB ESPN sends for 30 NBA teams;
 *   2. caps the serialized payload, because an uncapped tool result can spend
 *      more of the model's context window than the whole conversation;
 *   3. flags responses that came back successful but empty, which upstream
 *      sports APIs do constantly out of season and which otherwise look to the
 *      model like "this tool works and the answer is nothing".
 */

import { z } from "zod";
import type { McpServer, RegisteredTool } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MAX_RESULT_BYTES, RAW_PAYLOAD } from "./http.js";
import { parseFields, projectFields } from "./projection.js";

/**
 * Deliberately terse. This string is repeated on every one of the ~400 tools,
 * so each character costs ~400 bytes of catalogue: the first draft ran 300
 * characters and added 130 KB, more than the whole slimming pass saves. The
 * full explanation lives in the server instructions and the README instead.
 */
const FIELDS_DESCRIPTION = "Keys to keep (comma-separated).";

/** A payload this small is almost certainly an empty envelope, not an answer. */
const SUSPICIOUSLY_SMALL_BYTES = 150;

type ToolFn = (...args: unknown[]) => RegisteredTool;
type ToolResult = {
  content?: Array<{ type: string; text?: string }>;
  isError?: boolean;
  [RAW_PAYLOAD]?: unknown;
};

function isZodType(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    ("_def" in value || "~standard" in value || "_zod" in value)
  );
}

/**
 * Identify the zod raw-shape argument. It is the plain object immediately
 * before the callback whose values are all zod types (an empty object counts:
 * providers pass `{}` for parameterless tools). Annotation objects, which hold
 * booleans, are rejected by the same test.
 */
function findShapeIndex(args: unknown[], cbIndex: number): number {
  const candidate = args[cbIndex - 1];
  if (
    typeof candidate !== "object" ||
    candidate === null ||
    Array.isArray(candidate)
  ) {
    return -1;
  }
  const values = Object.values(candidate as Record<string, unknown>);
  return values.every(isZodType) ? cbIndex - 1 : -1;
}

// ---------------------------------------------------------------------------
// Response shaping
// ---------------------------------------------------------------------------

/** Collect every array in the payload so we can tell "no results" from "no arrays". */
function arrayStats(node: unknown, depth = 0): { total: number; nonEmpty: number } {
  if (depth > 40 || node === null || typeof node !== "object") return { total: 0, nonEmpty: 0 };
  let total = 0;
  let nonEmpty = 0;
  if (Array.isArray(node)) {
    total += 1;
    if (node.length > 0) nonEmpty += 1;
    for (const item of node) {
      const s = arrayStats(item, depth + 1);
      total += s.total;
      nonEmpty += s.nonEmpty;
    }
    return { total, nonEmpty };
  }
  for (const value of Object.values(node as Record<string, unknown>)) {
    const s = arrayStats(value, depth + 1);
    total += s.total;
    nonEmpty += s.nonEmpty;
  }
  return { total, nonEmpty };
}

function topLevelKeys(node: unknown): string[] {
  if (Array.isArray(node)) return node.length > 0 ? topLevelKeys(node[0]) : [];
  if (node !== null && typeof node === "object") return Object.keys(node as Record<string, unknown>);
  return [];
}

/** Every array in a payload, with the path we'd describe it by. */
function collectArrays(node: unknown, out: unknown[][] = [], depth = 0): unknown[][] {
  if (depth > 40 || node === null || typeof node !== "object") return out;
  if (Array.isArray(node)) {
    out.push(node);
    for (const item of node) collectArrays(item, out, depth + 1);
    return out;
  }
  for (const value of Object.values(node as Record<string, unknown>)) {
    collectArrays(value, out, depth + 1);
  }
  return out;
}

/** Serialized length of `node`, recording every array with its own serialized length. O(n), no string building. */
function measure(node: unknown, out: Array<{ list: unknown[]; bytes: number }>, depth = 0): number {
  if (node === null || typeof node !== "object" || depth > 40) return (JSON.stringify(node) ?? "null").length;
  if (Array.isArray(node)) {
    let bytes = 2 + Math.max(0, node.length - 1);
    for (const item of node) bytes += measure(item, out, depth + 1);
    out.push({ list: node, bytes });
    return bytes;
  }
  let bytes = 2;
  let first = true;
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (value === undefined || typeof value === "function") continue;
    bytes += (first ? 0 : 1) + JSON.stringify(key).length + 1 + measure(value, out, depth + 1);
    first = false;
  }
  return bytes;
}

/**
 * Serialize within budget, always as valid JSON.
 *
 * Each pass halves the list that weighs the most in bytes (not the one with the most items: ESPN nests hundreds
 * of 2-item lists — linescores, competitors — under a 6-item `events`, and halving those first dropped one team
 * of every game while barely shrinking the payload). The heaviest list is in practice the main result list, so
 * whole items go and the ones kept stay complete. A payload with no list left to shrink is replaced by a
 * parseable stub naming its keys — never a mid-object string cut.
 */
function serializeCapped(payload: unknown): { text: string; note?: string } {
  let text = JSON.stringify(payload) ?? "null";
  if (text.length <= MAX_RESULT_BYTES) return { text };

  const keys = topLevelKeys(payload);
  const hint = `Pass "fields" to keep only the keys you need` +
    (keys.length > 0 ? ` (top-level keys: ${keys.slice(0, 25).join(", ")})` : "") + `, or narrow the query.`;

  let working: unknown;
  try {
    working = structuredClone(payload);
  } catch {
    working = undefined;
  }

  if (working !== undefined) {
    const originalCount = collectArrays(payload).reduce((n, a) => n + a.length, 0);
    for (let pass = 0; pass < 256; pass++) {
      const lists: Array<{ list: unknown[]; bytes: number }> = [];
      if (measure(working, lists) <= MAX_RESULT_BYTES) break;
      const pool = lists.filter((entry) => entry.list.length > 1);
      const candidates = pool.length > 0 ? pool : lists.filter((entry) => entry.list.length === 1);
      if (candidates.length === 0) break;
      const heaviest = candidates.reduce((a, b) => (b.bytes > a.bytes ? b : a));
      heaviest.list.length = Math.floor(heaviest.list.length / 2);
    }
    text = JSON.stringify(working) ?? "null";
    if (text.length <= MAX_RESULT_BYTES) {
      const kept = collectArrays(working).reduce((n, a) => n + a.length, 0);
      return { text, note: `Truncated to fit ${MAX_RESULT_BYTES} bytes: ${kept} of ${originalCount} list items shown (whole items dropped from the largest lists). ${hint}` };
    }
  }

  return {
    text: JSON.stringify({ truncated: true, bytes: (JSON.stringify(payload) ?? "").length, topLevelKeys: keys.slice(0, 60) }),
    note: `The response (${MAX_RESULT_BYTES}+ bytes) could not be shrunk into a valid excerpt. ${hint}`,
  };
}

function shapeResult(result: ToolResult, fields: string | undefined, toolName: string): ToolResult {
  if (result?.isError) return result;

  const first = result?.content?.[0];
  if (!first || first.type !== "text" || typeof first.text !== "string") return result;

  // Prefer the un-serialized payload; fall back to reparsing for any provider
  // that builds its content by hand rather than through toolResult().
  let payload: unknown = result[RAW_PAYLOAD];
  if (payload === undefined) {
    try {
      payload = JSON.parse(first.text);
    } catch {
      return result; // Not JSON (e.g. a CSV passthrough) — leave it alone.
    }
  }

  const notes: string[] = [];

  if (fields) {
    const wanted = parseFields(fields);
    const projected = projectFields(payload, wanted);
    if (projected === undefined) {
      const keys = topLevelKeys(payload);
      return {
        content: [
          {
            type: "text",
            text:
              `No field matched ${JSON.stringify([...wanted])} in the ${toolName} response. ` +
              (keys.length > 0
                ? `Top-level keys available: ${keys.slice(0, 40).join(", ")}. `
                : "") +
              `Re-run without "fields" to inspect the shape, then narrow.`,
          },
        ],
      };
    }
    payload = projected;
  }

  const { text, note } = serializeCapped(payload);
  if (note) notes.push(note);

  const stats = arrayStats(payload);
  if (stats.total > 0 && stats.nonEmpty === 0) {
    notes.push(
      "The request succeeded but every result list is empty. This usually means the season, " +
        "date or league filter has no data rather than a bad tool — try a different date or season.",
    );
  } else if (text.length < SUSPICIOUSLY_SMALL_BYTES && !fields) {
    notes.push(
      "The upstream API returned an unusually small payload for this endpoint. It may not carry " +
        "data for the requested sport/league combination.",
    );
  }

  // Blocks after the first are provider advisories (quota usage, warnings): kept as they are.
  const extra = (result.content ?? []).slice(1) as Array<{ type: string; text: string }>;
  const content: Array<{ type: string; text: string }> = [{ type: "text", text }, ...extra];
  if (notes.length > 0) content.push({ type: "text", text: `[sports-hub] ${notes.join(" ")}` });
  return { content };
}

// ---------------------------------------------------------------------------
// Install
// ---------------------------------------------------------------------------

/**
 * Wrap `server.tool` so every subsequent registration gains the `fields`
 * parameter and the response pipeline. Returns a finalizer that restores the
 * original method; call it after all providers have registered.
 */
export function installToolPipeline(server: McpServer): () => void {
  const target = server as unknown as { tool: ToolFn };
  const original = target.tool.bind(server) as ToolFn;

  target.tool = (...args: unknown[]): RegisteredTool => {
    let cbIndex = -1;
    for (let i = args.length - 1; i >= 0; i--) {
      if (typeof args[i] === "function") {
        cbIndex = i;
        break;
      }
    }
    const shapeIndex = cbIndex > 0 ? findShapeIndex(args, cbIndex) : -1;
    const name = typeof args[0] === "string" ? args[0] : "tool";

    // A registration we don't recognise (no callback, or no zod shape to
    // extend) is passed straight through rather than reshaped blindly.
    if (cbIndex < 0 || shapeIndex < 0) return original(...args);

    const shape = args[shapeIndex] as Record<string, unknown>;
    if ("fields" in shape) return original(...args); // Provider defines its own.

    const next = [...args];
    next[shapeIndex] = { ...shape, fields: z.string().optional().describe(FIELDS_DESCRIPTION) };

    const handler = args[cbIndex] as (params: unknown, extra: unknown) => Promise<ToolResult>;
    next[cbIndex] = async (params: unknown, extra: unknown): Promise<ToolResult> => {
      const { fields, ...rest } = (params ?? {}) as Record<string, unknown>;
      const result = await handler(rest, extra);
      try {
        return shapeResult(result, typeof fields === "string" ? fields : undefined, name);
      } catch {
        return result; // Never let shaping turn a good answer into an error.
      }
    };

    return original(...next);
  };

  return () => {
    target.tool = original;
  };
}
