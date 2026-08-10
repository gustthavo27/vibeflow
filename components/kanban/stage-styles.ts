import type { DealStage } from "@/lib/mock-data";

export const stageDotClasses: Record<DealStage, string> = {
  "Novo Lead": "bg-blue-500",
  "Contato Realizado": "bg-cyan-400",
  "Proposta Enviada": "bg-fuchsia-500",
  Negociação: "bg-amber-500",
  "Fechado Ganho": "bg-emerald-400",
  "Fechado Perdido": "bg-red-500",
};
