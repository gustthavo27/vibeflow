import Link from "next/link";
import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar | VibeFlow CRM",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Bem-vindo de volta"
      description="Entre com sua conta para acessar seu workspace."
      footer={
        <>
          Ainda não tem uma conta?{" "}
          <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}
