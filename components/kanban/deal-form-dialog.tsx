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
import { Textarea } from "@/components/ui/textarea";
import { FileAttachmentsField } from "@/components/shared/file-attachments-field";
import {
  dealStages,
  mockLeads,
  mockTeamMembers,
  type Anexo,
  type Deal,
  type DealStage,
  type Lead,
} from "@/lib/mock-data";

function leadLabel(lead: Lead) {
  return `${lead.nome} — ${lead.empresa}`;
}

export type DealFormValues = {
  titulo: string;
  valorEstimado: number;
  leadId: string;
  responsavel: string;
  prazo: string;
  etapa: DealStage;
  notas: string;
  anexos: Anexo[];
};

type FormErrors = Partial<Record<"titulo" | "leadId" | "prazo", string>>;

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

function buildEmptyValues(defaultStage: DealStage): DealFormValues {
  return {
    titulo: "",
    valorEstimado: 0,
    leadId: mockLeads[0]?.id ?? "",
    responsavel: mockTeamMembers[0],
    prazo: "",
    etapa: defaultStage,
    notas: "",
    anexos: [],
  };
}

function DealFormDialog({
  open,
  onOpenChange,
  deal,
  defaultStage,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal?: Deal;
  defaultStage: DealStage;
  onSubmit: (values: DealFormValues) => void;
}) {
  const formId = useId();
  const isEditing = !!deal;

  const [values, setValues] = useState<DealFormValues>(() =>
    deal ? { ...deal } : buildEmptyValues(defaultStage),
  );
  const [prazoText, setPrazoText] = useState(() => isoToDisplayDate(deal?.prazo ?? ""));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handlePrazoChange(event: ChangeEvent<HTMLInputElement>) {
    const masked = maskDateInput(event.target.value);
    setPrazoText(masked);
    setValues((v) => ({ ...v, prazo: displayDateToIso(masked) }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {
      titulo: values.titulo.trim() ? undefined : "Informe o título do negócio.",
      leadId: values.leadId ? undefined : "Selecione um lead vinculado.",
      prazo: values.prazo ? undefined : "Informe o prazo do negócio.",
    };
    setErrors(nextErrors);

    if (Object.values(nextErrors).some(Boolean)) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit(values);
      setIsSubmitting(false);
    }, 400);
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
            <Field className="sm:col-span-2" data-invalid={!!errors.titulo}>
              <FieldLabel htmlFor="titulo">Título *</FieldLabel>
              <Input
                id="titulo"
                placeholder="Ex.: Proposta Enterprise - Norte Tech"
                value={values.titulo}
                aria-invalid={!!errors.titulo}
                onChange={(event) => setValues((v) => ({ ...v, titulo: event.target.value }))}
              />
              <FieldError>{errors.titulo}</FieldError>
            </Field>

            <Field data-invalid={!!errors.leadId}>
              <FieldLabel htmlFor="leadId">Lead vinculado *</FieldLabel>
              <Combobox
                items={mockLeads}
                itemToStringLabel={leadLabel}
                value={mockLeads.find((lead) => lead.id === values.leadId) ?? null}
                onValueChange={(lead) =>
                  setValues((v) => ({ ...v, leadId: lead?.id ?? "" }))
                }
              >
                <ComboboxInput
                  id="leadId"
                  placeholder="Buscar por nome ou empresa..."
                  aria-invalid={!!errors.leadId}
                  showClear
                  className="w-full"
                />
                <ComboboxContent>
                  <ComboboxEmpty>Nenhum lead encontrado.</ComboboxEmpty>
                  <ComboboxList>
                    {(lead: Lead) => (
                      <ComboboxItem key={lead.id} value={lead}>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate">{lead.nome}</span>
                          <span className="truncate text-xs text-muted-foreground">
                            {lead.empresa}
                          </span>
                        </div>
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              <FieldError>{errors.leadId}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="etapa">Etapa *</FieldLabel>
              <Select
                value={values.etapa}
                onValueChange={(etapa) =>
                  setValues((v) => ({ ...v, etapa: (etapa as DealStage) ?? v.etapa }))
                }
              >
                <SelectTrigger id="etapa" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dealStages.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stage}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="valorEstimado">Valor estimado (R$)</FieldLabel>
              <Input
                id="valorEstimado"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={values.valorEstimado === 0 ? "" : values.valorEstimado}
                onChange={(event) =>
                  setValues((v) => ({ ...v, valorEstimado: Number(event.target.value) || 0 }))
                }
              />
            </Field>

            <Field data-invalid={!!errors.prazo}>
              <FieldLabel htmlFor="prazo">Prazo *</FieldLabel>
              <Input
                id="prazo"
                type="text"
                inputMode="numeric"
                placeholder="dd/mm/aaaa"
                maxLength={10}
                value={prazoText}
                aria-invalid={!!errors.prazo}
                onChange={handlePrazoChange}
              />
              <FieldError>{errors.prazo}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="responsavel">Responsável *</FieldLabel>
              <Select
                value={values.responsavel}
                onValueChange={(responsavel) =>
                  setValues((v) => ({ ...v, responsavel: responsavel ?? v.responsavel }))
                }
              >
                <SelectTrigger id="responsavel" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockTeamMembers.map((member) => (
                    <SelectItem key={member} value={member}>
                      {member}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="notas">Notas</FieldLabel>
              <Textarea
                id="notas"
                placeholder="Detalhes sobre a negociação..."
                rows={3}
                value={values.notas}
                onChange={(event) => setValues((v) => ({ ...v, notas: event.target.value }))}
              />
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel>Anexos</FieldLabel>
              <FileAttachmentsField
                anexos={values.anexos}
                onChange={(anexos) => setValues((v) => ({ ...v, anexos }))}
              />
            </Field>
          </div>
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
