import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GlossaryTooltip, glossaryEntries } from "@/components/ui/Glossary";

/**
 * Glossary tests:
 *  - Every term requested in the spec is covered.
 *  - Each glossary entry renders the existing InfoTooltip primitive
 *    (a button named by an aria-label).
 *  - The plain-language definition is non-trivial (we assert via the
 *    entry map so the test is independent of Radix's portal mount).
 *  - The term identifier is exposed via `data-glossary` on the
 *    trigger for analytics and tooling.
 */

const REQUIRED_TERMS = [
  "p50",
  "p95",
  "errorRate",
  "uptime",
  "circuitBreaker",
  "modelConfiguration",
  "priorityRouting",
  "arpu",
  "arr",
  "churn",
  "token",
  "rateLimit",
] as const;

describe("Glossary", () => {
  it("exposes every required term in the entries map", () => {
    for (const term of REQUIRED_TERMS) {
      expect(
        glossaryEntries[term],
        `missing glossary entry for "${term}"`,
      ).toBeDefined();
      expect(glossaryEntries[term].label.length).toBeGreaterThan(0);
    }
  });

  it.each(REQUIRED_TERMS)(
    "renders an accessible InfoTooltip trigger for %s",
    (term) => {
      render(<GlossaryTooltip term={term} />);
      const entry = glossaryEntries[term];
      const trigger = screen.getByRole("button", { name: entry.label });
      expect(trigger).toBeInTheDocument();
      // The icon must be aria-hidden so the labelled button is the only
      // announced name.
      const svg = trigger.querySelector("svg");
      expect(svg?.getAttribute("aria-hidden")).toBe("true");
    },
  );

  it.each(REQUIRED_TERMS)(
    "exposes a data-glossary hook on the trigger for %s",
    (term) => {
      const { container } = render(<GlossaryTooltip term={term} />);
      // The hook lives on the always-mounted trigger button so it can
      // be asserted without opening the tooltip.
      const hook = container.querySelector(`[data-glossary="${term}"]`);
      expect(hook).not.toBeNull();
    },
  );

  it("every entry has a non-trivial body (≥ 40 chars of plain text)", () => {
    for (const term of REQUIRED_TERMS) {
      const entry = glossaryEntries[term];
      // Render the body via React's renderToString so we can read the
      // plain text without depending on Radix mounting the portal.
      const { renderToString } = require("react-dom/server");
      const html = renderToString(<>{entry.body}</>);
      // Strip HTML tags to get plain text content.
      const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      expect(text.length, `body for ${term} should be substantial`).toBeGreaterThanOrEqual(40);
    }
  });

  it("rejects unknown terms at the type level", () => {
    // Cast to `any` so we can prove the runtime also throws. The
    // component is essentially `as const` typed so misuse is caught at
    // build time; this test exists to fail loudly if the `as const`
    // ever gets relaxed.
    const Bad = () => <GlossaryTooltip term={"notARealTerm" as any} />;
    expect(() => render(<Bad />)).toThrow();
  });
});
