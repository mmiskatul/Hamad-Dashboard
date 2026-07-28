import { Badge } from "@/components/ui/badge";

type Tone = "ok" | "warn" | "bad" | "neutral";

export function StatusBadge({ status, label }: { status: Tone; label: string }) {
  return (
    <Badge tone={status} dot>
      {label}
    </Badge>
  );
}
