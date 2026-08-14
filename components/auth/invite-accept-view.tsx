"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { acceptInvite, type InvitePreview } from "@/lib/actions/invites";
import { WORKSPACE_ROLE_LABELS } from "@/lib/labels";

function InviteAcceptView({
  token,
  preview,
  currentUserEmail,
}: {
  token: string;
  preview: InvitePreview;
  currentUserEmail: string | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (preview.status !== "pending" || preview.isExpired) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        {preview.status === "accepted"
          ? "Este convite já foi aceito."
          : preview.status === "revoked"
            ? "Este convite foi revogado pelo administrador do workspace."
            : "Este convite expirou. Peça um novo convite ao administrador do workspace."}
      </p>
    );
  }

  async function handleAccept() {
    setIsSubmitting(true);
    setError(undefined);
    const result = await acceptInvite(token);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push(`/${result.data.workspaceSlug}`);
    router.refresh();
  }

  if (!currentUserEmail) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-sm text-muted-foreground">
          Este convite é para <strong className="text-foreground">{preview.email}</strong>, como{" "}
          <strong className="text-foreground">{WORKSPACE_ROLE_LABELS[preview.role]}</strong>. Entre
          ou crie uma conta com esse e-mail para aceitar.
        </p>
        <div className="flex flex-col gap-2">
          <Button size="lg" nativeButton={false} render={<Link href={`/login?redirect=/invite/${token}`} />}>
            Entrar
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href={`/signup?redirect=/invite/${token}`} />}
          >
            Criar conta
          </Button>
        </div>
      </div>
    );
  }

  if (currentUserEmail.toLowerCase() !== preview.email.toLowerCase()) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Este convite foi enviado para <strong className="text-foreground">{preview.email}</strong>,
        mas você está autenticado como <strong className="text-foreground">{currentUserEmail}</strong>
        . Saia e entre novamente com o e-mail correto para aceitar.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 text-center">
      {error && (
        <div role="alert" className="text-sm font-medium text-destructive">
          {error}
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        Você foi convidado como{" "}
        <strong className="text-foreground">{WORKSPACE_ROLE_LABELS[preview.role]}</strong>.
      </p>
      <Button size="lg" disabled={isSubmitting} onClick={handleAccept}>
        {isSubmitting && <Loader2 className="animate-spin" />}
        {isSubmitting ? "Aceitando..." : "Aceitar convite"}
      </Button>
    </div>
  );
}

export { InviteAcceptView };
