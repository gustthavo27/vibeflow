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
import { createDeal, updateDeal, updateDealStage } from "@/lib/actions/deals";
import { DEAL_STAGE_OPTIONS } from "@/lib/labels";
import type { Database, DealStage } from "@/lib/supabase/types";
import type { WorkspaceMember } from "@/lib/workspace";
import { DealCardPreview } from "./deal-card";
import { DealFormDialog, type DealFormValues } from "./deal-form-dialog";
import { KanbanColumn } from "./kanban-column";

type Deal = Database["public"]["Tables"]["deals"]["Row"];
type Lead = Database["public"]["Tables"]["leads"]["Row"];

function KanbanBoard({
  workspace,
  initialDeals,
  leads,
  members,
}: {
  workspace: string;
  initialDeals: Deal[];
  leads: Lead[];
  members: WorkspaceMember[];
}) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [dragError, setDragError] = useState<string | undefined>();

  const [formOpen, setFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | undefined>(undefined);
  const [defaultStage, setDefaultStage] = useState<DealStage>(DEAL_STAGE_OPTIONS[0]);
  const [formKey, setFormKey] = useState(0);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const leadsById = useMemo(() => new Map(leads.map((lead) => [lead.id, lead])), [leads]);
  const membersById = useMemo(
    () => new Map(members.map((member) => [member.user_id, member])),
    [members],
  );

  const dealsByStage = useMemo(() => {
    const map = new Map<DealStage, Deal[]>();
    for (const stage of DEAL_STAGE_OPTIONS) {
      map.set(
        stage,
        deals.filter((deal) => deal.stage === stage),
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

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const targetStage = over.id as DealStage;
    if (!DEAL_STAGE_OPTIONS.includes(targetStage)) return;

    const dealId = active.id as string;
    const previousDeal = deals.find((deal) => deal.id === dealId);
    if (!previousDeal || previousDeal.stage === targetStage) return;

    setDragError(undefined);
    setDeals((prev) =>
      prev.map((deal) => (deal.id === dealId ? { ...deal, stage: targetStage } : deal)),
    );

    const result = await updateDealStage(workspace, dealId, targetStage);
    if (!result.success) {
      setDeals((prev) =>
        prev.map((deal) => (deal.id === dealId ? { ...deal, stage: previousDeal.stage } : deal)),
      );
      setDragError(result.error);
    }
  }

  function openCreateForm() {
    setEditingDeal(undefined);
    setDefaultStage(DEAL_STAGE_OPTIONS[0]);
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
    setDefaultStage(deal.stage);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  async function handleSubmit(values: DealFormValues) {
    const result = editingDeal
      ? await updateDeal(workspace, editingDeal.id, values)
      : await createDeal(workspace, values);

    if (!result.success) {
      return { success: false, error: result.error, fieldErrors: result.fieldErrors };
    }

    setDeals((prev) => {
      if (editingDeal) {
        return prev.map((deal) => (deal.id === result.data.id ? result.data : deal));
      }
      return [result.data, ...prev];
    });

    return { success: true };
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

      {dragError && <p className="text-sm text-destructive">{dragError}</p>}

      <DndContext
        id="pipeline-kanban"
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="persistent-scrollbar min-h-0 flex-1 overflow-auto">
          <div className="flex w-max gap-3 pb-3">
            {DEAL_STAGE_OPTIONS.map((stage) => (
              <KanbanColumn
                key={stage}
                stage={stage}
                deals={dealsByStage.get(stage) ?? []}
                leadsById={leadsById}
                membersById={membersById}
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
                lead={activeDeal.lead_id ? leadsById.get(activeDeal.lead_id) : undefined}
                owner={activeDeal.owner_id ? membersById.get(activeDeal.owner_id) : undefined}
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
        leads={leads}
        members={members}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export { KanbanBoard };
