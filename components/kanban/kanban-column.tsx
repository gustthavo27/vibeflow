"use client";

import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import type { Deal, DealStage, Lead } from "@/lib/mock-data";
import { DealCard } from "./deal-card";
import { stageDotClasses } from "./stage-styles";

function KanbanColumn({
  stage,
  deals,
  leadsById,
  today,
  onQuickAdd,
  onEditDeal,
}: {
  stage: DealStage;
  deals: Deal[];
  leadsById: Map<string, Lead>;
  today: string;
  onQuickAdd: (stage: DealStage) => void;
  onEditDeal: (deal: Deal) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  const total = deals.reduce((sum, deal) => sum + deal.valorEstimado, 0);

  return (
    <div className="flex w-60 shrink-0 flex-col rounded-2xl bg-card/40 ring-1 ring-foreground/10">
      <div className="sticky top-0 z-10 flex flex-col gap-1.5 rounded-t-2xl border-b border-border/70 bg-card p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className={cn("size-2 shrink-0 rounded-full", stageDotClasses[stage])} />
            <span className="truncate font-mono text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {stage}
            </span>
            <Badge variant="secondary" className="shrink-0">
              {deals.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Adicionar negócio em ${stage}`}
            onClick={() => onQuickAdd(stage)}
          >
            <Plus />
          </Button>
        </div>
        <p className="text-lg font-bold text-foreground">{formatCurrency(total)}</p>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex flex-1 flex-col gap-2.5 p-2.5 transition-colors",
          isOver && "bg-primary/5",
        )}
      >
        {deals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            lead={leadsById.get(deal.leadId)}
            onClick={() => onEditDeal(deal)}
            today={today}
          />
        ))}
        {deals.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/70 p-6 text-center text-xs text-muted-foreground">
            Nenhum negócio nesta etapa
          </div>
        )}
      </div>
    </div>
  );
}

export { KanbanColumn };
