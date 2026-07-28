"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/components/ui/cn";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export type TimeRangeValue = "24h" | "7d" | "30d" | "custom";

export type CustomRange = { from: string; to: string };

/**
 * Canonical time-range picker used by the Overview and Usage pages.
 *
 * Renders a 4-option segmented control (24h / 7d / 30d / Custom). When the
 * user picks Custom, expandable date inputs and an Apply button appear so
 * the parent can consume a {@link CustomRange}. The selected value is
 * always surfaced via `onChange` so callers can derive a `days` window and
 * pass it through to downstream queries.
 *
 * The component is fully controlled. Pass `value` plus `onChange` (and
 * optionally `customRange` plus `onCustomApply`) for shared state. If you
 * omit those, the component falls back to internal state and behaves like
 * a one-off picker.
 */
export function TimeRangeSegments({
  value,
  onChange,
  customRange,
  onCustomApply,
}: {
  value?: TimeRangeValue;
  onChange?: (v: TimeRangeValue) => void;
  customRange?: CustomRange;
  onCustomApply?: (range: CustomRange) => void;
}) {
  const t = useTranslations("overview");
  const tCommon = useTranslations("common");
  const [internal, setInternal] = useState<TimeRangeValue>("7d");
  const [from, setFrom] = useState(customRange?.from ?? "");
  const [to, setTo] = useState(customRange?.to ?? "");
  const v = value ?? internal;
  const opts: { id: TimeRangeValue; label: string }[] = [
    { id: "24h", label: t("range24h") },
    { id: "7d", label: t("range7d") },
    { id: "30d", label: t("range30d") },
    { id: "custom", label: t("rangeCustom") },
  ];

  const applyCustom = () => {
    if (!from || !to) return;
    onCustomApply?.({ from, to });
    setInternal("custom");
    onChange?.("custom");
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        role="group"
        aria-label={t("range")}
        className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-subtle)] p-1"
      >
        {opts.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={v === o.id}
            onClick={() => {
              setInternal(o.id);
              onChange?.(o.id);
            }}
            className={cn(
              "rounded-[var(--radius-xs)] px-3 py-1.5 text-sm font-medium transition",
              v === o.id
                ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--e1)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>

      {v === "custom" && (
        <div className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--bg-subtle)] p-1.5">
          <Calendar aria-hidden="true" size={14} className="ms-1 text-[var(--text-secondary)]" />
          <label className="sr-only" htmlFor="tr-from">
            {t("rangeFrom")}
          </label>
          <Input
            id="tr-from"
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => setFrom(e.target.value)}
            className="h-8 w-40 border-0 bg-transparent px-2 text-sm shadow-none focus-visible:outline-none"
          />
          <span aria-hidden="true" className="text-xs text-[var(--text-secondary)]">
            →
          </span>
          <label className="sr-only" htmlFor="tr-to">
            {t("rangeTo")}
          </label>
          <Input
            id="tr-to"
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => setTo(e.target.value)}
            className="h-8 w-40 border-0 bg-transparent px-2 text-sm shadow-none focus-visible:outline-none"
          />
          <Button
            type="button"
            size="sm"
            variant="primary"
            disabled={!from || !to || from > to}
            onClick={applyCustom}
          >
            {tCommon("apply")}
          </Button>
        </div>
      )}
    </div>
  );
}
