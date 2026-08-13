"use client";

import { useId, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FileAttachmentsField } from "@/components/shared/file-attachments-field";
import type { Anexo } from "@/lib/mock-data";
import { LEAD_STATUS_LABELS, LEAD_STATUS_OPTIONS } from "@/lib/labels";
import type { Database, LeadStatus } from "@/lib/supabase/types";
import type { WorkspaceMember } from "@/lib/workspace";
import {
  validateLeadCompany,
  validateLeadEmail,
  validateLeadName,
  validateLeadPhone,
} from "@/lib/validation/leads";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

export type LeadFormValues = {
  name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  status: LeadStatus;
  owner_id: string | null;
  deal_value: number;
  notes: string;
};

export type LeadFormSubmitResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

type FormErrors = Partial<Record<"name" | "email" | "phone" | "company", string>>;

const UNASSIGNED = "__unassigned__";

function buildEmptyValues(): LeadFormValues {
  return {
    name: "",
    email: "",
    phone: "",
    company: "",
    job_title: "",
    status: "novo",
    owner_id: null,
    deal_value: 0,
    notes: "",
  };
}

function LeadFormDialog({
  open,
  onOpenChange,
  lead,
  members,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead;
  members: WorkspaceMember[];
  onSubmit: (values: LeadFormValues) => Promise<LeadFormSubmitResult>;
}) {
  const formId = useId();
  const isEditing = !!lead;

  const [values, setValues] = useState<LeadFormValues>(() =>
    lead
      ? {
          name: lead.name,
          email: lead.email ?? "",
          phone: lead.phone ?? "",
          company: lead.company ?? "",
          job_title: lead.job_title ?? "",
          status: lead.status,
          owner_id: lead.owner_id,
          deal_value: lead.deal_value ?? 0,
          notes: lead.notes ?? "",
        }
      : buildEmptyValues(),
  );
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {
      name: validateLeadName(values.name),
      email: validateLeadEmail(values.email),
      phone: validateLeadPhone(values.phone),
      company: validateLeadCompany(values.company),
    };
    setErrors(nextErrors);
    setFormError(undefined);

    if (Object.values(nextErrors).some(Boolean)) return;

    setIsSubmitting(true);
    const result = await onSubmit(values);
    setIsSubmitting(false);

    if (!result.success) {
      if (result.fieldErrors) {
        setErrors((prev) => ({ ...prev, ...result.fieldErrors }));
      }
      setFormError(result.error);
      return;
    }

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar lead" : "Novo lead"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do lead."
              : "Preencha os dados para cadastrar um novo lead."}
          </DialogDescription>
        </DialogHeader>

        <form id={formId} noValidate onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Nome *</FieldLabel>
              <Input
                id="name"
                placeholder="Nome completo"
                value={values.name}
                aria-invalid={!!errors.name}
                onChange={(event) => setValues((v) => ({ ...v, name: event.target.value }))}
              />
              <FieldError>{errors.name}</FieldError>
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">E-mail *</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="nome@empresa.com"
                value={values.email}
                aria-invalid={!!errors.email}
                onChange={(event) => setValues((v) => ({ ...v, email: event.target.value }))}
              />
              <FieldError>{errors.email}</FieldError>
            </Field>

            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor="phone">Telefone *</FieldLabel>
              <Input
                id="phone"
                placeholder="(11) 91234-5678"
                value={values.phone}
                aria-invalid={!!errors.phone}
                onChange={(event) => setValues((v) => ({ ...v, phone: event.target.value }))}
              />
              <FieldError>{errors.phone}</FieldError>
            </Field>

            <Field data-invalid={!!errors.company}>
              <FieldLabel htmlFor="company">Empresa *</FieldLabel>
              <Input
                id="company"
                placeholder="Nome da empresa"
                value={values.company}
                aria-invalid={!!errors.company}
                onChange={(event) => setValues((v) => ({ ...v, company: event.target.value }))}
              />
              <FieldError>{errors.company}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="job_title">Cargo</FieldLabel>
              <Input
                id="job_title"
                placeholder="Cargo do contato"
                value={values.job_title}
                onChange={(event) => setValues((v) => ({ ...v, job_title: event.target.value }))}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="status">Status *</FieldLabel>
              <Select
                value={values.status}
                onValueChange={(status) =>
                  setValues((v) => ({ ...v, status: (status as LeadStatus) ?? v.status }))
                }
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {LEAD_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="owner_id">Responsável</FieldLabel>
              <Select
                value={values.owner_id ?? UNASSIGNED}
                onValueChange={(owner) =>
                  setValues((v) => ({
                    ...v,
                    owner_id: !owner || owner === UNASSIGNED ? null : owner,
                  }))
                }
              >
                <SelectTrigger id="owner_id" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>Sem responsável</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="deal_value">Valor negociado (R$)</FieldLabel>
              <Input
                id="deal_value"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={values.deal_value === 0 ? "" : values.deal_value}
                onChange={(event) =>
                  setValues((v) => ({ ...v, deal_value: Number(event.target.value) || 0 }))
                }
              />
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="notes">Notas</FieldLabel>
              <Textarea
                id="notes"
                placeholder="Detalhes sobre o lead ou pontos de lembrete..."
                rows={3}
                value={values.notes}
                onChange={(event) => setValues((v) => ({ ...v, notes: event.target.value }))}
              />
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel>Anexos</FieldLabel>
              <FileAttachmentsField anexos={anexos} onChange={setAnexos} />
            </Field>
          </div>

          {formError && <p className="mt-4 text-sm text-destructive">{formError}</p>}
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isSubmitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { LeadFormDialog };
