"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { slugify, validateWorkspaceName } from "@/lib/validation/auth";
import { createClient } from "@/lib/supabase/client";

function OnboardingForm() {
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState("");
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextError = validateWorkspaceName(workspaceName);
    setError(nextError);

    if (nextError) return;

    setIsSubmitting(true);

    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("create_workspace_with_owner", {
      workspace_name: workspaceName,
      workspace_slug: slugify(workspaceName),
    });

    if (rpcError || !data) {
      setError(
        rpcError?.message.includes("duplicate key")
          ? "Já existe um workspace com esse nome. Escolha outro."
          : "Não foi possível criar o workspace. Tente novamente.",
      );
      setIsSubmitting(false);
      return;
    }

    router.push(`/${data.slug}`);
    router.refresh();
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
