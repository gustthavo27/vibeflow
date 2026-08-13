import { MetricsCards } from "@/components/dashboard/metrics-cards";
import { SalesFunnelChart } from "@/components/dashboard/sales-funnel-chart";
import { UpcomingDealsTable } from "@/components/dashboard/upcoming-deals-table";
import { getDashboardData } from "@/lib/dashboard-metrics";
import { listLeads } from "@/lib/actions/leads";
import { getWorkspaceBySlug, listWorkspaceMembers } from "@/lib/workspace";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace } = await params;
  const workspaceRow = await getWorkspaceBySlug(workspace);

  const [dashboardData, leadsResult, members] = await Promise.all([
    getDashboardData(workspaceRow.id),
    listLeads(workspace),
    listWorkspaceMembers(workspaceRow.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">Visão geral de vendas do workspace.</p>
      </div>

      <MetricsCards metrics={dashboardData.metrics} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <SalesFunnelChart data={dashboardData.funnelData} />
        </div>
        <div className="xl:col-span-3">
          <UpcomingDealsTable
            workspace={workspace}
            initialDeals={dashboardData.upcomingDeals}
            leads={leadsResult.success ? leadsResult.data : []}
            members={members}
          />
        </div>
      </div>
    </div>
  );
}
