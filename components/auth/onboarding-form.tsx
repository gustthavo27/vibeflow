"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { slugify, validateWorkspaceName } from "@/lib/validation/auth";

function OnboardingForm() {
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState("");
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextError = validateWorkspaceName(workspaceName);
    setError(nextError);

    if (nextError) return;

    setIsSubmitting(true);
    setTimeout(() => {
      router.push(`/${slugify(workspaceName)}`);
    }, 800);
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <FieldGroup>
        <Field data-invalid={!!error}>
          <FieldLabel htmlFor="workspaceName">Nome do workspace</FieldLabel>
          <Input
            id="workspaceName"
            autoComplete="organization"
            placeholder="Ex.: Acme Vendas"
            value={workspaceName}
            aria-invalid={!!error}
            onChange={(event) => setWorkspaceName(event.target.value)}
          />
          {error ? (
            <FieldError>{error}</FieldError>
          ) : (
            <FieldDescription>
              Esse será o nome da sua empresa ou equipe dentro do VibeFlow.
            </FieldDescription>
          )}
        </Field>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isSubmitting ? "Criando workspace..." : "Criar workspace"}
        </Button>
      </FieldGroup>
    </form>
  );
}

export { OnboardingForm };
