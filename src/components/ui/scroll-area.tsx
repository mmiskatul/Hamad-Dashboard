"use client";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { clsx } from "clsx";

export const ScrollArea = ({ className, children, ...props }: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) => (
  <ScrollAreaPrimitive.Root className={clsx("relative overflow-hidden", className)} {...props}>
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">{children}</ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar
      orientation="vertical"
      className="flex touch-none select-none p-0.5 transition-colors w-2"
    >
      <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-[var(--bg-muted)]" />
    </ScrollAreaPrimitive.Scrollbar>
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
);
