import Link from "next/link";
import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Criar conta | VibeFlow CRM",
};

export default function SignupPage() {
  return (
    <AuthCard
      title="Crie sua conta"
      description="Comece a organizar seus leads e vendas em minutos."
      footer={
        <>
          Já tem uma conta?{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthCard>
  );
}
