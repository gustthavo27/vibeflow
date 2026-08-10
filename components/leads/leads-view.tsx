"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteLeadDialog } from "@/components/leads/delete-lead-dialog";
import { LeadFormDialog, type LeadFormValues } from "@/components/leads/lead-form-dialog";
import { LeadsTable } from "@/components/leads/leads-table";
import { leadStatuses, type Lead } from "@/lib/mock-data";

const STATUS_ALL = "Todos";

function LeadsView({ workspace, initialLeads }: { workspace: string; initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(STATUS_ALL);

  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [formKey, setFormKey] = useState(0);

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesQuery =
        !query ||
        lead.nome.toLowerCase().includes(query) ||
        lead.empresa.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query);
      const matchesStatus = statusFilter === STATUS_ALL || lead.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  function openCreateForm() {
    setEditingLead(undefined);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function openEditForm(lead: Lead) {
    setEditingLead(lead);
    setFormKey((k) => k + 1);
    setFormOpen(true);
  }

  function handleSubmit(values: LeadFormValues) {
    if (editingLead) {
      setLeads((prev) =>
        prev.map((lead) => (lead.id === editingLead.id ? { ...lead, ...values } : lead)),
      );
    } else {
      const newLead: Lead = {
        ...values,
        id: crypto.randomUUID(),
        criadoEm: new Date().toISOString().slice(0, 10),
      };
      setLeads((prev) => [newLead, ...prev]);
    }
    setFormOpen(false);
  }

  function handleDelete(lead: Lead) {
    setLeads((prev) => prev.filter((item) => item.id !== lead.id));
    setLeadToDelete(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            Leads
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie contatos e oportunidades do workspace.
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus />
          Novo lead
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, e-mail ou empresa..."
            className="pl-8"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value ?? STATUS_ALL)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={STATUS_ALL}>Todos os status</SelectItem>
            {leadStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredLeads.length > 0 ? (
        <LeadsTable
          workspace={workspace}
          leads={filteredLeads}
          onEdit={openEditForm}
          onDelete={setLeadToDelete}
        />
      ) : (
        <EmptyState
          icon={Users}
          title="Nenhum lead encontrado"
          description="Ajuste a busca ou os filtros, ou cadastre um novo lead."
        />
      )}

      <LeadFormDialog
        key={formKey}
        open={formOpen}
        onOpenChange={setFormOpen}
        lead={editingLead}
        onSubmit={handleSubmit}
      />

      <DeleteLeadDialog
        lead={leadToDelete}
        onOpenChange={(open) => !open && setLeadToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export { LeadsView };
