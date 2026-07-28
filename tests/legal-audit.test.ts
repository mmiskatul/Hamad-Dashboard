import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { FORBIDDEN_KEYS } from "@/shared/lib/privacy";

const DATA_DIR = path.resolve(__dirname, "..", "src", "data");

function load<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8")) as T;
}

const audit = load<Array<{ action: string; meta?: Record<string, unknown> }>>("audit.json");
const tickets = load<Array<{ id: string }>>("support-tickets.json");
const terms = load<{ versions: Array<{ id: string }> }>("legal-terms.json");
const privacy = load<{ versions: Array<{ id: string }> }>("legal-privacy.json");

const ticketIds = new Set(tickets.map((t) => t.id));
const termsIds = new Set(terms.versions.map((v) => v.id));
const privacyIds = new Set(privacy.versions.map((v) => v.id));

describe("audit cross-references", () => {
  it("every legal.publish references a real versionId", () => {
    const publishes = audit.filter((e) => e.action === "legal.publish");
    expect(publishes.length).toBeGreaterThan(0);
    for (const e of publishes) {
      const meta = e.meta ?? {};
      const docType = meta.docType as string | undefined;
      const versionId = meta.versionId as string | undefined;
      expect(docType, "legal.publish missing docType").toBeDefined();
      expect(versionId, "legal.publish missing versionId").toBeDefined();
      const pool = docType === "terms" ? termsIds : privacyIds;
      expect(pool.has(versionId!), `legal.publish references unknown ${docType} version ${versionId}`).toBe(true);
    }
  });

  it("every legal.restore references a real versionId", () => {
    const restores = audit.filter((e) => e.action === "legal.restore");
    for (const e of restores) {
      const meta = e.meta ?? {};
      const docType = meta.docType as string | undefined;
      const versionId = meta.versionId as string | undefined;
      expect(docType).toBeDefined();
      expect(versionId).toBeDefined();
      const pool = docType === "terms" ? termsIds : privacyIds;
      expect(pool.has(versionId!), `legal.restore references unknown ${docType} version ${versionId}`).toBe(true);
    }
  });

  it("every legal.delete references a real versionId", () => {
    const deletes = audit.filter((e) => e.action === "legal.delete");
    for (const e of deletes) {
      const meta = e.meta ?? {};
      const docType = meta.docType as string | undefined;
      const versionId = meta.versionId as string | undefined;
      expect(docType).toBeDefined();
      expect(versionId).toBeDefined();
      const pool = docType === "terms" ? termsIds : privacyIds;
      expect(pool.has(versionId!), `legal.delete references unknown ${docType} version ${versionId}`).toBe(true);
    }
  });

  it("every support.reply references a real ticketId", () => {
    const replies = audit.filter((e) => e.action === "support.reply");
    expect(replies.length).toBeGreaterThan(0);
    for (const e of replies) {
      const meta = e.meta ?? {};
      const ticketId = meta.ticketId as string | undefined;
      expect(ticketId, "support.reply missing ticketId").toBeDefined();
      expect(ticketIds.has(ticketId!), `support.reply references unknown ticket ${ticketId}`).toBe(true);
    }
  });

  it("every support.close references a real ticketId", () => {
    const closes = audit.filter((e) => e.action === "support.close");
    for (const e of closes) {
      const meta = e.meta ?? {};
      const ticketId = meta.ticketId as string | undefined;
      expect(ticketId).toBeDefined();
      expect(ticketIds.has(ticketId!), `support.close references unknown ticket ${ticketId}`).toBe(true);
    }
  });

  it("audit.json contains no forbidden keys at any depth", () => {
    const walk = (node: unknown, trail: string, acc: string[]) => {
      if (Array.isArray(node)) {
        node.forEach((item, i) => walk(item, `${trail}[${i}]`, acc));
        return;
      }
      if (node && typeof node === "object") {
        for (const [k, v] of Object.entries(node)) {
          if (FORBIDDEN_KEYS.has(k)) acc.push(`${trail}.${k}`);
          walk(v, `${trail}.${k}`, acc);
        }
      }
    };
    const leaks: string[] = [];
    walk(audit, "audit.json", leaks);
    expect(leaks).toEqual([]);
  });
});