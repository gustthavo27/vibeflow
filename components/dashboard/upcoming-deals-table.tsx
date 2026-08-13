"use client";

import { useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";

import { DealFormDialog, type DealFormValues } from "@/components/kanban/deal-form-dialog";
import { stageDotClasses } from "@/components/kanban/stage-styles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updateDeal } from "@/lib/actions/deals";
import { CLOSED_DEAL_STAGES, DEAL_STAGE_LABELS } from "@/lib/labels";
import type { Database } from "@/lib/supabase/types";
import type { WorkspaceMember } from "@/lib/workspace";
import { cn, formatCurrency } from "@/lib/utils";

type Deal = Database["public"]["Tables"]["deals"]["Row"];
type Lead = Database["public"]["Tables"]["leads"]["Row"];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function UpcomingDealsTable({
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
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const leadsById = useMemo(() => new Map(leads.map((lead) => [lead.id, lead])), [leads]);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  async function handleSubmit(values: DealFormValues) {
    if (!editingDeal) return { success: false, error: "Negócio não encontrado." };

    const result = await updateDeal(workspace, editingDeal.id, values);
    if (!result.success) {
      return { success: false, error: result.error, fieldErrors: result.fieldErrors };
    }

    setDeals((prev) => {
      if (CLOSED_DEAL_STAGES.includes(result.data.stage)) {
        return prev.filter((deal) => deal.id !== result.data.id);
      }
      return prev.map((deal) => (deal.id === result.data.id ? result.data : deal));
    });
    setEditingDeal(null);
    return { success: true };
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Prazos Próximos</CardTitle>
          <CardDescription>Seus negócios abertos, ordenados por prazo</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Negócio</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Prazo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.map((deal) => {
                const lead = deal.lead_id ? leadsById.get(deal.lead_id) : undefined;
                const isOverdue =
                  !!deal.due_date && deal.due_date < today && !CLOSED_DEAL_STAGES.includes(deal.stage);

                return (
                  <TableRow
                    key={deal.id}
                    onClick={() => setEditingDeal(deal)}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{deal.title}</span>
                        {lead && <span className="text-xs text-muted-foreground">{lead.company}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                        <span className={cn("size-2 shrink-0 rounded-full", stageDotClasses[deal.stage])} />
                        {DEAL_STAGE_LABELS[deal.stage]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      {formatCurrency(deal.estimated_value)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "flex items-center justify-end gap-1 text-xs whitespace-nowrap",
                          isOverdue ? "font-medium text-destructive" : "text-muted-foreground",
                        )}
                      >
                        <CalendarClock className="size-3.5 shrink-0" />
                        {deal.due_date ? formatDate(deal.due_date) : "Sem prazo"}
                        {isOverdue && <span className="font-mono uppercase">· Vencido</span>}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
              {deals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    Nenhum negócio em aberto no momento.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingDeal && (
        <DealFormDialog
          open={!!editingDeal}
          onOpenChange={(open) => !open && setEditingDeal(null)}
          deal={editingDeal}
          defaultStage={editingDeal.stage}
          leads={leads}
          members={members}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}

export { UpcomingDealsTable };
