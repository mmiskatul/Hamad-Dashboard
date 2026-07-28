"use client";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { clsx } from "clsx";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={clsx(
        "inline-flex h-9 items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-[var(--border-strong)] bg-[var(--bg-surface)] px-3 text-sm text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown size={14} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        className={clsx(
          "z-50 min-w-[180px] rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-1 shadow-[var(--e2)]",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={clsx(
        "flex cursor-pointer items-center justify-between gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none data-[highlighted]:bg-[var(--bg-subtle)]",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator>
        <Check size={14} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
