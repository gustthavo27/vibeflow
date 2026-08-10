"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { validateEmail, validatePassword } from "@/lib/validation/auth";
import { mockWorkspaces } from "@/lib/mock-data";

type FormErrors = {
  email?: string;
  password?: string;
};

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) return;

    setIsSubmitting(true);
    setTimeout(() => {
      router.push(`/${mockWorkspaces[0].slug}`);
    }, 800);
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <FieldGroup>
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
