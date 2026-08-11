"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getFunnelData, type FunnelStagePoint } from "@/lib/dashboard-metrics";
import type { DealStage } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const STAGE_COLORS: Record<DealStage, string> = {
  "Novo Lead": "#3b82f6",
  "Contato Realizado": "#22d3ee",
  "Proposta Enviada": "#d946ef",
  Negociação: "#f59e0b",
  "Fechado Ganho": "#34d399",
  "Fechado Perdido": "#ef4444",
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
      <p className="font-mono font-medium tracking-wide text-muted-foreground uppercase">{point.stage}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">
        {point.count} {point.count === 1 ? "negócio" : "negócios"}
      </p>
      <p className="text-muted-foreground">{formatCurrency(point.value)}</p>
    </div>
  );
}

function SalesFunnelChart() {
  const data = getFunnelData();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Funil de Vendas</CardTitle>
        <CardDescription>Negócios por etapa do pipeline</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="stage"
                width={110}
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip cursor={{ fill: "var(--color-muted)" }} content={<FunnelTooltip />} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={26}>
                {data.map((point) => (
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
