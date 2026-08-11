import { Reveal } from "@/components/marketing/reveal";

const STATS = [
  { value: "+47%", label: "conversão de leads em clientes" },
  { value: "3.2x", label: "mais leads qualificados" },
  { value: "−62%", label: "no ciclo de vendas" },
  { value: "1200+", label: "times vendendo com o VibeFlow" },
];

function StatsSection() {
  return (
    <section className="border-y border-border/60 bg-card/40">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-14">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-x-8">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 100} className="flex flex-col items-start gap-1.5 border-l-2 border-primary/40 pl-4">
              <span className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {stat.value}
              </span>
              <span className="font-mono text-xs leading-snug tracking-wide text-muted-foreground uppercase">
                {stat.label}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export { StatsSection };
