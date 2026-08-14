import Link from "next/link";
import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Entrar | VibeFlow CRM",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <AuthCard
      title="Bem-vindo de volta"
      description="Entre com sua conta para acessar seu workspace."
      footer={
        <>
          Ainda não tem uma conta?{" "}
          <Link
            href={redirect ? `/signup?redirect=${encodeURIComponent(redirect)}` : "/signup"}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Criar conta
          </Link>
        </>
      }
    >
      <LoginForm redirectTo={redirect} />
    </AuthCard>
  );
}
