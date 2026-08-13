import { Briefcase, Percent, Users, Wallet } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import { MetricCard } from "./metric-card";

type Metrics = {
  totalLeads: number;
  openDeals: number;
  pipelineValue: number;
  conversionRate: number;
};

function MetricsCards({ metrics }: { metrics: Metrics }) {
  const { totalLeads, openDeals, pipelineValue, conversionRate } = metrics;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        icon={Users}
        label="Total de Leads"
        value={totalLeads.toString()}
        hint="Leads cadastrados no workspace"
      />
      <MetricCard
        icon={Briefcase}
        label="Negócios Abertos"
        value={openDeals.toString()}
        hint="Em andamento no pipeline"
      />
      <MetricCard
        icon={Wallet}
        label="Valor do Pipeline"
        value={formatCurrency(pipelineValue)}
        hint="Soma dos negócios abertos"
      />
      <MetricCard
        icon={Percent}
        label="Taxa de Conversão"
        value={`${conversionRate.toFixed(0)}%`}
        hint="Negócios ganhos vs. fechados"
      />
    </div>
  );
}

export { MetricsCards };
