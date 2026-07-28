"use client";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { AppText } from "@/shared/ui/AppText";
import { BarChart } from "@/components/charts/BarChart";
import { type ModelId } from "@/shared/api/types";

const LABELS: Record<ModelId, string> = {
  gpt: "OpenAI", gemini: "Gemini", claude: "Claude", grok: "Grok",
  deepseek: "DeepSeek", perplexity: "Perplexity",
};

export function ModelDistribution({ data }: { data: Record<ModelId, number> }) {
  const rows = (Object.keys(data) as ModelId[]).map((k) => ({ name: LABELS[k], share: data[k] }));
  return (
    <Card>
      <CardHeader>
        <div className="grow">
          <AppText role="card">Model distribution</AppText>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        <div className="px-2 pb-2">
          <BarChart label="Model distribution (%)" data={rows} dataKey="share" xKey="name" />
        </div>
      </CardBody>
    </Card>
  );
}