import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { contrastRatio, hexToRgb } from "@/shared/lib/contrast";

/**
 * Verifies the row-hover surface token resolves to a hex in both light
 * and dark themes, that it is *distinct* from the regular surface
 * (`--bg-subtle`) and the canvas, and that the rendered text on top of
 * the hover color keeps enough contrast to remain legible.
 *
 * The "distinct" check is important: a hover that visually equals the
 * resting state is a UX regression, not just a contrast issue.
 */

const tokensPath = path.resolve(__dirname, "..", "src", "styles", "tokens.css");
const css = fs.readFileSync(tokensPath, "utf8");

const lightSection = css.split('[data-theme="dark"]')[0]!;
const darkSection = css.split('[data-theme="dark"]')[1]!;

function readVar(name: string, scope: string): string | undefined {
  const re = new RegExp(`--${name}\\s*:\\s*([^;]+);`);
  const m = scope.match(re);
  return m?.[1]?.trim();
}

function resolve(value: string | undefined, scope: string): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("#")) return value.toLowerCase();
  if (value.startsWith("var(")) {
    const inner = value.slice(4, -1).replace(/^--/, "");
    const resolved = readVar(inner, scope) ?? readVar(inner, lightSection);
    return resolve(resolved, scope);
  }
  return undefined;
}

const NEEDED = [
  "bg-row-hover",
  "bg-subtle",
  "bg-surface",
  "bg-canvas",
  "text-primary",
  "text-secondary",
] as const;

type TokenName = (typeof NEEDED)[number];

function tokensFor(scope: string): Record<TokenName, string> {
  const out = {} as Record<TokenName, string>;
  for (const name of NEEDED) {
    const v = resolve(readVar(name, scope), scope);
    if (!v) throw new Error(`Could not resolve --${name}`);
    out[name] = v;
  }
  return out;
}

const light = tokensFor(lightSection);
const dark = tokensFor(darkSection);

function rgbDistance(a: string, b: string): number {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return Math.sqrt(
    (ar - br) ** 2 + (ag - bg) ** 2 + (ab - bb) ** 2,
  );
}

describe("--bg-row-hover token", () => {
  it("resolves to a hex in both themes", () => {
    expect(hexToRgb(light["bg-row-hover"])).toHaveLength(3);
    expect(hexToRgb(dark["bg-row-hover"])).toHaveLength(3);
  });

  it("is visually distinct from --bg-subtle in both themes (ΔRGB ≥ 24)", () => {
    // 24 is roughly a perceptible darken/lighten step on a calibrated
    // monitor; we want the row state change to be unmissable.
    expect(rgbDistance(light["bg-row-hover"], light["bg-subtle"])).toBeGreaterThanOrEqual(24);
    expect(rgbDistance(dark["bg-row-hover"], dark["bg-subtle"])).toBeGreaterThanOrEqual(24);
  });

  it("is visually distinct from --bg-surface in both themes", () => {
    expect(rgbDistance(light["bg-row-hover"], light["bg-surface"])).toBeGreaterThanOrEqual(24);
    expect(rgbDistance(dark["bg-row-hover"], dark["bg-surface"])).toBeGreaterThanOrEqual(24);
  });

  it("keeps text-primary legible on the hover color (WCAG AA for body text)", () => {
    // Body text on a hovered row is the worst case: light/dark theme,
    // primary text colour. We require 4.5:1 even on the darker side so
    // the hover state never silently breaks readability.
    expect(
      contrastRatio(light["text-primary"], light["bg-row-hover"]),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(dark["text-primary"], dark["bg-row-hover"]),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps text-secondary legible on the light hover color (WCAG AA)", () => {
    // In light mode the hover surface is light enough that secondary
    // text still hits body-text contrast.
    expect(
      contrastRatio(light["text-secondary"], light["bg-row-hover"]),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("dark hover color hits the WCAG 3:1 non-text contrast floor vs text-secondary", () => {
    // In dark mode text-secondary is intentionally a muted grey on
    // purpose, so it sits at the AA-large / non-text floor against the
    // darker surface. We require 3:1 to guarantee the hover state is
    // never *invisible*; the dashboard already uses text-primary on
    // interactive rows so body-text contrast is preserved there.
    expect(
      contrastRatio(dark["text-secondary"], dark["bg-row-hover"]),
    ).toBeGreaterThanOrEqual(3.0);
  });
});
