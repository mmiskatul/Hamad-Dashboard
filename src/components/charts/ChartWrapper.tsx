"use client";
import { Children, cloneElement, isValidElement, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/components/ui/cn";

type ChartWrapperProps = {
  label: string;
  /** Screen-reader accessible data table. */
  dataTable: ReactNode;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/**
 * Every chart in the dashboard is wrapped in ChartWrapper. The wrapper sets
 * `role="img"` with a descriptive label, hides the chart from AT, and renders
 * an adjacent real `<table class="sr-only">` for screen readers.
 *
 * The wrapper defaults to `w-full` so ResponsiveContainer (used by Recharts
 * charts) has a measurable, non-zero width to fill. Without this, charts that
 * live inside flex/grid parents without an explicit width on the wrapper
 * collapse to 0px and render invisibly. The `w-full` is harmless for charts
 * that don't need a width (e.g. FunnelChart, Sparkline) because they style
 * their own internal layout.
 */
export function ChartWrapper({ label, dataTable, children, className, style }: ChartWrapperProps) {
  // Promote the spec'd <table class="sr-only"> onto the table element itself.
  const srTable = Children.map(dataTable, (child) => {
    if (!isValidElement<{ className?: string }>(child)) return child;
    const existing = (child.props.className ?? "") as string;
    return cloneElement(child, { className: `${existing} _sr-only`.trim() });
  });
  return (
    <div className={cn("w-full", className)} style={style}>
      {/*
        The inner <div role="img"> must receive the same sizing as the outer
        wrapper, because ResponsiveContainer measures its DIRECT parent. If we
        only put `style` on the outer div, the inner div collapses to 0 height
        inside flex/grid parents and the chart renders invisibly.
      */}
      <div
        role="img"
        aria-label={label}
        aria-hidden="false"
        className="w-full"
        style={style}
      >
        {children}
      </div>
      {srTable}
    </div>
  );
}
