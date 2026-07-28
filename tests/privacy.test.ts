import { describe, expect, it } from "vitest";
import { adminProjection, FORBIDDEN_KEYS } from "@/shared/lib/privacy";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.resolve(__dirname, "..", "src", "data");
const FILES = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));

describe("adminProjection", () => {
  it("strips forbidden keys at the top level", () => {
    const result = adminProjection({ id: "x", content: "leaked", body: "x", text: "x" });
    expect(result).toEqual({ id: "x" });
  });

  it("strips forbidden keys nested inside objects and arrays", () => {
    const result = adminProjection({
      id: "x",
      nested: { messages: ["hi"], ok: true },
      list: [{ content: "nope", ok: "yes" }],
    });
    expect(result).toEqual({ id: "x", nested: { ok: true }, list: [{ ok: "yes" }] });
  });

  it("does not touch non-forbidden keys", () => {
    expect(adminProjection({ a: 1, b: "ok", c: [1, 2, 3] })).toEqual({ a: 1, b: "ok", c: [1, 2, 3] });
  });

  it("strips forbidden keys regardless of case", () => {
    expect(adminProjection({ Content: "leak", BODY: "x", Messages: ["hi"] })).toEqual({});
  });
});

describe("dummy data files", () => {
  for (const file of FILES) {
    it(`${file} contains no forbidden keys at any depth`, () => {
      const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));
      const leaks: string[] = [];
      const walk = (node: unknown, trail: string) => {
        if (Array.isArray(node)) {
          node.forEach((item, i) => walk(item, `${trail}[${i}]`));
          return;
        }
        if (node && typeof node === "object") {
          for (const [k, v] of Object.entries(node)) {
            if (FORBIDDEN_KEYS.has(k)) leaks.push(`${trail}.${k}`);
            walk(v, `${trail}.${k}`);
          }
        }
      };
      walk(raw, file);
      expect(leaks, `Forbidden keys leaked in ${file}: ${leaks.join(", ")}`).toEqual([]);
    });
  }

  it("manually leaking 'content' fails the gate", () => {
    const bad = { id: "x", content: "should fail" };
    const projected = adminProjection(bad) as Record<string, unknown>;
    expect(projected.content).toBeUndefined();
    expect(Object.keys(projected)).toEqual(["id"]);
  });
});
