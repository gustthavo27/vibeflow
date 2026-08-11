import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/reveal";

function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,color-mix(in_oklch,var(--color-primary)_16%,transparent),transparent)]"
      />

      <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 text-center md:px-8">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl md:text-5xl">
          Pronto para parar de perder negócio em planilha?
        </h2>
        <p className="max-w-md text-lg text-muted-foreground">
          Crie seu workspace agora e organize seu primeiro pipeline em minutos.
        </p>
        <Button
          size="lg"
          className="h-12 px-8 text-base"
          nativeButton={false}
          render={<Link href="/signup" />}
        >
          Começar grátis agora
          <ArrowRight data-icon="inline-end" />
        </Button>
        <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
          Grátis até 50 leads · sem cartão de crédito
        </p>
      </Reveal>
    </section>
  );
}

export { FinalCtaSection };
