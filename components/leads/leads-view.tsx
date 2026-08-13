"use client";

import { useEffect, useMemo, useState } from "react";
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
import { createLead, deleteLead, listLeads, updateLead } from "@/lib/actions/leads";
import { LEAD_STATUS_LABELS, LEAD_STATUS_OPTIONS } from "@/lib/labels";
import type { Database, LeadStatus } from "@/lib/supabase/types";
import type { WorkspaceMember } from "@/lib/workspace";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

const STATUS_ALL = "all";

function LeadsView({
  workspace,
  initialLeads,
  members,
}: {
  workspace: string;
  initialLeads: Lead[];
  members: WorkspaceMember[];
}) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">(STATUS_ALL);
  const [loadError, setLoadError] = useState<string | undefined>();

  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const membersById = useMemo(
    () => new Map(members.map((member) => [member.user_id, member])),
    [members],
  );

  useEffect(() => {
    const handle = setTimeout(() => {
      listLeads(workspace, { search, status: statusFilter }).then((result) => {
        if (result.success) {
          setLeads(result.data);
          setLoadError(undefined);
        } else {
          setLoadError(result.error);
        }
      });
    }, 300);

    return () => clearTimeout(handle);
  }, [workspace, search, statusFilter]);

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

  async function handleSubmit(values: LeadFormValues) {
    const result = editingLead
      ? await updateLead(workspace, editingLead.id, values)
      : await createLead(workspace, values);

    if (!result.success) {
      return { success: false, error: result.error, fieldErrors: result.fieldErrors };
    }

    setLeads((prev) => {
      if (editingLead) {
        return prev.map((lead) => (lead.id === result.data.id ? result.data : lead));
      }
      return [result.data, ...prev];
    });

    return { success: true };
  }

  async function handleDelete(lead: Lead) {
    setIsDeleting(true);
    const result = await deleteLead(workspace, lead.id);
    setIsDeleting(false);

    if (result.success) {
      setLeads((prev) => prev.filter((item) => item.id !== lead.id));
      setLeadToDelete(null);
      setLoadError(undefined);
    } else {
      setLoadError(result.error);
    }
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
          onValueChange={(value) => setStatusFilter((value as LeadStatus | "all") ?? STATUS_ALL)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={STATUS_ALL}>Todos os status</SelectItem>
            {LEAD_STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {LEAD_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loadError && <p className="text-sm text-destructive">{loadError}</p>}

      {leads.length > 0 ? (
        <LeadsTable
          workspace={workspace}
          leads={leads}
          membersById={membersById}
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
        members={members}
        onSubmit={handleSubmit}
      />

      <DeleteLeadDialog
        lead={leadToDelete}
        isDeleting={isDeleting}
        onOpenChange={(open) => !open && setLeadToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export { LeadsView };
