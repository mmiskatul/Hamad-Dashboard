/**
 * Locale-aware pathname helpers used by the shell (Topbar/Sidebar) and any
 * other surface that needs to reason about the current route.
 *
 * The locale middleware rewrites `/en/admin/...` → `/admin/...` for the
 * app tree, but `usePathname()` may still emit the prefixed form in some
 * contexts (e.g. when the helper is invoked from a layout that received
 * the original URL). The helpers below therefore always normalise the
 * pathname before splitting it into segments.
 */

/**
 * Strip a leading `/en` or `/ar` segment from a path. Safe to call on
 * already-rewritten paths (no-op) and on the root locale (`/en` → `/`).
 */
export function stripLocalePrefix(path: string): string {
  if (!path) return "/";
  const match = path.match(/^\/(en|ar)(?=\/|$)/i);
  if (!match) return path;
  const rest = path.slice(match[0].length);
  return rest === "" ? "/" : rest;
}

/**
 * Ensure the path begins with a leading slash. Empty input becomes `/`.
 */
export function normalizePath(path: string): string {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

/**
 * Decode a single URL segment. We tolerate `URIError` for malformed
 * encodings (some browsers surface partial decode failures) and fall back
 * to the raw segment so the breadcrumb/sidebar never render an empty
 * label.
 */
export function decodeSegment(segment: string): string {
  if (!segment) return "";
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/**
 * Return the locale-stripped pathname broken into decoded segments.
 *
 *   getPathSegments("/en/admin/support/abc%201") → ["admin", "support", "abc 1"]
 */
export function getPathSegments(path: string): string[] {
  const normalised = stripLocalePrefix(normalizePath(path));
  if (normalised === "/") return [];
  return normalised.split("/").filter(Boolean).map(decodeSegment);
}

/**
 * Build the locale-stripped pathname matching the path's segments.
 * Trailing slashes are collapsed so equality checks stay stable.
 */
export function getPathname(path: string): string {
  const segments = getPathSegments(path);
  return "/" + segments.join("/");
}

/**
 * Locale-aware active-link matcher.
 *
 * The shell sidebar uses the *href* of each nav item to decide which item
 * to highlight. A naive `pathname.startsWith(href)` produces two bugs:
 *
 *   1. With locale prefixes the comparison misses entirely when the
 *      pathname carries `/en` or `/ar`.
 *   2. Prefix collisions light up the wrong parent: for `/admin/usage`
 *      vs. `/admin/config/usage`, the `/admin/usage` href would also
 *      match `/admin/usage` (intended) but `/admin/users` would match
 *      `/admin/users-archive` (unintended).
 *
 * This matcher normalises both inputs to locale-stripped segments and
 * then applies a longest-prefix rule that requires a segment boundary
 * after the href. The root item (`/admin`) is matched as an exact
 * equality only so it doesn't highlight every nested route.
 */
export function isPathActive(pathname: string, href: string): boolean {
  const current = getPathSegments(pathname);
  const target = getPathSegments(href);
  if (target.length === 0) return false;

  if (target.length === 1 && target[0] === "admin") {
    // Exact match for the dashboard root so /admin/usage doesn't keep
    // Overview highlighted.
    return current.length === 1 && current[0] === "admin";
  }

  if (current.length < target.length) return false;
  for (let i = 0; i < target.length; i += 1) {
    if (current[i] !== target[i]) return false;
  }
  return true;
}

/**
 * Humanize a single decoded segment for display in the breadcrumb.
 *
 *   "tiers"            → "Tiers"
 *   "system-states"    → "System States"
 *   "abc-123"          → "Abc 123"
 *   "9f12-uuid"        → "9f12 Uuid"
 *
 * The result is truncated to keep the topbar from blowing out its width.
 */
export function humanizeSegment(segment: string, maxLength = 24): string {
  if (!segment) return "";
  const spaced = segment.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  const titled = spaced
    .split(" ")
    .map((word) => (word.length === 0 ? "" : word[0].toUpperCase() + word.slice(1)))
    .join(" ");
  if (titled.length <= maxLength) return titled;
  return titled.slice(0, maxLength - 1).trimEnd() + "…";
}

/**
 * Build a `Crumb[]` for the supplied pathname. The leaf is humanized from
 * the raw segment so dynamic IDs (e.g. `/admin/support/[id]`) still render
 * a readable last crumb.
 *
 * Each crumb carries the slice of segments it represents so the shell can
 * render progressive hrefs without recomputing them.
 */
export type Crumb = {
  segment: string;
  label: string;
  href: string;
  isDynamic: boolean;
};

export function buildBreadcrumbs(
  pathname: string,
  labels: Record<string, string> = {},
  options: { humanizeLeaves?: boolean; maxLabelLength?: number } = {},
): Crumb[] {
  const { humanizeLeaves = true, maxLabelLength = 24 } = options;
  const segments = getPathSegments(pathname);
  return segments.map((segment, index) => {
    const isDynamic = looksDynamic(segment);
    const label =
      labels[segment] ?? (humanizeLeaves ? humanizeSegment(segment, maxLabelLength) : segment);
    return {
      segment,
      label,
      href: "/" + segments.slice(0, index + 1).join("/"),
      isDynamic,
    };
  });
}

/**
 * Heuristic: a segment is treated as a dynamic ID when it contains
 * characters typical of UUIDs/Hashids but no latin letter pair in the
 * shape of a real slug, or when it's longer than 24 chars. This stops
 * navigation slugs like `payment-history` from being treated as a key.
 */
export function looksDynamic(segment: string): boolean {
  if (!segment) return false;
  if (segment.length > 24) return true;
  // Pure digits, UUID-shape, or anything that mixes digits with a single
  // dash in odd places.
  if (/^\d+$/.test(segment)) return true;
  if (/^[0-9a-f]{8,}$/i.test(segment)) return true;
  if (/^[a-z0-9]{20,}$/i.test(segment)) return true;
  return false;
}
