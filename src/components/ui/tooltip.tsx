"use client";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { clsx } from "clsx";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({
  className,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={clsx(
          "z-50 rounded-[var(--radius-md)] bg-[var(--bg-surface-inverse)] px-3 py-1.5 text-xs text-[var(--text-inverse)] shadow-[var(--e4)]",
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
