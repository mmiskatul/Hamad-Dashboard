import { Inbox } from "lucide-react";
import { AppText } from "@/shared/ui/AppText";

export function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body?: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-12 text-center">
      <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-[var(--radius-lg)] bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
        <Inbox size={26} />
      </div>
      <AppText role="card">{title}</AppText>
      {body && (
        <AppText role="caption" className="mx-auto mt-2 max-w-sm">
          {body}
        </AppText>
      )}
      {cta && <div className="mt-5">{cta}</div>}
    </div>
  );
}
