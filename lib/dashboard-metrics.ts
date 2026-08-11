import { dealStages, mockDeals, mockLeads, type Deal, type DealStage } from "@/lib/mock-data";

const CLOSED_STAGES: DealStage[] = ["Fechado Ganho", "Fechado Perdido"];

function getOpenDeals(deals: Deal[] = mockDeals) {
  return deals.filter((deal) => !CLOSED_STAGES.includes(deal.etapa));
}

function getPipelineValue(deals: Deal[] = mockDeals) {
  return getOpenDeals(deals).reduce((sum, deal) => sum + deal.valorEstimado, 0);
}

function getConversionRate(deals: Deal[] = mockDeals) {
  const won = deals.filter((deal) => deal.etapa === "Fechado Ganho").length;
  const lost = deals.filter((deal) => deal.etapa === "Fechado Perdido").length;
  const closed = won + lost;
  return closed === 0 ? 0 : (won / closed) * 100;
}

function getDashboardMetrics() {
  return {
    totalLeads: mockLeads.length,
    openDeals: getOpenDeals().length,
    pipelineValue: getPipelineValue(),
    conversionRate: getConversionRate(),
  };
}

type FunnelStagePoint = {
  stage: DealStage;
  count: number;
  value: number;
};

function getFunnelData(deals: Deal[] = mockDeals): FunnelStagePoint[] {
  return dealStages.map((stage) => {
    const stageDeals = deals.filter((deal) => deal.etapa === stage);
    return {
      stage,
      count: stageDeals.length,
      value: stageDeals.reduce((sum, deal) => sum + deal.valorEstimado, 0),
    };
  });
}

function getUpcomingDeals(deals: Deal[] = mockDeals, limit = 6) {
  return getOpenDeals(deals)
    .slice()
    .sort((a, b) => a.prazo.localeCompare(b.prazo))
    .slice(0, limit);
}

export { getDashboardMetrics, getFunnelData, getUpcomingDeals };
export type { FunnelStagePoint };
