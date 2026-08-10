import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { OnboardingForm } from "@/components/auth/onboarding-form";

export const metadata: Metadata = {
  title: "Criar workspace | VibeFlow CRM",
};

export default function OnboardingPage() {
  return (
    <AuthCard
      title="Crie seu primeiro workspace"
      description="Um workspace organiza seus leads, negócios e equipe."
    >
      <OnboardingForm />
    </AuthCard>
  );
}
