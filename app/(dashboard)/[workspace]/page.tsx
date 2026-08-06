import { LayoutDashboard } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">Visão geral de vendas do workspace.</p>
      </div>
      <EmptyState
        icon={LayoutDashboard}
        title="Seu dashboard ainda está vazio"
        description="Métricas de vendas, funil e prazos vão aparecer aqui assim que houver leads e negócios no workspace."
      />
    </div>
  );
}
