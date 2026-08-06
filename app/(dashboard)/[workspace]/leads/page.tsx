import { Users } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";

export default function LeadsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Leads
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerencie contatos e oportunidades do workspace.
        </p>
      </div>
      <EmptyState
        icon={Users}
        title="Nenhum lead cadastrado"
        description="Cadastre seu primeiro lead para começar a organizar o funil de vendas."
      />
    </div>
  );
}
