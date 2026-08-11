import { BarChart3, Building2, Columns3, History, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Columns3,
    title: "Pipeline Kanban",
    description:
      "Arraste negócios entre etapas — Novo Lead, Contato, Proposta, Negociação, Fechado — e veja o funil se mover em tempo real.",
  },
  {
    icon: Users,
    title: "Gestão de leads",
    description:
      "Cadastro completo de contatos com busca, filtros por status e responsável, e página de detalhe com histórico completo.",
  },
  {
    icon: History,
    title: "Timeline de atividades",
    description:
      "Registre ligações, e-mails, reuniões e notas vinculadas a cada lead, com autor e data organizados cronologicamente.",
  },
  {
    icon: BarChart3,
    title: "Dashboard de métricas",
    description:
      "Total de leads, negócios abertos, valor do pipeline e taxa de conversão em cards claros, com gráfico de funil de vendas.",
  },
  {
    icon: Building2,
    title: "Multi-empresa",
    description:
      "Crie quantos workspaces precisar e convide colaboradores por e-mail — cada empresa ou cliente isolado no seu próprio espaço.",
  },
  {
    icon: ShieldCheck,
    title: "Dados isolados e seguros",
    description:
      "Row Level Security por workspace garante que cada time só enxerga os próprios leads, negócios e atividades.",
  },
];

function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 rounded-2xl bg-card p-6 ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:ring-primary/40",
        className,
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-5" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section id="funcionalidades" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-20 md:px-8 md:py-28">
      <Reveal className="mx-auto mb-14 flex max-w-xl flex-col items-center gap-3 text-center">
        <span className="font-mono text-xs font-medium tracking-wide text-primary uppercase">Funcionalidades</span>
        <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Tudo que seu time precisa para vender mais
        </h2>
        <p className="text-muted-foreground">
          Sem inchar o produto com o que você não usa — só o essencial para organizar vendas, do jeito certo.
        </p>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <Reveal key={feature.title} delay={(i % 3) * 100}>
            <FeatureCard {...feature} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export { FeaturesSection };
