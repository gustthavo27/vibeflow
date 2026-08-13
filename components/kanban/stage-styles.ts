import type { DealStage } from "@/lib/supabase/types";

export const stageDotClasses: Record<DealStage, string> = {
  novo_lead: "bg-blue-500",
  contato_realizado: "bg-cyan-400",
  proposta_enviada: "bg-fuchsia-500",
  negociacao: "bg-amber-500",
  fechado_ganho: "bg-emerald-400",
  fechado_perdido: "bg-red-500",
};
