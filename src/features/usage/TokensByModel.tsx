"use client";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { GlossaryTooltip } from "@/components/ui/Glossary";
import { AppText } from "@/shared/ui/AppText";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Numeric } from "@/components/numeric/Numeric";
import { formatNumber } from "@/shared/lib/format";
import { type ModelId } from "@/shared/api/types";

const MODEL_COLORS: Record<ModelId, string> = {
  gpt: "var(--model-gpt)",
  gemini: "var(--model-gemini)",
  claude: "var(--model-claude)",
  grok: "var(--model-grok)",
  deepseek: "var(--model-deepseek)",
  perplexity: "var(--model-perplexity)",
};

const MODEL_LABELS: Record<ModelId, string> = {
  gpt: "OpenAI",
  gemini: "Gemini",
  claude: "Claude",
  grok: "Grok",
  deepseek: "DeepSeek",
  perplexity: "Perplexity",
};

type BreakdownRow = {
  id: ModelId;
  label: string;
  color: string;
  tokens: number;
  share: number;
};

export function TokensByModel({
  data,
  days,
}: {
  data: { date: string; series: Record<ModelId, number> }[];
  days?: number;
}) {
  const modelIds: ModelId[] = ["gpt", "gemini", "claude", "grok", "deepseek", "perplexity"];
  const totals = modelIds.map((id) => ({
    id,
    label: MODEL_LABELS[id],
    color: MODEL_COLORS[id],
    tokens: data.reduce((sum, d) => sum + (d.series[id] ?? 0), 0),
  }));
  const grandTotal = totals.reduce((sum, t) => sum + t.tokens, 0) || 1;
  const rows: BreakdownRow[] = totals
    .map((t) => ({
      id: t.id,
      label: t.label,
      color: t.color,
      tokens: t.tokens,
      share: (t.tokens / grandTotal) * 100,
    }))
    .sort((a, b) => b.tokens - a.tokens);

  return (
    <Card>
      <CardHeader>
        <div className="flex grow items-center gap-2">
          <AppText role="card">
            Tokens by model{days ? ` · ${days}d` : ""}
          </AppText>
          <InfoTooltip label="About tokens by model">
            Daily token volume per upstream model, summed across all users.
            Tokens = input + output. A consistently rising line on a single
            model means traffic concentration — check upstream pricing before
            it hits your invoice.
          </InfoTooltip>
          <GlossaryTooltip term="token" />
        </div>
      </CardHeader>
      <CardBody className="p-0">
        <div className="px-6 py-5">
          <h4 className="mb-4 text-sm font-medium text-[var(--text-primary)]">
            Model Breakdown
          </h4>
          <ul className="space-y-3" aria-label="Model breakdown">
            {rows.map((r) => (
              <li key={r.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="h-2 w-2 rounded-full"
                      style={{ background: r.color }}
                    />
                    <span className="text-sm text-[var(--text-primary)]">
                      {r.label}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] _num">
                    <Numeric value={formatNumber(r.tokens)} suffix=" TK" />
                  </span>
                </div>
                <div
                  className="relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]"
                  role="presentation"
                >
                  <div
                    className="absolute inset-y-0 start-0 rounded-full"
                    style={{
                      width: `${r.share}%`,
                      background: r.color,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardBody>
    </Card>
  );
}
