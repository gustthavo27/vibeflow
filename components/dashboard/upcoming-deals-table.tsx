"use client";

import { useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";

import { DealFormDialog, type DealFormValues } from "@/components/kanban/deal-form-dialog";
import { stageDotClasses } from "@/components/kanban/stage-styles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getUpcomingDeals } from "@/lib/dashboard-metrics";
import { mockLeads, type Deal } from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/utils";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function UpcomingDealsTable() {
  const [deals, setDeals] = useState<Deal[]>(() => getUpcomingDeals());
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const leadsById = useMemo(() => new Map(mockLeads.map((lead) => [lead.id, lead])), []);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function handleSubmit(values: DealFormValues) {
    if (!editingDeal) return;
    setDeals((prev) => prev.map((deal) => (deal.id === editingDeal.id ? { ...deal, ...values } : deal)));
    setEditingDeal(null);
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Prazos Próximos</CardTitle>
          <CardDescription>Negócios abertos ordenados por prazo</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Negócio</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Prazo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deals.map((deal) => {
                const lead = leadsById.get(deal.leadId);
                const isOverdue = deal.prazo < today;

                return (
                  <TableRow
                    key={deal.id}
                    onClick={() => setEditingDeal(deal)}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{deal.titulo}</span>
                        {lead && <span className="text-xs text-muted-foreground">{lead.empresa}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                        <span className={cn("size-2 shrink-0 rounded-full", stageDotClasses[deal.etapa])} />
                        {deal.etapa}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{deal.responsavel}</TableCell>
                    <TableCell className="text-right font-medium text-foreground">
                      {formatCurrency(deal.valorEstimado)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "flex items-center justify-end gap-1 text-xs whitespace-nowrap",
                          isOverdue ? "font-medium text-destructive" : "text-muted-foreground",
                        )}
                      >
                        <CalendarClock className="size-3.5 shrink-0" />
                        {formatDate(deal.prazo)}
                        {isOverdue && <span className="font-mono uppercase">· Vencido</span>}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
              {deals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
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
          defaultStage={editingDeal.etapa}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}

export { UpcomingDealsTable };
