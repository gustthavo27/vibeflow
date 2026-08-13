"use client";

import { useId, useState, type ChangeEvent, type FormEvent } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
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
import { FileAttachmentsField } from "@/components/shared/file-attachments-field";
import type { Anexo } from "@/lib/mock-data";
import { DEAL_STAGE_LABELS, DEAL_STAGE_OPTIONS } from "@/lib/labels";
import type { Database, DealStage } from "@/lib/supabase/types";
import type { WorkspaceMember } from "@/lib/workspace";

type Deal = Database["public"]["Tables"]["deals"]["Row"];
type Lead = Database["public"]["Tables"]["leads"]["Row"];

function leadLabel(lead: Lead) {
  return `${lead.name} — ${lead.company ?? "sem empresa"}`;
}

export type DealFormValues = {
  title: string;
  estimated_value: number;
  lead_id: string | null;
  owner_id: string | null;
  due_date: string | null;
  stage: DealStage;
};

export type DealFormSubmitResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

type FormErrors = Partial<Record<"title" | "lead_id" | "due_date", string>>;

const UNASSIGNED = "__unassigned__";

function isoToDisplayDate(iso: string) {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return "";
  return `${day}/${month}/${year}`;
}

function isValidCalendarDate(day: number, month: number, year: number) {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function displayDateToIso(display: string) {
  const match = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return "";
  const [, day, month, year] = match;
  if (!isValidCalendarDate(Number(day), Number(month), Number(year))) return "";
  return `${year}-${month}-${day}`;
}

function maskDateInput(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join("/");
}

function buildEmptyValues(defaultStage: DealStage, defaultLeadId: string | null): DealFormValues {
  return {
    title: "",
    estimated_value: 0,
    lead_id: defaultLeadId,
    owner_id: null,
    due_date: null,
    stage: defaultStage,
  };
}

function DealFormDialog({
  open,
  onOpenChange,
  deal,
  defaultStage,
  leads,
  members,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: Deal;
  defaultStage: DealStage;
  leads: Lead[];
  members: WorkspaceMember[];
  onSubmit: (values: DealFormValues) => Promise<DealFormSubmitResult>;
}) {
  const formId = useId();
  const isEditing = !!deal;

  const [values, setValues] = useState<DealFormValues>(() =>
    deal
      ? {
          title: deal.title,
          estimated_value: deal.estimated_value,
          lead_id: deal.lead_id,
          owner_id: deal.owner_id,
          due_date: deal.due_date,
          stage: deal.stage,
        }
      : buildEmptyValues(defaultStage, leads[0]?.id ?? null),
  );
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [prazoText, setPrazoText] = useState(() => isoToDisplayDate(deal?.due_date ?? ""));
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handlePrazoChange(event: ChangeEvent<HTMLInputElement>) {
    const masked = maskDateInput(event.target.value);
    setPrazoText(masked);
    setValues((v) => ({ ...v, due_date: displayDateToIso(masked) || null }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {
      title: values.title.trim() ? undefined : "Informe o título do negócio.",
      lead_id: values.lead_id ? undefined : "Selecione um lead vinculado.",
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
          <DialogTitle>{isEditing ? "Editar negócio" : "Novo negócio"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do negócio."
              : "Preencha os dados para cadastrar um novo negócio no pipeline."}
          </DialogDescription>
        </DialogHeader>

        <form id={formId} noValidate onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field className="sm:col-span-2" data-invalid={!!errors.title}>
              <FieldLabel htmlFor="title">Título *</FieldLabel>
              <Input
                id="title"
                placeholder="Ex.: Proposta Enterprise - Norte Tech"
                value={values.title}
                aria-invalid={!!errors.title}
                onChange={(event) => setValues((v) => ({ ...v, title: event.target.value }))}
              />
              <FieldError>{errors.title}</FieldError>
            </Field>

            <Field data-invalid={!!errors.lead_id}>
              <FieldLabel htmlFor="lead_id">Lead vinculado *</FieldLabel>
              <Combobox
                items={leads}
                itemToStringLabel={leadLabel}
                value={leads.find((lead) => lead.id === values.lead_id) ?? null}
                onValueChange={(lead) =>
                  setValues((v) => ({ ...v, lead_id: (lead as Lead | null)?.id ?? null }))
                }
              >
                <ComboboxInput
                  id="lead_id"
                  placeholder="Buscar por nome ou empresa..."
                  aria-invalid={!!errors.lead_id}
                  showClear
                  className="w-full"
                />
                <ComboboxContent>
                  <ComboboxEmpty>Nenhum lead encontrado.</ComboboxEmpty>
                  <ComboboxList>
                    {(lead: Lead) => (
                      <ComboboxItem key={lead.id} value={lead}>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate">{lead.name}</span>
                          <span className="truncate text-xs text-muted-foreground">
                            {lead.company}
                          </span>
                        </div>
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              <FieldError>{errors.lead_id}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="stage">Etapa *</FieldLabel>
              <Select
                value={values.stage}
                onValueChange={(stage) =>
                  setValues((v) => ({ ...v, stage: (stage as DealStage) ?? v.stage }))
                }
              >
                <SelectTrigger id="stage" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEAL_STAGE_OPTIONS.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {DEAL_STAGE_LABELS[stage]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="estimated_value">Valor estimado (R$)</FieldLabel>
              <Input
                id="estimated_value"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={values.estimated_value === 0 ? "" : values.estimated_value}
                onChange={(event) =>
                  setValues((v) => ({ ...v, estimated_value: Number(event.target.value) || 0 }))
                }
              />
            </Field>

            <Field data-invalid={!!errors.due_date}>
              <FieldLabel htmlFor="due_date">Prazo</FieldLabel>
              <Input
                id="due_date"
                type="text"
                inputMode="numeric"
                placeholder="dd/mm/aaaa"
                maxLength={10}
                value={prazoText}
                aria-invalid={!!errors.due_date}
                onChange={handlePrazoChange}
              />
              <FieldError>{errors.due_date}</FieldError>
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
            {isSubmitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar negócio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { DealFormDialog };
