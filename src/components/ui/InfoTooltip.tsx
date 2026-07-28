"use client";
import { Info } from "lucide-react";
import { type ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/components/ui/cn";

/**
 * Accessible inline info tooltip. Wraps Radix Tooltip with a project-styled
 * `i`-button trigger so the abbreviation → long-form mapping (e.g. MRR →
 * Monthly Recurring Revenue) is reachable by hover, focus, and click.
 *
 * Intentionally lightweight: it never changes surrounding layout and it
 * defaults `side="top"` to avoid clipping inside dense cards.
 */
export function InfoTooltip({
  label,
  children,
  side = "top",
  className,
  triggerAttrs,
}: {
  /** Short text shown next to the trigger icon for screen readers. */
  label: string;
  /** Plain-language explanation rendered inside the popover. */
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  /** Extra attributes spread onto the trigger button (e.g. `data-glossary`). */
  triggerAttrs?: Record<string, string | boolean | number | undefined>;
}) {
  return (
    <TooltipProvider delayDuration={150} skipDelayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={label}
            className={cn(
              "inline-flex h-5 w-5 items-center justify-center rounded-full align-middle text-[var(--text-secondary)] transition hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]",
              className,
            )}
            {...triggerAttrs}
          >
            <Info aria-hidden="true" size={12} />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-72 text-start">
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}