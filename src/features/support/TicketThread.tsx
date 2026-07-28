"use client";
import { useTranslations } from "next-intl";
import { Numeric } from "@/components/numeric/Numeric";
import { formatRelativeTime } from "@/shared/lib/format";
import type { TicketDetail } from "@/shared/api/types";

export function TicketThread({ ticket }: { ticket: TicketDetail }) {
  const t = useTranslations("support.ticket");
  return (
    <div className="space-y-3">
      <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
        <div className="text-xs text-[var(--text-secondary)]">{ticket.userEmail}</div>
        <p className="mt-2 text-sm text-[var(--text-primary)]">{ticket.description}</p>
      </div>
      {ticket.timeline.map((ev) => (
        <div
          key={ev.id}
          className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-3"
        >
          <div className="grow">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium _num">{ev.actor}</span>
              <Numeric value={formatRelativeTime(ev.at)} className="text-xs text-[var(--text-secondary)]" />
            </div>
            <p className="mt-1 text-sm text-[var(--text-primary)]">{ev.note}</p>
          </div>
        </div>
      ))}
      <p className="text-xs text-[var(--text-secondary)]">{t("privacyNotice")}</p>
    </div>
  );
}