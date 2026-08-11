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
import { leadStatuses, mockTeamMembers, type Anexo, type Lead, type LeadStatus } from "@/lib/mock-data";
import {
  validateLeadCompany,
  validateLeadEmail,
  validateLeadName,
  validateLeadPhone,
} from "@/lib/validation/leads";

export type LeadFormValues = {
  nome: string;
  email: string;
  telefone: string;
  empresa: string;
  cargo: string;
  status: LeadStatus;
  responsavel: string;
  valorNegociado: number;
  notas: string;
  anexos: Anexo[];
};

type FormErrors = Partial<Record<"nome" | "email" | "telefone" | "empresa", string>>;

const emptyValues: LeadFormValues = {
  nome: "",
  email: "",
  telefone: "",
  empresa: "",
  cargo: "",
  status: "Novo",
  responsavel: mockTeamMembers[0],
  valorNegociado: 0,
  notas: "",
  anexos: [],
};

function LeadFormDialog({
  open,
  onOpenChange,
  lead,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead;
  onSubmit: (values: LeadFormValues) => void;
}) {
  const formId = useId();
  const isEditing = !!lead;

  const [values, setValues] = useState<LeadFormValues>(() => (lead ? { ...lead } : emptyValues));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {
      nome: validateLeadName(values.nome),
      email: validateLeadEmail(values.email),
      telefone: validateLeadPhone(values.telefone),
      empresa: validateLeadCompany(values.empresa),
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
          <DialogTitle>{isEditing ? "Editar lead" : "Novo lead"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações do lead."
              : "Preencha os dados para cadastrar um novo lead."}
          </DialogDescription>
        </DialogHeader>

        <form id={formId} noValidate onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.nome}>
              <FieldLabel htmlFor="nome">Nome *</FieldLabel>
              <Input
                id="nome"
                placeholder="Nome completo"
                value={values.nome}
                aria-invalid={!!errors.nome}
                onChange={(event) => setValues((v) => ({ ...v, nome: event.target.value }))}
              />
              <FieldError>{errors.nome}</FieldError>
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

            <Field data-invalid={!!errors.telefone}>
              <FieldLabel htmlFor="telefone">Telefone *</FieldLabel>
              <Input
                id="telefone"
                placeholder="(11) 91234-5678"
                value={values.telefone}
                aria-invalid={!!errors.telefone}
                onChange={(event) => setValues((v) => ({ ...v, telefone: event.target.value }))}
              />
              <FieldError>{errors.telefone}</FieldError>
            </Field>

            <Field data-invalid={!!errors.empresa}>
              <FieldLabel htmlFor="empresa">Empresa *</FieldLabel>
              <Input
                id="empresa"
                placeholder="Nome da empresa"
                value={values.empresa}
                aria-invalid={!!errors.empresa}
                onChange={(event) => setValues((v) => ({ ...v, empresa: event.target.value }))}
              />
              <FieldError>{errors.empresa}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="cargo">Cargo</FieldLabel>
              <Input
                id="cargo"
                placeholder="Cargo do contato"
                value={values.cargo}
                onChange={(event) => setValues((v) => ({ ...v, cargo: event.target.value }))}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="status">Status *</FieldLabel>
              <Select
                value={values.status}
                onValueChange={(status) => setValues((v) => ({ ...v, status: status as LeadStatus }))}
              >
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {leadStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            <Field>
              <FieldLabel htmlFor="valorNegociado">Valor negociado (R$)</FieldLabel>
              <Input
                id="valorNegociado"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={values.valorNegociado === 0 ? "" : values.valorNegociado}
                onChange={(event) =>
                  setValues((v) => ({ ...v, valorNegociado: Number(event.target.value) || 0 }))
                }
              />
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="notas">Notas</FieldLabel>
              <Textarea
                id="notas"
                placeholder="Detalhes sobre o lead ou pontos de lembrete..."
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
            {isSubmitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Cadastrar lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { LeadFormDialog };
