import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import users from "@/data/users.json";
import userDetails from "@/data/user-details.json";
import type { UserDetail } from "@/shared/api/types";

type UserDetailFixture = UserDetail;

const detailById = new Map<string, UserDetailFixture>(
  (userDetails as UserDetailFixture[]).map((u) => [u.id, u]),
);

describe("user detail tabs / real data routing", () => {
  it("users.json and user-details.json cover the same id set", () => {
    const userIds = new Set(users.map((u) => u.id));
    const detailIds = new Set((userDetails as UserDetailFixture[]).map((u) => u.id));
    expect(userIds.size).toBe(60);
    expect(detailIds.size).toBe(60);
    for (const id of userIds) {
      expect(detailIds.has(id), `missing detail for ${id}`).toBe(true);
    }
    for (const id of detailIds) {
      expect(userIds.has(id), `detail for unknown id ${id}`).toBe(true);
    }
  });

  it("every seeded user has a fully-populated UserDetail payload", () => {
    for (const u of users) {
      const d = detailById.get(u.id);
      expect(d, `detail for ${u.id} not found`).toBeDefined();
      // Quota + usage
      expect(d!.requestsUsed).toBeTypeOf("number");
      expect(d!.requestsLimit).toBeTypeOf("number");
      // Models
      const dist = d!.modelDistribution;
      for (const k of ["gpt", "gemini", "claude", "grok", "deepseek", "perplexity"] as const) {
        expect(dist[k], `model share for ${u.id} (${k})`).toBeTypeOf("number");
        expect(dist[k]).toBeGreaterThanOrEqual(0);
      }
      // Payments, quota, renewals — arrays present, may be empty
      expect(Array.isArray(d!.paymentHistory)).toBe(true);
      expect(Array.isArray(d!.quotaHistory)).toBe(true);
      expect(Array.isArray(d!.renewals)).toBe(true);
      // Activity timeline is always present
      expect(Array.isArray(d!.actionTimeline)).toBe(true);
      // Memory may be undefined; if present, count/bytesUsed are numeric
      if (d!.memory) {
        expect(d!.memory.count).toBeTypeOf("number");
        expect(d!.memory.bytesUsed).toBeTypeOf("number");
      }
    }
  });

  it("at least some users have non-empty payments / quota / activity history", () => {
    const withPayments = (userDetails as UserDetailFixture[]).filter((u) => u.paymentHistory.length > 0).length;
    const withQuota = (userDetails as UserDetailFixture[]).filter((u) => u.quotaHistory.length > 0).length;
    const withRenewals = (userDetails as UserDetailFixture[]).filter((u) => u.renewals.length > 0).length;
    const withActivity = (userDetails as UserDetailFixture[]).filter((u) => (u.actionTimeline ?? []).length > 0).length;
    // Coverage sufficient so the tabs render real data for most users.
    expect(withPayments).toBeGreaterThan(0);
    expect(withRenewals).toBeGreaterThan(0);
    expect(withQuota).toBeGreaterThan(0);
    expect(withActivity).toBeGreaterThan(0);
  });

  it("removed components no longer appear in the user-detail page", () => {
    const page = readFileSync(
      join(process.cwd(), "src/app/(admin)/admin/users/[id]/page.tsx"),
      "utf8",
    );
    expect(page).not.toMatch(/QuotaOverrideModal/);
    expect(page).not.toMatch(/extendQuota/);
  });

  it("the historical QuotaHistory display remains available to the Quota tab", () => {
    const page = readFileSync(
      join(process.cwd(), "src/app/(admin)/admin/users/[id]/page.tsx"),
      "utf8",
    );
    expect(page).toMatch(/QuotaHistory/);
    expect(page).toMatch(/quotaHistory/);
  });

  it("the account page no longer renders RecoveryCodes", () => {
    const page = readFileSync(
      join(process.cwd(), "src/app/(admin)/admin/account/page.tsx"),
      "utf8",
    );
    expect(page).not.toMatch(/RecoveryCodes/);
    const recoveryCodesPath = join(process.cwd(), "src/features/account/RecoveryCodes.tsx");
    let exists = true;
    try {
      readFileSync(recoveryCodesPath, "utf8");
    } catch {
      exists = false;
    }
    expect(exists, "RecoveryCodes.tsx should be deleted").toBe(false);
  });

  it("the QuotaOverrideModal component is deleted", () => {
    const modalPath = join(process.cwd(), "src/components/modals/QuotaOverrideModal.tsx");
    let exists = true;
    try {
      readFileSync(modalPath, "utf8");
    } catch {
      exists = false;
    }
    expect(exists, "QuotaOverrideModal.tsx should be deleted").toBe(false);
  });
});
