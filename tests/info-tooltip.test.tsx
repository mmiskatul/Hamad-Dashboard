import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

describe("InfoTooltip", () => {
  it("renders an accessible trigger button with the provided label", () => {
    render(
      <InfoTooltip label="About MRR">
        Monthly Recurring Revenue.
      </InfoTooltip>,
    );
    const trigger = screen.getByRole("button", { name: "About MRR" });
    expect(trigger).not.toBeNull();
    // The popover content is mounted lazily; in the default collapsed
    // state the body is in the DOM but hidden, so we only assert the
    // trigger semantics here.
    expect(trigger.getAttribute("aria-label")).toBe("About MRR");
  });

  it("renders the icon aria-hidden so the label is the only announced name", () => {
    const { container } = render(
      <InfoTooltip label="Tokens">
        Total tokens billed.
      </InfoTooltip>,
    );
    const icon = container.querySelector("svg");
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
  });
});