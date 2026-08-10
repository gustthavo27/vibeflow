"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";

import { Button } from "@/components/ui/button";
import { dealStages, mockLeads, type Deal, type DealStage } from "@/lib/mock-data";
import { DealCardPreview } from "./deal-card";
import { DealFormDialog, type DealFormValues } from "./deal-form-dialog";
import { KanbanColumn } from "./kanban-column";

function KanbanBoard({ initialDeals }: { initialDeals: Deal[] }) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | undefined>(undefined);
  const [defaultStage, setDefaultStage] = useState<DealStage>(dealStages[0]);
  const [formKey, setFormKey] = useState(0);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const leadsById = useMemo(() => new Map(mockLeads.map((lead) => [lead.id, lead])), []);

  const dealsByStage = useMemo(() => {
    const map = new Map<DealStage, Deal[]>();
    for (const stage of dealStages) {
      map.set(
        stage,
        deals.filter((deal) => deal.etapa === stage),
      );
    }
    return map;
  }, [deals]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    const deal = deals.find((d) => d.id === event.active.id);
    setActiveDeal(deal ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const targetStage = over.id as DealStage;
    if (!dealStages.includes(targetStage)) return;

    setDeals((prev) =>
      prev.map((deal) => (deal.id === active.id ? { ...deal, etapa: targetStage } : deal)),
    );
  }

  function openCreateForm() {
    setEditingDeal(undefined);
    setDefaultStage(dealStages[0]);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function openQuickAdd(stage: DealStage) {
    setEditingDeal(undefined);
    setDefaultStage(stage);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function openEditForm(deal: Deal) {
    setEditingDeal(deal);
    setDefaultStage(deal.etapa);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function handleSubmit(values: DealFormValues) {
    if (editingDeal) {
      setDeals((prev) =>
        prev.map((deal) => (deal.id === editingDeal.id ? { ...deal, ...values } : deal)),
      );
    } else {
      const newDeal: Deal = {
        ...values,
        id: crypto.randomUUID(),
      };
      setDeals((prev) => [newDeal, ...prev]);
    }
    setFormOpen(false);
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Pipeline
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe negócios em andamento por etapa do funil.
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus />
          Novo Negócio
        </Button>
      </div>

      <DndContext
        id="pipeline-kanban"
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="persistent-scrollbar min-h-0 flex-1 overflow-auto">
          <div className="flex w-max gap-3 pb-3">
            {dealStages.map((stage) => (
              <KanbanColumn
                key={stage}
                stage={stage}
                deals={dealsByStage.get(stage) ?? []}
                leadsById={leadsById}
                today={today}
                onQuickAdd={openQuickAdd}
                onEditDeal={openEditForm}
              />
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeDeal ? (
            <div className="w-72">
              <DealCardPreview
                deal={activeDeal}
                lead={leadsById.get(activeDeal.leadId)}
                today={today}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <DealFormDialog
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        deal={editingDeal}
        defaultStage={defaultStage}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export { KanbanBoard };
