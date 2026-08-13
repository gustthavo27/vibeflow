"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { ActivityType, Database } from "@/lib/supabase/types";
import { validateActivityDescription } from "@/lib/validation/activities";
import type { ActionResult } from "@/lib/actions/types";
import { resolveWorkspaceId } from "@/lib/workspace";

type ActivityRow = Database["public"]["Tables"]["activities"]["Row"];

export type ActivityInput = {
  type: ActivityType;
  description: string;
};

export type ActivityFilters = {
  type?: ActivityType | "all";
};

export async function listActivities(
  workspaceSlug: string,
  leadId: string,
  filters: ActivityFilters = {},
): Promise<ActionResult<ActivityRow[]>> {
  const supabase = await createClient();
  const workspaceId = await resolveWorkspaceId(supabase, workspaceSlug);

  if (!workspaceId) {
    return { success: false, error: "Você não tem acesso a este workspace." };
  }

  let query = supabase
    .from("activities")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (filters.type && filters.type !== "all") {
    query = query.eq("type", filters.type);
  }

  const { data, error } = await query;

  if (error || !data) {
    return { success: false, error: "Não foi possível carregar as atividades." };
  }

  return { success: true, data };
}

export async function createActivity(
  workspaceSlug: string,
  leadId: string,
  input: ActivityInput,
): Promise<ActionResult<ActivityRow>> {
  const supabase = await createClient();
  const workspaceId = await resolveWorkspaceId(supabase, workspaceSlug);

  if (!workspaceId) {
    return { success: false, error: "Você não tem acesso a este workspace." };
  }

  const descriptionError = validateActivityDescription(input.description);
  if (descriptionError) {
    return {
      success: false,
      error: "Verifique os campos do formulário.",
      fieldErrors: { description: descriptionError },
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("activities")
    .insert({
      workspace_id: workspaceId,
      lead_id: leadId,
      type: input.type,
      description: input.description.trim(),
      author_id: user?.id ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: "Não foi possível registrar a atividade." };
  }

  revalidatePath(`/${workspaceSlug}/leads/${leadId}`);

  return { success: true, data };
}
