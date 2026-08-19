import type { ActivityType, DealStage, LeadStatus, WorkspaceRole } from "@/lib/supabase/types";

export const LEAD_STATUS_OPTIONS: LeadStatus[] = [
  "novo",
  "contato_realizado",
  "proposta_enviada",
  "negociacao",
  "fechado_ganho",
  "fechado_perdido",
];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  novo: "Novo",
  contato_realizado: "Contato Realizado",
  proposta_enviada: "Proposta Enviada",
  negociacao: "Negociação",
  fechado_ganho: "Fechado Ganho",
  fechado_perdido: "Fechado Perdido",
};

export const DEAL_STAGE_OPTIONS: DealStage[] = [
  "novo_lead",
  "contato_realizado",
  "proposta_enviada",
  "negociacao",
  "fechado_ganho",
  "fechado_perdido",
];

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  novo_lead: "Novo Lead",
  contato_realizado: "Contato Realizado",
  proposta_enviada: "Proposta Enviada",
  negociacao: "Negociação",
  fechado_ganho: "Fechado Ganho",
  fechado_perdido: "Fechado Perdido",
};

export const CLOSED_DEAL_STAGES: DealStage[] = ["fechado_ganho", "fechado_perdido"];

export const ACTIVITY_TYPE_OPTIONS: ActivityType[] = ["ligacao", "email", "reuniao", "nota"];

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  ligacao: "Ligação",
  email: "E-mail",
  reuniao: "Reunião",
  nota: "Nota",
};

export const WORKSPACE_ROLE_OPTIONS: WorkspaceRole[] = ["admin", "member"];

export const WORKSPACE_ROLE_LABELS: Record<WorkspaceRole, string> = {
  admin: "Administrador",
  member: "Membro",
};

export const FREE_PLAN_MEMBER_LIMIT = 2;
export const FREE_PLAN_LEAD_LIMIT = 50;
