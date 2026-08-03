/**
 * Field projection for tool responses.
 *
 * Sports APIs return very wide objects: a single ESPN "teams" call is ~300 KB,
 * of which the useful part (id, name, abbreviation) is under 3 KB. Every byte
 * that reaches an MCP client is spent from the model's context window, so we
 * let the caller name the fields it actually wants.
 *
 * Matching is by key name at any depth, not by fixed path, because these
 * payloads nest the same entity under different envelopes per provider
 * ("sports[].leagues[].teams[].team" on ESPN vs "teams[]" on the NHL API).
 * Naming a key keeps its whole value; branches that match nothing are dropped.
 */

/** Guard against pathological nesting; real payloads stay well under this. */
const MAX_DEPTH = 40;

export function parseFields(raw: string): Set<string> {
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

/**
 * Keep only the named keys, wherever they appear, preserving the surrounding
 * array/object structure. Returns `undefined` when nothing matched, so callers
 * can distinguish "projected to nothing" from "projected to an empty object".
 */
export function projectFields(data: unknown, fields: Set<string>): unknown {
  if (fields.size === 0) return data;
  return walk(data, fields, 0);
}

function walk(node: unknown, fields: Set<string>, depth: number): unknown {
  if (depth > MAX_DEPTH || node === null || typeof node !== "object") return undefined;

  if (Array.isArray(node)) {
    const out: unknown[] = [];
    for (const item of node) {
      // A primitive inside an array can't match a key name, but an array of
      // matched values (e.g. "teams": ["BOS","LAL"]) must survive intact when
      // the array itself was kept by name — that case never reaches here.
      const projected = walk(item, fields, depth + 1);
      if (projected !== undefined) out.push(projected);
    }
    return out.length > 0 ? out : undefined;
  }

  const out: Record<string, unknown> = {};
  let matched = false;
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (fields.has(key)) {
      out[key] = value; // Keep the matched subtree whole.
      matched = true;
      continue;
    }
    const projected = walk(value, fields, depth + 1);
    if (projected !== undefined) {
      out[key] = projected;
      matched = true;
    }
  }
  return matched ? out : undefined;
}
