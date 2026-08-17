"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { WorkspaceRole } from "@/lib/supabase/types";
import type { ActionResult } from "@/lib/actions/types";
import { getCurrentUserRole, resolveWorkspaceId, type WorkspaceMember } from "@/lib/workspace";

export async function listMembers(workspaceSlug: string): Promise<ActionResult<WorkspaceMember[]>> {
  const supabase = await createClient();
  const workspaceId = await resolveWorkspaceId(supabase, workspaceSlug);

  if (!workspaceId) {
    return { success: false, error: "Você não tem acesso a este workspace." };
  }

  const { data, error } = await supabase.rpc("list_workspace_members", {
    target_workspace_id: workspaceId,
  });

  if (error || !data) {
    return { success: false, error: "Não foi possível carregar os colaboradores." };
  }

  return { success: true, data };
}

export async function removeMember(
  workspaceSlug: string,
  userId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const workspaceId = await resolveWorkspaceId(supabase, workspaceSlug);

  if (!workspaceId) {
    return { success: false, error: "Você não tem acesso a este workspace." };
  }

  const role = await getCurrentUserRole(supabase, workspaceId);
  if (role !== "admin") {
    return { success: false, error: "Apenas administradores podem remover colaboradores." };
  }

  const { data: userData } = await supabase.auth.getUser();
  if (userData.user?.id === userId) {
    return { success: false, error: "Você não pode remover a si mesmo. Peça a outro administrador." };
  }

  const { data: members, error: membersError } = await supabase
    .from("workspace_members")
    .select("user_id, role")
    .eq("workspace_id", workspaceId);

  if (membersError || !members) {
    return { success: false, error: "Não foi possível validar os colaboradores." };
  }

  const target = members.find((member) => member.user_id === userId);
  if (target?.role === "admin") {
    const adminCount = members.filter((member) => member.role === "admin").length;
    if (adminCount <= 1) {
      return { success: false, error: "O workspace precisa ter ao menos um administrador." };
    }
  }

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId);

  if (error) {
    return { success: false, error: "Não foi possível remover o colaborador." };
  }

  revalidatePath(`/${workspaceSlug}/settings`);

  return { success: true, data: undefined };
}

export async function changeMemberRole(
  workspaceSlug: string,
  userId: string,
  role: WorkspaceRole,
): Promise<ActionResult> {
  const supabase = await createClient();
  const workspaceId = await resolveWorkspaceId(supabase, workspaceSlug);

  if (!workspaceId) {
    return { success: false, error: "Você não tem acesso a este workspace." };
  }

  const callerRole = await getCurrentUserRole(supabase, workspaceId);
  if (callerRole !== "admin") {
    return { success: false, error: "Apenas administradores podem alterar papéis." };
  }

  if (role === "member") {
    const { data: members, error: membersError } = await supabase
      .from("workspace_members")
      .select("user_id, role")
      .eq("workspace_id", workspaceId);

    if (membersError || !members) {
      return { success: false, error: "Não foi possível validar os colaboradores." };
    }

    const target = members.find((member) => member.user_id === userId);
    const adminCount = members.filter((member) => member.role === "admin").length;
    if (target?.role === "admin" && adminCount <= 1) {
      return { success: false, error: "O workspace precisa ter ao menos um administrador." };
    }
  }

  const { error } = await supabase
    .from("workspace_members")
    .update({ role })
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId);

  if (error) {
    return { success: false, error: "Não foi possível atualizar o papel do colaborador." };
  }

  revalidatePath(`/${workspaceSlug}/settings`);

  return { success: true, data: undefined };
}
