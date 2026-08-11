import { CalendarClock, TrendingUp } from "lucide-react";

import { formatCurrency } from "@/lib/utils";

const CARDS = [
  { titulo: "Studio Almeida & Cia", valor: 18400, responsavel: "BR", prazo: "12 mar", tone: "text-blue-300 bg-blue-500/20" },
  { titulo: "Nortec Engenharia", valor: 42900, responsavel: "LC", prazo: "18 mar", tone: "text-fuchsia-300 bg-fuchsia-500/20" },
  { titulo: "Grupo Vantage", valor: 9750, responsavel: "MP", prazo: "22 mar", tone: "text-amber-300 bg-amber-500/20" },
];

function PipelineMockup() {
  return (
    <div aria-hidden className="relative w-full max-w-md select-none">
      <div className="absolute -inset-8 -z-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_50%_30%,color-mix(in_oklch,var(--color-primary)_22%,transparent),transparent_70%)] blur-2xl" />

      <div className="rotate-[3deg] rounded-2xl bg-card/90 p-4 shadow-2xl ring-1 ring-foreground/10 backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
            Negociação
          </span>
          <span className="flex items-center gap-1 font-mono text-[0.65rem] font-medium text-primary">
            <TrendingUp className="size-3" />
            +18%
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {CARDS.map((card, i) => (
            <div
              key={card.titulo}
              className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both flex flex-col gap-2 rounded-xl bg-background p-3 text-sm ring-1 ring-foreground/10"
              style={{ animationDelay: `${300 + i * 150}ms`, animationDuration: "600ms" }}
            >
              <p className="font-medium text-foreground">{card.titulo}</p>
              <p className="text-base font-bold text-foreground">{formatCurrency(card.valor)}</p>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarClock className="size-3.5" />
                  {card.prazo}
                </span>
                <span className={`flex size-5 items-center justify-center rounded-full text-[0.6rem] font-semibold ${card.tone}`}>
                  {card.responsavel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both absolute -bottom-6 -left-6 flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-primary-foreground shadow-xl -rotate-[4deg]"
        style={{ animationDelay: "900ms", animationDuration: "600ms" }}
      >
        <span className="font-heading text-lg font-bold">R$ 71,3k</span>
        <span className="font-mono text-[0.6rem] tracking-wide uppercase opacity-80">em jogo</span>
      </div>
    </div>
  );
}

export { PipelineMockup };
