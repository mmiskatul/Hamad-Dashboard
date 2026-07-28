import { clsx } from "clsx";
import { cva, type VariantProps } from "class-variance-authority";
import { type HTMLAttributes } from "react";

const badge = cva(
  "inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] px-2 py-0.5 text-[11px] font-medium uppercase leading-4 border border-transparent whitespace-nowrap",
  {
    variants: {
      tone: {
        ok: "text-[var(--success-text)] bg-[var(--success-wash)]",
        warn: "text-[var(--warning-text)] bg-[var(--warning-wash)]",
        bad: "text-[var(--danger-text)] bg-[var(--danger-wash)]",
        neutral: "text-[var(--text-secondary)] bg-[var(--bg-subtle)] border-[var(--border-default)]",
        solid: "text-[var(--text-on-neutral)] bg-[var(--action-neutral)]",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badge> {
  dot?: boolean;
}

export function Badge({ className, tone, dot, children, ...props }: BadgeProps) {
  return (
    <span className={clsx(badge({ tone }), className)} {...props}>
      {dot && (
        <span
          aria-hidden
          className={clsx("h-1.5 w-1.5 rounded-full", {
            "bg-[var(--success)]": tone === "ok",
            "bg-[var(--warning)]": tone === "warn",
            "bg-[var(--danger)]": tone === "bad",
            "bg-[var(--text-secondary)]": !tone || tone === "neutral",
          })}
        />
      )}
      {children}
    </span>
  );
}
