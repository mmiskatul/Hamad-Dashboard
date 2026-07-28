/**
 * adminProjection — strips any chat content fields from a payload before it
 * reaches a render path. The forbidden key list mirrors §11.4 / §12.3 of the
 * design spec. The privacy gate test fails the build if any unstripped
 * `content` / `messages` / `transcripts` / `body` / `text` slips through.
 *
 * Comparison is case-insensitive so future fixtures can't accidentally slip
 * `Body`, `Content`, etc. past the gate.
 */
const FORBIDDEN = new Set([
  "content",
  "messages",
  "conversations",
  "transcript",
  "transcripts",
  "body",
  "text",
  "attachments_data",
]);

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v);

export function adminProjection<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => adminProjection(item)) as unknown as T;
  }
  if (!isObject(input)) {
    return input;
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (FORBIDDEN.has(k.toLowerCase())) continue;
    out[k] = adminProjection(v);
  }
  return out as T;
}

export const FORBIDDEN_KEYS = FORBIDDEN;
