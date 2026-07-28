"use client";
import { useRouter } from "next/navigation";
import { type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export function RowLink({
  href,
  children,
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: {
  href: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  const router = useRouter();
  const shouldStop = (event: MouseEvent | KeyboardEvent) => {
    const target = event.target as HTMLElement | null;
    if (!target) return false;
    // Clicks originating from interactive descendants (buttons, links, form
    // controls, ARIA roles that act like buttons, or anything explicitly opted
    // out via [data-row-link-ignore]) must NOT trigger row navigation.
    return Boolean(
      target.closest(
        'button, a, input, select, textarea, summary, [role="button"], [role="link"], [role="menuitem"], [data-row-link-ignore]',
      ),
    );
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (disabled || event.key !== "Enter") return;
    if (shouldStop(event)) return;
    event.preventDefault();
    router.push(href);
  };
  const onClick = (event: MouseEvent<HTMLTableRowElement>) => {
    if (disabled || shouldStop(event)) return;
    router.push(href);
  };
  return (
    <tr
      role="row"
      tabIndex={disabled ? undefined : 0}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={onKeyDown}
      data-row-link
      className={cn(
        "cursor-pointer hover:bg-[var(--bg-row-hover)] focus-visible:bg-[var(--bg-row-hover)]",
        disabled && "cursor-default opacity-60",
        className,
      )}
    >
      {children}
    </tr>
  );
}
