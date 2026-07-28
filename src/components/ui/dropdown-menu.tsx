"use client";
import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { clsx } from "clsx";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export const DropdownMenuGroup = DropdownPrimitive.Group;
export const DropdownMenuSub = DropdownPrimitive.Sub;
export const DropdownMenuPortal = DropdownPrimitive.Portal;
export const DropdownMenuRadioGroup = DropdownPrimitive.RadioGroup;

export const DropdownMenuContent = forwardRef<
  ElementRef<typeof DropdownPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>
>(function DropdownMenuContent({ className, sideOffset = 6, ...props }, ref) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={clsx(
          "z-50 min-w-[180px] rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-1 shadow-[var(--e2)]",
          className,
        )}
        {...props}
      />
    </DropdownPrimitive.Portal>
  );
});

export const DropdownMenuSubContent = forwardRef<
  ElementRef<typeof DropdownPrimitive.SubContent>,
  ComponentPropsWithoutRef<typeof DropdownPrimitive.SubContent>
>(function DropdownMenuSubContent({ className, sideOffset = 4, ...props }, ref) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.SubContent
        ref={ref}
        sideOffset={sideOffset}
        className={clsx(
          "z-50 min-w-[160px] rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-1 shadow-[var(--e2)]",
          className,
        )}
        {...props}
      />
    </DropdownPrimitive.Portal>
  );
});

export const DropdownMenuItem = forwardRef<
  ElementRef<typeof DropdownPrimitive.Item>,
  ComponentPropsWithoutRef<typeof DropdownPrimitive.Item>
>(function DropdownMenuItem({ className, ...props }, ref) {
  return (
    <DropdownPrimitive.Item
      ref={ref}
      className={clsx(
        "flex w-full cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none data-[highlighted]:bg-[var(--bg-subtle)]",
        className,
      )}
      {...props}
    />
  );
});

export const DropdownMenuSubTrigger = forwardRef<
  ElementRef<typeof DropdownPrimitive.SubTrigger>,
  ComponentPropsWithoutRef<typeof DropdownPrimitive.SubTrigger>
>(function DropdownMenuSubTrigger({ className, children, ...props }, ref) {
  return (
    <DropdownPrimitive.SubTrigger
      ref={ref}
      className={clsx(
        "flex w-full cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none data-[highlighted]:bg-[var(--bg-subtle)] data-[state=open]:bg-[var(--bg-subtle)]",
        className,
      )}
      {...props}
    >
      {children}
      <span aria-hidden className="ms-auto opacity-50">›</span>
    </DropdownPrimitive.SubTrigger>
  );
});

export const DropdownMenuSeparator = forwardRef<
  ElementRef<typeof DropdownPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof DropdownPrimitive.Separator>
>(function DropdownMenuSeparator({ className, ...props }, ref) {
  return (
    <DropdownPrimitive.Separator
      ref={ref}
      className={clsx("my-1 h-px bg-[var(--border-default)]", className)}
      {...props}
    />
  );
});