"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { validateEmail, validatePassword } from "@/lib/validation/auth";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/supabase/auth-errors";

type FormErrors = {
  email?: string;
  password?: string;
  form?: string;
};

function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) return;

    setIsSubmitting(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      setErrors({ form: translateAuthError(error?.message ?? "") });
      setIsSubmitting(false);
      return;
    }

    if (redirectTo) {
      router.push(redirectTo);
      router.refresh();
      return;
    }

    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspaces(slug)")
      .eq("user_id", data.user.id)
      .limit(1)
      .maybeSingle();

    const workspaceSlug = (membership?.workspaces as { slug?: string } | null)?.slug;
    router.push(workspaceSlug ? `/${workspaceSlug}` : "/onboarding");
    router.refresh();
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <FieldGroup>
        {errors.form && (
          <div role="alert" className="text-sm font-medium text-destructive">
            {errors.form}
          </div>
        )}

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@empresa.com"
            value={email}
            aria-invalid={!!errors.email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <FieldError>{errors.email}</FieldError>
        </Field>

        <Field data-invalid={!!errors.password}>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Senha</FieldLabel>
            <Link
              href="#"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            aria-invalid={!!errors.password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <FieldError>{errors.password}</FieldError>
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </FieldGroup>
    </form>
  );
}

export { LoginForm };
