import type { Metadata } from "next";

import { SiteHeader } from "@/components/marketing/site-header";
import { HeroSection } from "@/components/marketing/hero-section";
import { StatsSection } from "@/components/marketing/stats-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FinalCtaSection } from "@/components/marketing/final-cta-section";
import { SiteFooter } from "@/components/marketing/site-footer";

export const metadata: Metadata = {
  title: "VibeFlow CRM — Pipeline de vendas sem complicação",
  description:
    "CRM multi-empresa com pipeline visual Kanban, gestão de leads e dashboard de métricas. Grátis até 50 leads, sem cartão de crédito.",
};

export default function MarketingPage() {
  return (
    <div className="bg-grain flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <PricingSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
