import { Settings } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Configurações
        </h1>
        <p className="text-sm text-muted-foreground">
          Workspace, colaboradores e plano de assinatura.
        </p>
      </div>
      <EmptyState
        icon={Settings}
        title="Nada para configurar ainda"
        description="Gerenciamento de colaboradores, papéis de acesso e plano estarão disponíveis em breve."
      />
    </div>
  );
}
