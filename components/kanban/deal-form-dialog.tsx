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
import { dealStages, mockLeads, mockTeamMembers, type Deal, type DealStage } from "@/lib/mock-data";

export type DealFormValues = {
  titulo: string;
  valorEstimado: number;
  leadId: string;
  responsavel: string;
  prazo: string;
  etapa: DealStage;
};

type FormErrors = Partial<Record<"titulo" | "leadId" | "prazo", string>>;

function buildEmptyValues(defaultStage: DealStage): DealFormValues {
  return {
    titulo: "",
    valorEstimado: 0,
    leadId: mockLeads[0]?.id ?? "",
    responsavel: mockTeamMembers[0],
    prazo: "",
    etapa: defaultStage,
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
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
              <Select
                value={values.leadId}
                onValueChange={(leadId) =>
                  setValues((v) => ({ ...v, leadId: leadId ?? v.leadId }))
                }
              >
                <SelectTrigger id="leadId" className="w-full">
                  <SelectValue>
                    {(leadId: string) => {
                      const selectedLead = mockLeads.find((lead) => lead.id === leadId);
                      return selectedLead
                        ? `${selectedLead.nome} — ${selectedLead.empresa}`
                        : "Selecione um lead";
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {mockLeads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.nome} — {lead.empresa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                type="date"
                value={values.prazo}
                aria-invalid={!!errors.prazo}
                onChange={(event) => setValues((v) => ({ ...v, prazo: event.target.value }))}
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
