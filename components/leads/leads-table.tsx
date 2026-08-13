"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import type { Database } from "@/lib/supabase/types";
import type { WorkspaceMember } from "@/lib/workspace";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function LeadsTable({
  workspace,
  leads,
  membersById,
  onEdit,
  onDelete,
}: {
  workspace: string;
  leads: Lead[];
  membersById: Map<string, WorkspaceMember>;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Lead</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell>
                <Link
                  href={`/${workspace}/leads/${lead.id}`}
                  className="flex flex-col hover:underline"
                >
                  <span className="font-medium text-foreground">{lead.name}</span>
                  <span className="text-xs text-muted-foreground">{lead.email}</span>
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-foreground">{lead.company}</span>
                  <span className="text-xs text-muted-foreground">{lead.job_title}</span>
                </div>
              </TableCell>
              <TableCell>
                <LeadStatusBadge status={lead.status} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {lead.owner_id ? (membersById.get(lead.owner_id)?.email ?? "—") : "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(lead.created_at)}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Editar ${lead.name}`}
                    onClick={() => onEdit(lead)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Excluir ${lead.name}`}
                    onClick={() => onDelete(lead)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export { LeadsTable };
