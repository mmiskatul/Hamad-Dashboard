import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/shared/i18n/messages/en.json";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

// Mock the API hooks so the page renders without needing a backend.
vi.mock("@/shared/api/queries", () => ({
  useConfigModels: () => ({
    data: [
      { id: "gpt", label: "OpenAI", enabled: true, affectedUsers: 0, includedInTiers: ["pro"] },
      { id: "gemini", label: "Gemini", enabled: true, affectedUsers: 0, includedInTiers: ["pro"] },
    ],
  }),
  useConfigTiers: () => ({
    data: [
      {
        id: "free",
        name: "Free",
        monthlyUsd: 0,
        requestsLimit: 100,
        tokensLimit: 100_000,
        models: ["gpt"],
        features: { fileUpload: false, voice: false, priority: false },
      },
      {
        id: "pro",
        name: "Pro",
        monthlyUsd: 19,
        requestsLimit: 5000,
        tokensLimit: 5_000_000,
        models: ["gpt", "gemini"],
        features: { fileUpload: true, voice: false, priority: true },
      },
    ],
  }),
  usePlanDefaults: () => ({ data: null }),
  useUpdateTiers: () => ({ mutateAsync: vi.fn() }),
}));

import ModelsPage from "@/app/(admin)/admin/config/models/page";
import TiersPage from "@/app/(admin)/admin/config/tiers/page";

function withIntl(node: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      {node}
    </NextIntlClientProvider>,
  );
}

/**
 * The Model Configuration and Priority Routing headings on
 * /admin/config/models and /admin/config/tiers must each be paired
 * with:
 *  - a plain-language description (≥ 60 chars, plain English) that
 *    explains what the admin is toggling;
 *  - an accessible glossary tooltip carrying the matching term
 *    (`modelConfiguration` / `priorityRouting`).
 */

describe("Config pages — plain-language descriptions", () => {
  it("Models page: renders a model configuration description and tooltip", () => {
    const { container, getAllByText } = withIntl(<ModelsPage />);
    // Heading shows up in the page title and the section card; both
    // should remain visible.
    expect(getAllByText(/Model Configuration/i).length).toBeGreaterThanOrEqual(2);
    // Plain-language description beside the heading.
    const description = container.querySelector(
      "[data-config-description=\"modelConfiguration\"]",
    );
    expect(description).not.toBeNull();
    expect(description!.textContent?.trim().length ?? 0).toBeGreaterThanOrEqual(60);
    // The visible description text is plain English (no nested <table> or
    // unintentionally rendered chart component).
    expect(description!.textContent).toMatch(/model picker|tier default/i);
    // The glossary tooltip tie-in is present.
    const tooltip = container.querySelector(
      '[data-glossary="modelConfiguration"]',
    );
    expect(tooltip).not.toBeNull();
  });

  it("Tiers page: renders a priority routing description and tooltip", () => {
    const { container } = withIntl(<TiersPage />);
    const description = container.querySelector(
      "[data-config-description=\"priorityRouting\"]",
    );
    expect(description).not.toBeNull();
    expect(description!.textContent?.trim().length ?? 0).toBeGreaterThanOrEqual(60);
    expect(description!.textContent).toMatch(/priority routing|queue|congested/i);
    const tooltip = container.querySelector(
      '[data-glossary="priorityRouting"]',
    );
    expect(tooltip).not.toBeNull();
  });
});
