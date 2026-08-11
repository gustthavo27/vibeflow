import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Grátis",
    price: "R$ 0",
    period: "para sempre",
    description: "Para começar a organizar seu funil de vendas.",
    cta: "Começar grátis",
    href: "/signup",
    highlighted: false,
    features: ["Até 2 colaboradores", "Até 50 leads", "Pipeline Kanban completo", "Dashboard de métricas", "Timeline de atividades"],
  },
  {
    name: "Pro",
    price: "R$ 49",
    period: "/mês",
    description: "Para times que vivem de vender e não podem parar.",
    cta: "Assinar Pro",
    href: "/signup",
    highlighted: true,
    features: [
      "Colaboradores ilimitados",
      "Leads ilimitados",
      "Tudo do plano Grátis",
      "Convites ilimitados por e-mail",
      "Suporte prioritário",
    ],
  },
];

function PricingSection() {
  return (
    <section id="precos" className="scroll-mt-16 bg-card/40 py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-4 md:px-8">
        <Reveal className="mx-auto mb-14 flex max-w-xl flex-col items-center gap-3 text-center">
          <span className="font-mono text-xs font-medium tracking-wide text-primary uppercase">Planos e preços</span>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simples como deveria ser
          </h2>
          <p className="text-muted-foreground">
            Comece de graça. Faça upgrade quando o time crescer — sem letras miúdas.
          </p>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 120}>
              <div
                className={cn(
                  "relative flex h-full flex-col gap-6 rounded-2xl p-7",
                  plan.highlighted
                    ? "bg-foreground text-background ring-1 ring-foreground/10 shadow-[0_0_0_1px_color-mix(in_oklch,var(--color-primary)_40%,transparent),0_20px_60px_-20px_color-mix(in_oklch,var(--color-primary)_50%,transparent)]"
                    : "bg-card ring-1 ring-foreground/10",
                )}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 font-mono text-[0.65rem] font-semibold tracking-wide text-primary-foreground uppercase">
                    Mais popular
                  </span>
                )}

                <div className="flex flex-col gap-1.5">
                  <h3 className="font-heading text-xl font-semibold">{plan.name}</h3>
                  <p className={cn("text-sm", plan.highlighted ? "text-background/70" : "text-muted-foreground")}>
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-end gap-1">
                  <span className="font-heading text-4xl font-bold tracking-tight">{plan.price}</span>
                  <span className={cn("pb-1 text-sm", plan.highlighted ? "text-background/60" : "text-muted-foreground")}>
                    {plan.period}
                  </span>
                </div>

                <ul className="flex flex-1 flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          plan.highlighted ? "text-primary" : "text-primary",
                        )}
                      />
                      <span className={plan.highlighted ? "text-background/90" : "text-foreground"}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  variant={plan.highlighted ? "default" : "outline"}
                  className="h-11 w-full text-base"
                  nativeButton={false}
                  render={<Link href={plan.href} />}
                >
                  {plan.cta}
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export { PricingSection };
