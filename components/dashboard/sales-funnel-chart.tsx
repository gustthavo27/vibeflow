"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DEAL_STAGE_LABELS } from "@/lib/labels";
import type { FunnelStagePoint } from "@/lib/dashboard-metrics";
import type { DealStage } from "@/lib/supabase/types";
import { formatCurrency } from "@/lib/utils";

const STAGE_COLORS: Record<DealStage, string> = {
  novo_lead: "#3b82f6",
  contato_realizado: "#22d3ee",
  proposta_enviada: "#d946ef",
  negociacao: "#f59e0b",
  fechado_ganho: "#34d399",
  fechado_perdido: "#ef4444",
};

function FunnelTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: FunnelStagePoint }>;
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;

  return (
    <div className="rounded-lg bg-popover p-3 text-xs shadow-lg ring-1 ring-foreground/10">
      <p className="font-mono font-medium tracking-wide text-muted-foreground uppercase">
        {DEAL_STAGE_LABELS[point.stage]}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">
        {point.count} {point.count === 1 ? "negócio" : "negócios"}
      </p>
      <p className="text-muted-foreground">{formatCurrency(point.value)}</p>
    </div>
  );
}

function SalesFunnelChart({ data }: { data: FunnelStagePoint[] }) {
  const chartData = data.map((point) => ({ ...point, stageLabel: DEAL_STAGE_LABELS[point.stage] }));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Funil de Vendas</CardTitle>
        <CardDescription>Negócios por etapa do pipeline</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="stageLabel"
                width={110}
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip cursor={{ fill: "var(--color-muted)" }} content={<FunnelTooltip />} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={26}>
                {chartData.map((point) => (
                  <Cell key={point.stage} fill={STAGE_COLORS[point.stage]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export { SalesFunnelChart };
