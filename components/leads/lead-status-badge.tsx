import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LeadStatus } from "@/lib/mock-data";

const statusStyles: Record<LeadStatus, string> = {
  Novo: "bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
  Contato: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
  Proposta: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
  Ganho: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  Perdido: "bg-muted text-muted-foreground",
};

function LeadStatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn("border-transparent", statusStyles[status], className)}>
      {status}
    </Badge>
  );
}

export { LeadStatusBadge };
