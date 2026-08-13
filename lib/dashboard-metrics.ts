import { createClient } from "@/lib/supabase/server";
import type { Database, DealStage } from "@/lib/supabase/types";
import { CLOSED_DEAL_STAGES, DEAL_STAGE_OPTIONS } from "@/lib/labels";

type DealRow = Database["public"]["Tables"]["deals"]["Row"];
type LeadRow = Database["public"]["Tables"]["leads"]["Row"];

type FunnelStagePoint = {
  stage: DealStage;
  count: number;
  value: number;
};

type DashboardMetrics = {
  totalLeads: number;
  openDeals: number;
  pipelineValue: number;
  conversionRate: number;
};

type DashboardData = {
  metrics: DashboardMetrics;
  funnelData: FunnelStagePoint[];
  upcomingDeals: DealRow[];
};

function getOpenDeals(deals: DealRow[]) {
  return deals.filter((deal) => !CLOSED_DEAL_STAGES.includes(deal.stage));
}

async function getDashboardData(workspaceId: string, upcomingLimit = 6): Promise<DashboardData> {
  const supabase = await createClient();

  const [{ data: leads }, { data: deals }, { data: userData }] = await Promise.all([
    supabase.from("leads").select("*").eq("workspace_id", workspaceId),
    supabase.from("deals").select("*").eq("workspace_id", workspaceId),
    supabase.auth.getUser(),
  ]);

  const leadRows: LeadRow[] = leads ?? [];
  const dealRows: DealRow[] = deals ?? [];
  const openDeals = getOpenDeals(dealRows);
  const currentUserId = userData.user?.id;

  const won = dealRows.filter((deal) => deal.stage === "fechado_ganho").length;
  const lost = dealRows.filter((deal) => deal.stage === "fechado_perdido").length;
  const closed = won + lost;

  const upcomingDeals = (currentUserId ? openDeals.filter((deal) => deal.owner_id === currentUserId) : [])
    .filter((deal) => !!deal.due_date)
    .slice()
    .sort((a, b) => (a.due_date ?? "").localeCompare(b.due_date ?? ""))
    .slice(0, upcomingLimit);

  return {
    metrics: {
      totalLeads: leadRows.length,
      openDeals: openDeals.length,
      pipelineValue: openDeals.reduce((sum, deal) => sum + deal.estimated_value, 0),
      conversionRate: closed === 0 ? 0 : (won / closed) * 100,
    },
    funnelData: DEAL_STAGE_OPTIONS.map((stage) => {
      const stageDeals = dealRows.filter((deal) => deal.stage === stage);
      return {
        stage,
        count: stageDeals.length,
        value: stageDeals.reduce((sum, deal) => sum + deal.estimated_value, 0),
      };
    }),
    upcomingDeals,
  };
}

export { getDashboardData };
export type { DashboardData, DashboardMetrics, FunnelStagePoint, LeadRow };
