"use server";

import { revalidatePath } from "next/cache";

import { sendWorkspaceInviteEmail } from "@/lib/email/invite";
import { createClient } from "@/lib/supabase/server";
import type { Database, WorkspaceInviteStatus, WorkspaceRole } from "@/lib/supabase/types";
import type { ActionResult } from "@/lib/actions/types";
import { validateEmail } from "@/lib/validation/auth";
import { getWorkspaceBySlug, resolveWorkspaceId } from "@/lib/workspace";

type InviteRow = Database["public"]["Tables"]["workspace_invites"]["Row"];

export type InvitePreview = {
  workspaceName: string;
  workspaceSlug: string;
  email: string;
  role: WorkspaceRole;
  status: WorkspaceInviteStatus;
  expiresAt: string;
  isExpired: boolean;
};

function translateInviteError(message: string | undefined): string {
  if (!message) return "Não foi possível concluir a operação.";
  if (message.includes("not_authorized")) return "Apenas administradores podem convidar colaboradores.";
  if (message.includes("plan_member_limit")) {
    return "O plano Free permite no máximo 2 membros. Faça upgrade para o plano Pro para convidar mais colaboradores.";
  }
  if (message.includes("already_member")) return "Esse e-mail já faz parte do workspace.";
  if (message.includes("not_authenticated")) return "Você precisa entrar para aceitar o convite.";
  if (message.includes("invite_not_found")) return "Convite não encontrado.";
  if (message.includes("invite_not_pending")) return "Este convite já foi utilizado ou revogado.";
  if (message.includes("invite_expired")) return "Este convite expirou.";
  if (message.includes("email_mismatch")) return "Este convite foi enviado para outro e-mail.";
  return "Não foi possível concluir a operação.";
}

export async function listInvites(workspaceSlug: string): Promise<ActionResult<InviteRow[]>> {
  const supabase = await createClient();
  const workspaceId = await resolveWorkspaceId(supabase, workspaceSlug);

  if (!workspaceId) {
    return { success: false, error: "Você não tem acesso a este workspace." };
  }

  const { data, error } = await supabase
    .from("workspace_invites")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { success: false, error: "Não foi possível carregar os convites." };
  }

  return { success: true, data };
}

export async function createInvite(
  workspaceSlug: string,
  email: string,
  role: WorkspaceRole,
): Promise<ActionResult<InviteRow>> {
  const supabase = await createClient();
  const workspaceId = await resolveWorkspaceId(supabase, workspaceSlug);

  if (!workspaceId) {
    return { success: false, error: "Você não tem acesso a este workspace." };
  }

  const emailError = validateEmail(email);
  if (emailError) {
    return {
      success: false,
      error: "Verifique os campos do formulário.",
      fieldErrors: { email: emailError },
    };
  }

  const workspaceRow = await getWorkspaceBySlug(workspaceSlug);

  const { data, error } = await supabase.rpc("create_workspace_invite", {
    target_workspace_id: workspaceId,
    invite_email: email.trim().toLowerCase(),
    invite_role: role,
  });

  if (error || !data) {
    return { success: false, error: translateInviteError(error?.message) };
  }

  const { data: userData } = await supabase.auth.getUser();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteUrl = `${appUrl}/invite/${data.token}`;

  const emailResult = await sendWorkspaceInviteEmail({
    to: data.email,
    workspaceName: workspaceRow.name,
    role: data.role,
    inviteUrl,
    inviterEmail: userData.user?.email ?? "",
  });

  if (!emailResult.success) {
    await supabase.from("workspace_invites").delete().eq("id", data.id);
    return { success: false, error: "Não foi possível enviar o e-mail de convite. Tente novamente." };
  }

  revalidatePath(`/${workspaceSlug}/settings`);

  return { success: true, data };
}

export async function revokeInvite(workspaceSlug: string, inviteId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const workspaceId = await resolveWorkspaceId(supabase, workspaceSlug);

  if (!workspaceId) {
    return { success: false, error: "Você não tem acesso a este workspace." };
  }

  const { error } = await supabase
    .from("workspace_invites")
    .delete()
    .eq("id", inviteId)
    .eq("workspace_id", workspaceId);

  if (error) {
    return { success: false, error: "Não foi possível revogar o convite." };
  }

  revalidatePath(`/${workspaceSlug}/settings`);

  return { success: true, data: undefined };
}

export async function getInvitePreview(token: string): Promise<ActionResult<InvitePreview>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_invite_by_token", { invite_token: token });
  const row = data?.[0];

  if (error || !row) {
    return { success: false, error: "Convite inválido." };
  }

  return {
    success: true,
    data: {
      workspaceName: row.workspace_name,
      workspaceSlug: row.workspace_slug,
      email: row.email,
      role: row.role,
      status: row.status,
      expiresAt: row.expires_at,
      isExpired: new Date(row.expires_at).getTime() < Date.now(),
    },
  };
}

export async function acceptInvite(token: string): Promise<ActionResult<{ workspaceSlug: string }>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accept_workspace_invite", { invite_token: token });

  if (error || !data) {
    return { success: false, error: translateInviteError(error?.message) };
  }

  const { data: workspaceRow } = await supabase
    .from("workspaces")
    .select("slug")
    .eq("id", data.workspace_id)
    .maybeSingle();

  if (!workspaceRow) {
    return { success: false, error: "Convite aceito, mas não foi possível localizar o workspace." };
  }

  revalidatePath("/", "layout");

  return { success: true, data: { workspaceSlug: workspaceRow.slug } };
}
