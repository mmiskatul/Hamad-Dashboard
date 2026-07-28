import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { contrastRatio, hexToRgb } from "@/shared/lib/contrast";

/**
 * Pulls every "color-valued" token from tokens.css (those whose value resolves
 * to a hex literal in either :root or [data-theme="dark"]) and asserts the
 * §2.2 semantic text and border pairs hit WCAG AA.
 */

const tokensPath = path.resolve(__dirname, "..", "src", "styles", "tokens.css");
const css = fs.readFileSync(tokensPath, "utf8");

type TokenDef = { name: string; light: string; dark: string };

function readVar(name: string, scope: string): string | undefined {
  const re = new RegExp(`--${name}\\s*:\\s*([^;]+);`);
  const m = scope.match(re);
  return m?.[1]?.trim();
}

const lightSection = css.split('[data-theme="dark"]')[0]!;
const darkSection = css.split('[data-theme="dark"]')[1]!;

function resolve(value: string | undefined, scope: string): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("#")) return value.toLowerCase();
  if (value.startsWith("var(")) {
    const inner = value.slice(4, -1).replace(/^--/, "");
    // Dark overrides reference primitives declared in :root; fall back there.
    const resolved = readVar(inner, scope) ?? readVar(inner, lightSection);
    return resolve(resolved, scope);
  }
  return undefined;
}

const SEMANTIC = [
  "bg-canvas",
  "bg-surface",
  "bg-subtle",
  "bg-surface-inverse",
  "text-primary",
  "text-secondary",
  "text-on-accent",
  "text-on-neutral",
  "text-inverse",
  "border-default",
  "border-strong",
  "border-focus",
  "action-primary",
  "action-neutral",
  "success-text",
  "warning-text",
  "danger-text",
];

function buildTokens(): TokenDef[] {
  return SEMANTIC.map((name) => ({
    name,
    light: resolve(readVar(name, lightSection), lightSection)!,
    dark: resolve(readVar(name, darkSection), darkSection)!,
  })).filter((t) => t.light && t.dark);
}

const tokens = buildTokens();

describe("WCAG contrast for §2.2 semantic tokens", () => {
  it("every semantic token resolves to a hex", () => {
    for (const t of tokens) {
      expect(hexToRgb(t.light)).toHaveLength(3);
      expect(hexToRgb(t.dark)).toHaveLength(3);
    }
  });

  const textPairs = [
    { fg: "text-primary", bg: "bg-canvas" },
    { fg: "text-primary", bg: "bg-surface" },
    { fg: "text-secondary", bg: "bg-canvas" },
    { fg: "text-secondary", bg: "bg-surface" },
    { fg: "text-on-accent", bg: "action-primary" },
    { fg: "text-on-neutral", bg: "action-neutral" },
    { fg: "text-inverse", bg: "bg-surface-inverse" },
    { fg: "success-text", bg: "bg-surface" },
    { fg: "warning-text", bg: "bg-surface" },
    { fg: "danger-text", bg: "bg-surface" },
  ];

  for (const mode of ["light", "dark"] as const) {
    const scope = mode === "light" ? lightSection : darkSection;
    const resolvedPairs = textPairs.map((p) => {
      const fgToken = tokens.find((t) => t.name === p.fg)!;
      const bgToken = tokens.find((t) => t.name === p.bg)!;
      return {
        label: `${mode} ${p.fg}/${p.bg}`,
        fg: mode === "light" ? fgToken.light : fgToken.dark,
        bg: mode === "light" ? bgToken.light : bgToken.dark,
      };
    });
    for (const pair of resolvedPairs) {
      it(`${pair.label} hits ≥ 4.5:1`, () => {
        const ratio = contrastRatio(pair.fg, pair.bg);
        expect(ratio, `${pair.label} = ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
      });
    }

    // Non-text border pairs against bg-surface must hit 3:1.
    // border.default is decorative and exempt (§2.2 footnote).
    const borderPairs = ["border-strong", "border-focus"].map((name) => {
      const t = tokens.find((x) => x.name === name)!;
      const surface = tokens.find((x) => x.name === "bg-surface")!;
      return {
        label: `${mode} ${name}/bg-surface`,
        fg: mode === "light" ? t.light : t.dark,
        bg: mode === "light" ? surface.light : surface.dark,
      };
    });
    for (const pair of borderPairs) {
      it(`${pair.label} hits ≥ 3:1`, () => {
        const ratio = contrastRatio(pair.fg, pair.bg);
        expect(ratio, `${pair.label} = ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(3.0);
      });
    }
  }
});
