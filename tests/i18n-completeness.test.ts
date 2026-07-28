import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import en from "@/shared/i18n/messages/en.json";
import ar from "@/shared/i18n/messages/ar.json";

type Messages = Record<string, unknown>;

function flatten(obj: Messages, prefix = ""): string[] {
  const out: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      out.push(...flatten(value as Messages, next));
    } else {
      out.push(next);
    }
  }
  return out;
}

/**
 * Walk `src/` recursively and return every `.ts`/`.tsx` file path.
 * We deliberately exclude the message catalogues themselves and the
 * formatting helpers so we only audit code that *consumes* translations.
 */
function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full, out);
    } else if (/\.tsx?$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const SRC = join(process.cwd(), "src");

const enKeys = new Set(flatten(en));
const arKeys = new Set(flatten(ar));

/**
 * Matches `useTranslations(...)` declarations of the form
 *   const <var> = useTranslations("a.b.c")
 *   const <var> = useTranslations<"...">("a.b.c")
 *   const <var> = useTranslations()
 * capturing the local variable name and the namespace string.
 */
const USE_TX_RE =
  /(?:const|let|var)\s+(\w+)\s*=\s*useTranslations(?:<[^>]*>)?\s*\(\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`)?\s*\)/g;

/**
 * Matches a static `tName("…")` / `tName.rich("…")` call. We intentionally
 * only consider string literals that do **not** interpolate, because
 * template-literal keys are dynamic by construction (e.g. `t(\`items.${k}\`)`).
 */
const STATIC_CALL_RE =
  /\b(\w+)(?:\.\w+)?\s*\(\s*["']([^"'`${}]+)["']/g;

/**
 * For every source file, statically enumerate the local variables bound to
 * `useTranslations(...)`, then resolve every subsequent `tName("…")` call into
 * a fully-qualified namespace path.
 *
 * Returns the list of referenced full key paths.
 */
function collectReferencedKeys(): string[] {
  const refs = new Set<string>();
  for (const file of walk(SRC)) {
    const src = readFileSync(file, "utf8");
    const varNs = new Map<string, string>();
    let m: RegExpExecArray | null;
    USE_TX_RE.lastIndex = 0;
    while ((m = USE_TX_RE.exec(src))) {
      const [, name, dq, sq, bq] = m;
      varNs.set(name, dq ?? sq ?? bq ?? "");
    }
    STATIC_CALL_RE.lastIndex = 0;
    while ((m = STATIC_CALL_RE.exec(src))) {
      const [, name, key] = m;
      if (!varNs.has(name)) continue;
      const ns = varNs.get(name) ?? "";
      const full = ns ? `${ns}.${key}` : key;
      refs.add(full);
    }
  }
  return [...refs];
}

describe("i18n completeness", () => {
  it("en.json is non-empty", () => {
    expect(enKeys.size).toBeGreaterThan(10);
  });

  it("ar.json is non-empty", () => {
    expect(arKeys.size).toBeGreaterThan(10);
  });

  it("every key path in en.json exists in ar.json", () => {
    const missing: string[] = [];
    for (const key of enKeys) {
      if (!arKeys.has(key)) missing.push(key);
    }
    expect(missing, `Missing in ar.json: ${missing.join(", ")}`).toEqual([]);
  });

  it("every key path in ar.json exists in en.json", () => {
    const missing: string[] = [];
    for (const key of arKeys) {
      if (!enKeys.has(key)) missing.push(key);
    }
    expect(missing, `Missing in en.json: ${missing.join(", ")}`).toEqual([]);
  });

  it("account.* actions namespace exists in both locales", () => {
    expect(typeof (en as Messages).account).toBe("object");
    expect(typeof (ar as Messages).account).toBe("object");
  });

  it("every statically-referenced t('…') call resolves in en.json", () => {
    const refs = collectReferencedKeys();
    expect(refs.length).toBeGreaterThan(0);
    const missing = refs.filter((k) => !enKeys.has(k));
    expect(
      missing,
      `Keys referenced in src/ but missing in en.json:\n  - ${missing.join("\n  - ")}`,
    ).toEqual([]);
  });

  it("every statically-referenced t('…') call resolves in ar.json", () => {
    const refs = collectReferencedKeys();
    expect(refs.length).toBeGreaterThan(0);
    const missing = refs.filter((k) => !arKeys.has(k));
    expect(
      missing,
      `Keys referenced in src/ but missing in ar.json:\n  - ${missing.join("\n  - ")}`,
    ).toEqual([]);
  });

  it("en.json and ar.json have identical key paths", () => {
    const enList = [...enKeys].sort();
    const arList = [...arKeys].sort();
    expect(arList).toEqual(enList);
  });
});
