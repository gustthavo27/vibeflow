"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { WorkspaceRole } from "@/lib/supabase/types";
import type { ActionResult } from "@/lib/actions/types";
import { slugify, validateWorkspaceName } from "@/lib/validation/auth";

export type MyWorkspace = {
  id: string;
  slug: string;
  name: string;
  plan: "free" | "pro";
  role: WorkspaceRole;
};

export async function listMyWorkspaces(): Promise<ActionResult<MyWorkspace[]>> {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { success: false, error: "Não autenticado." };
  }

  const { data, error } = await supabase
    .from("workspace_members")
    .select("role, workspaces(id, slug, name, plan)")
    .eq("user_id", userData.user.id);

  if (error || !data) {
    return { success: false, error: "Não foi possível carregar seus workspaces." };
  }

  const workspaces = data
    .filter(
      (row): row is typeof row & { workspaces: NonNullable<(typeof row)["workspaces"]> } =>
        row.workspaces !== null,
    )
    .map((row) => ({
      id: row.workspaces.id,
      slug: row.workspaces.slug,
      name: row.workspaces.name,
      plan: row.workspaces.plan,
      role: row.role,
    }));

  return { success: true, data: workspaces };
}

export async function createWorkspace(name: string): Promise<ActionResult<{ slug: string }>> {
  const supabase = await createClient();

  const nameError = validateWorkspaceName(name);
  if (nameError) {
    return {
      success: false,
      error: "Verifique os campos do formulário.",
      fieldErrors: { name: nameError },
    };
  }

  const { data, error } = await supabase.rpc("create_workspace_with_owner", {
    workspace_name: name.trim(),
    workspace_slug: slugify(name),
  });

  if (error || !data) {
    return {
      success: false,
      error: error?.message.includes("duplicate key")
        ? "Já existe um workspace com esse nome. Escolha outro."
        : "Não foi possível criar o workspace.",
    };
  }

  revalidatePath("/", "layout");

  return { success: true, data: { slug: data.slug } };
}
