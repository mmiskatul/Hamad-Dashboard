"use client";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { clsx } from "clsx";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export function PopoverContent({
  className,
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        sideOffset={sideOffset}
        className={clsx(
          "z-50 w-72 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-[var(--e2)]",
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
