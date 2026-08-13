import { Badge } from "@/components/ui/badge";
import { LEAD_STATUS_LABELS } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/lib/supabase/types";

const statusStyles: Record<LeadStatus, string> = {
  novo: "bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
  contato_realizado: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  proposta_enviada: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
  negociacao: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
  fechado_ganho: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  fechado_perdido: "bg-muted text-muted-foreground",
};

function LeadStatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn("border-transparent", statusStyles[status], className)}>
      {LEAD_STATUS_LABELS[status]}
    </Badge>
  );
}

export { LeadStatusBadge };
