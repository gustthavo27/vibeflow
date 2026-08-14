import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { InviteAcceptView } from "@/components/auth/invite-accept-view";
import { getInvitePreview } from "@/lib/actions/invites";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Convite | VibeFlow CRM",
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const preview = await getInvitePreview(token);
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!preview.success) {
    return (
      <AuthCard title="Convite inválido" description="Este link de convite não é válido.">
        <p className="text-sm text-muted-foreground">
          Verifique se copiou o link completo ou peça um novo convite ao administrador do workspace.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Convite para colaborar"
      description={`Você foi convidado para o workspace ${preview.data.workspaceName}.`}
    >
      <InviteAcceptView
        token={token}
        preview={preview.data}
        currentUserEmail={userData.user?.email ?? null}
      />
    </AuthCard>
  );
}
