import Link from "next/link";
import { ArrowRight, Sparkle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PipelineMockup } from "@/components/marketing/pipeline-mockup";

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[42rem] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,color-mix(in_oklch,var(--color-primary)_18%,transparent),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(color-mix(in_oklch,var(--color-foreground)_5%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklch,var(--color-foreground)_5%,transparent)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent_75%)]"
      />

      <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-16 pb-20 md:grid-cols-[1.1fr_0.9fr] md:items-center md:px-8 md:pt-24 md:pb-28">
        <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both flex flex-col items-start gap-6 duration-700">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-medium tracking-wide text-primary uppercase">
            <Sparkle className="size-3.5" />
            Pipeline de vendas, sem complicação
          </span>

          <h1 className="font-heading text-4xl leading-[1.05] font-bold tracking-tight text-balance text-foreground sm:text-5xl lg:text-6xl">
            Seu funil de vendas, <span className="text-primary">finalmente</span> sob controle.
          </h1>

          <p className="max-w-lg text-lg text-pretty text-muted-foreground">
            O VibeFlow centraliza leads, negociações e atividades do seu time em um Kanban visual —
            sem planilhas soltas, sem ferramenta cara e complexa demais para o seu tamanho.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-11 px-6 text-base"
              nativeButton={false}
              render={<Link href="/signup" />}
            >
              Começar grátis
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-6 text-base"
              nativeButton={false}
              render={<a href="#funcionalidades" />}
            >
              Ver funcionalidades
            </Button>
          </div>

          <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
            Grátis até 50 leads · sem cartão de crédito
          </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both flex justify-center duration-700 [animation-delay:150ms] md:justify-end">
          <PipelineMockup />
        </div>
      </div>
    </section>
  );
}

export { HeroSection };
