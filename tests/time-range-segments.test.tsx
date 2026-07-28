import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { TimeRangeSegments, type CustomRange } from "@/features/overview/TimeRangeSegments";
import en from "@/shared/i18n/messages/en.json";

function renderSegments(props: Partial<Parameters<typeof TimeRangeSegments>[0]> = {}) {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <TimeRangeSegments onChange={vi.fn()} {...props} />
    </NextIntlClientProvider>,
  );
}

describe("TimeRangeSegments", () => {
  it("renders all four range options including custom", () => {
    renderSegments();
    expect(screen.getByRole("button", { name: "24h" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "7d" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "30d" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Custom" })).not.toBeNull();
  });

  it("selects the active range", () => {
    renderSegments({ value: "7d" });
    expect(screen.getByRole("button", { name: "7d" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "24h" }).getAttribute("aria-pressed")).toBe("false");
  });

  it("notifies the parent when a preset is selected", () => {
    const onChange = vi.fn();
    renderSegments({ value: "7d", onChange });
    fireEvent.click(screen.getByRole("button", { name: "30d" }));
    expect(onChange).toHaveBeenCalledWith("30d");
  });

  it("reveals the date inputs when custom is selected", () => {
    renderSegments({ value: "custom" });
    const fromInput = screen.getByLabelText("Start date");
    const toInput = screen.getByLabelText("End date");
    expect(fromInput).not.toBeNull();
    expect(toInput).not.toBeNull();
  });

  it("applies a valid custom range", () => {
    const onCustomApply = vi.fn();
    const onChange = vi.fn();
    renderSegments({ value: "custom", onChange, onCustomApply });
    const fromInput = screen.getByLabelText("Start date") as HTMLInputElement;
    const toInput = screen.getByLabelText("End date") as HTMLInputElement;
    fireEvent.change(fromInput, { target: { value: "2026-07-01" } });
    fireEvent.change(toInput, { target: { value: "2026-07-25" } });
    const applyBtn = screen.getByRole("button", { name: "Apply" }) as HTMLButtonElement;
    expect(applyBtn.disabled).toBe(false);
    fireEvent.click(applyBtn);
    expect(onCustomApply).toHaveBeenCalledWith({
      from: "2026-07-01",
      to: "2026-07-25",
    } satisfies CustomRange);
    expect(onChange).toHaveBeenCalledWith("custom");
  });

  it("disables apply when the range is invalid", () => {
    renderSegments({ value: "custom", onCustomApply: vi.fn() });
    const fromInput = screen.getByLabelText("Start date") as HTMLInputElement;
    const toInput = screen.getByLabelText("End date") as HTMLInputElement;
    fireEvent.change(fromInput, { target: { value: "2026-07-25" } });
    fireEvent.change(toInput, { target: { value: "2026-07-01" } });
    const applyBtn = screen.getByRole("button", { name: "Apply" }) as HTMLButtonElement;
    expect(applyBtn.disabled).toBe(true);
  });
});