"use client";
import { clsx } from "clsx";
import { Numeric } from "@/components/numeric/Numeric";
import { formatRelativeTime } from "@/shared/lib/format";
import type { SupportReply } from "@/shared/api/types";

export function MessageBubble({ reply }: { reply: SupportReply }) {
  const isAdmin = reply.role === "admin";
  return (
    <div
      className={clsx(
        "flex items-start gap-3 rounded-[var(--radius-md)] border p-4 text-sm",
        isAdmin
          ? "border-[var(--action-primary)] bg-[var(--action-primary-transparent)]"
          : "border-[var(--border-default)] bg-[var(--bg-surface)]",
      )}
      data-role={reply.role}
    >
      <div className="grow">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span className="font-medium _num">{reply.author}</span>
          <Numeric value={formatRelativeTime(reply.createdAt)} />
        </div>
        <p className="mt-2 whitespace-pre-wrap text-[var(--text-primary)]">{reply.message}</p>
      </div>
    </div>
  );
}