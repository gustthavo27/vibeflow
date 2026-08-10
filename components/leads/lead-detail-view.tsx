"use client";

import { useState } from "react";
import { Briefcase, Building2, CalendarDays, Mail, Pencil, Phone, Wallet } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityTimeline } from "@/components/leads/activity-timeline";
import { LeadFormDialog, type LeadFormValues } from "@/components/leads/lead-form-dialog";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import type { Activity, Lead } from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/utils";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function LeadDetailView({
  initialLead,
  activities,
}: {
  initialLead: Lead;
  activities: Activity[];
}) {
  const [lead, setLead] = useState<Lead>(initialLead);
  const [formOpen, setFormOpen] = useState(false);

  function handleSubmit(values: LeadFormValues) {
    setLead((prev) => ({ ...prev, ...values }));
    setFormOpen(false);
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <Card className="lg:w-80 lg:shrink-0">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                <AvatarFallback className="bg-primary/15 font-medium text-primary">
                  {getInitials(lead.nome)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <CardTitle>{lead.nome}</CardTitle>
                <LeadStatusBadge status={lead.status} />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Editar lead"
              onClick={() => setFormOpen(true)}
            >
              <Pencil />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="size-4 shrink-0" />
            <span className="truncate">{lead.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="size-4 shrink-0" />
            <span>{lead.telefone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="size-4 shrink-0" />
            <span className="truncate">{lead.empresa}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="size-4 shrink-0" />
            <span className="truncate">{lead.cargo}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4 shrink-0" />
            <span>Criado em {formatDate(lead.criadoEm)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wallet className="size-4 shrink-0" />
            <span>{formatCurrency(lead.valorNegociado)}</span>
          </div>

          <div className="mt-2 flex flex-col gap-1 border-t border-border pt-3 text-sm">
            <span className="text-muted-foreground">Responsável</span>
            <span className="font-medium text-foreground">{lead.responsavel}</span>
          </div>

          <div className={cn("flex flex-col gap-1 border-t border-border pt-3 text-sm", !lead.notas && "hidden")}>
            <span className="text-muted-foreground">Notas</span>
            <p className="text-foreground">{lead.notas}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Timeline de atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityTimeline activities={activities} />
        </CardContent>
      </Card>

      <LeadFormDialog open={formOpen} onOpenChange={setFormOpen} lead={lead} onSubmit={handleSubmit} />
    </div>
  );
}

export { LeadDetailView };
