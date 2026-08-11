import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { SalesFunnelChart } from "@/components/dashboard/sales-funnel-chart";
import { UpcomingDealsTable } from "@/components/dashboard/upcoming-deals-table";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">Visão geral de vendas do workspace.</p>
      </div>

      <MetricsCards />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <SalesFunnelChart />
        </div>
        <div className="xl:col-span-3">
          <UpcomingDealsTable />
        </div>
      </div>
    </div>
  );
}
