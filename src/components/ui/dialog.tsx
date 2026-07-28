"use client";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { clsx } from "clsx";
import { type ReactNode } from "react";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  children,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  ariaLabel: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
      <DialogPrimitive.Content
        aria-label={ariaLabel}
        className={clsx(
          "fixed inset-0 z-50 m-auto h-fit max-h-[90vh] w-full max-w-md overflow-auto rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-[var(--e4)]",
          className,
        )}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="Close"
          className="absolute end-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
        >
          <X size={16} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ children }: { children: ReactNode }) {
  return <div className="mb-4 flex items-start gap-3">{children}</div>;
}

export function DialogTitle({ children }: { children: ReactNode }) {
  return (
    <DialogPrimitive.Title className="text-base font-medium leading-6 text-[var(--text-primary)]">
      {children}
    </DialogPrimitive.Title>
  );
}

export function DialogDescription({ children }: { children: ReactNode }) {
  return (
    <DialogPrimitive.Description className="mt-1 text-sm text-[var(--text-secondary)]">
      {children}
    </DialogPrimitive.Description>
  );
}

export function DialogFooter({ children }: { children: ReactNode }) {
  return <div className="mt-6 flex justify-end gap-3">{children}</div>;
}
