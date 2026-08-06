import { Kanban } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";

export default function PipelinePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Pipeline
        </h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe negócios em andamento por etapa do funil.
        </p>
      </div>
      <EmptyState
        icon={Kanban}
        title="Pipeline vazio"
        description="Os negócios em andamento vão aparecer aqui, organizados por etapa do funil de vendas."
      />
    </div>
  );
}
