"use client";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import { AppText } from "@/shared/ui/AppText";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Numeric } from "@/components/numeric/Numeric";
import { formatCurrency, formatNumber } from "@/shared/lib/format";
import { type ModelId } from "@/shared/api/types";

const LABELS: Record<ModelId, string> = {
  gpt: "OpenAI", gemini: "Gemini", claude: "Claude", grok: "Grok",
  deepseek: "DeepSeek", perplexity: "Perplexity",
};

const COLORS: Record<ModelId, string> = {
  gpt: "var(--model-gpt)",
  gemini: "var(--model-gemini)",
  claude: "var(--model-claude)",
  grok: "var(--model-grok)",
  deepseek: "var(--model-deepseek)",
  perplexity: "var(--model-perplexity)",
};

export function CostByModel({
  data,
  days,
}: {
  data: { modelId: ModelId; cost: number; tokens?: number }[];
  days?: number;
}) {
  const sorted = [...data].sort((a, b) => b.cost - a.cost);
  const maxCost = sorted[0]?.cost ?? 1;
  return (
    <Card>
      <CardHeader>
        <div className="flex grow items-center gap-2">
          <AppText role="card">
            Cost by model{days ? ` · ${days}d` : ""}
          </AppText>
          <InfoTooltip label="About cost by model">
            Total USD billed per upstream model in the selected window.
            Larger bars are bigger contributors to your invoice. Use this
            alongside tokens by model to spot expensive models (high cost,
            low tokens).
          </InfoTooltip>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        <div className="px-6 py-5">
          <h4 className="mb-4 text-sm font-medium text-[var(--text-primary)]">
            Model Breakdown
          </h4>
          <ul className="space-y-3" aria-label="Cost by model breakdown">
            {sorted.map((d) => {
              const width = maxCost > 0 ? (d.cost / maxCost) * 100 : 0;
              return (
                <li key={d.modelId} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-full"
                        style={{ background: COLORS[d.modelId] }}
                      />
                      <span className="text-sm text-[var(--text-primary)]">
                        {LABELS[d.modelId]}
                      </span>
                    </div>
                    <span className="text-xs text-[var(--text-secondary)] _num">
                      <Numeric value={formatCurrency(d.cost)} />
                    </span>
                  </div>
                  <div
                    className="relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]"
                    role="presentation"
                  >
                    <div
                      className="absolute inset-y-0 start-0 rounded-full"
                      style={{
                        width: `${width}%`,
                        background: COLORS[d.modelId],
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        {data.some((d) => typeof d.tokens === "number") && (
          <div className="border-t border-[var(--border-default)] px-6 py-3 text-xs">
            <Table>
              <THead>
                <TR>
                  <TH>Model</TH>
                  <TH className="text-end">Cost (USD)</TH>
                  <TH className="text-end">Tokens</TH>
                  <TH className="text-end">$ / <Numeric value="1k" /> tokens</TH>
                </TR>
              </THead>
              <TBody>
                {data.map((d) => {
                  const tokens = d.tokens ?? 0;
                  const perK = tokens ? d.cost / (tokens / 1000) : 0;
                  return (
                    <TR key={d.modelId}>
                      <TD>{LABELS[d.modelId]}</TD>
                      <TD className="text-end _num">
                        <Numeric value={formatCurrency(d.cost)} />
                      </TD>
                      <TD className="text-end _num text-[var(--text-secondary)]">
                        <Numeric value={formatNumber(tokens)} />
                      </TD>
                      <TD className="text-end _num text-[var(--text-secondary)]">
                        <Numeric value={tokens ? formatCurrency(perK) : "—"} />
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}