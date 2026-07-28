import { describe, expect, it } from "vitest";
import {
  buildBreadcrumbs,
  getPathSegments,
  getPathname,
  humanizeSegment,
  isPathActive,
  stripLocalePrefix,
} from "@/shared/routing/path";

const labels: Record<string, string> = {
  admin: "Overview",
  users: "Users",
  support: "Support",
  config: "Configuration",
  tiers: "Tiers & Quotas",
  usage: "AI Usage & Cost",
  legal: "Legal",
  audit: "Audit Log",
  providers: "Providers",
  "system-states": "System States",
};

describe("shell route helpers", () => {
  it("normalizes locale-prefixed and unprefixed paths", () => {
    expect(stripLocalePrefix("/en/admin/config/tiers")).toBe("/admin/config/tiers");
    expect(stripLocalePrefix("/ar/admin/legal")).toBe("/admin/legal");
    expect(stripLocalePrefix("/admin/providers")).toBe("/admin/providers");
    expect(getPathname("/en/admin/config/usage/")).toBe("/admin/config/usage");
  });

  it("returns every decoded route segment, including the leaf", () => {
    expect(getPathSegments("/en/admin/support/ticket%20123")).toEqual([
      "admin",
      "support",
      "ticket 123",
    ]);
    expect(getPathSegments("/admin/users/user-42")).toEqual(["admin", "users", "user-42"]);
  });

  it.each([
    ["/admin/config/tiers", "/admin/config/tiers"],
    ["/en/admin/config/usage", "/admin/config/usage"],
    ["/admin/support/ticket-123", "/admin/support"],
    ["/ar/admin/users/user-42", "/admin/users"],
    ["/admin/legal", "/admin/legal"],
    ["/admin/audit", "/admin/audit"],
    ["/admin/providers", "/admin/providers"],
  ])("marks %s active for %s", (pathname, href) => {
    expect(isPathActive(pathname, href)).toBe(true);
  });

  it("does not produce segment-prefix collisions", () => {
    expect(isPathActive("/admin/config/usage", "/admin/usage")).toBe(false);
    expect(isPathActive("/admin/users-archive", "/admin/users")).toBe(false);
    expect(isPathActive("/admin/config/tiers", "/admin/config/models")).toBe(false);
    expect(isPathActive("/admin/support", "/admin")).toBe(false);
  });

  it("keeps the root overview item exact", () => {
    expect(isPathActive("/admin", "/admin")).toBe(true);
    expect(isPathActive("/en/admin", "/admin")).toBe(true);
    expect(isPathActive("/admin/system-states", "/admin")).toBe(false);
  });

  it.each([
    ["/admin/config/tiers", ["Overview", "Configuration", "Tiers & Quotas"]],
    ["/en/admin/config/usage", ["Overview", "Configuration", "AI Usage & Cost"]],
    ["/admin/legal", ["Overview", "Legal"]],
    ["/admin/audit", ["Overview", "Audit Log"]],
    ["/admin/providers", ["Overview", "Providers"]],
    ["/admin/system-states", ["Overview", "System States"]],
  ])("builds complete breadcrumb labels for %s", (pathname, expected) => {
    expect(buildBreadcrumbs(pathname, labels).map((crumb) => crumb.label)).toEqual(expected);
  });

  it("preserves and humanizes dynamic route leaves", () => {
    const support = buildBreadcrumbs("/en/admin/support/ticket-123", labels);
    expect(support.map((crumb) => crumb.label)).toEqual(["Overview", "Support", "Ticket 123"]);
    expect(support.at(-1)).toMatchObject({
      segment: "ticket-123",
      href: "/admin/support/ticket-123",
    });

    const user = buildBreadcrumbs("/admin/users/9f12abcd", labels);
    expect(user.map((crumb) => crumb.label)).toEqual(["Overview", "Users", "9f12abcd"]);
    expect(user.at(-1)?.isDynamic).toBe(true);
  });

  it("humanizes slug separators and truncates very long labels", () => {
    expect(humanizeSegment("system_states")).toBe("System States");
    expect(humanizeSegment("a-very-long-dynamic-route-leaf", 16)).toBe("A Very Long Dyn…");
  });
});
