"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database, DealStage } from "@/lib/supabase/types";
import { validateDealDueDate, validateDealEstimatedValue, validateDealTitle } from "@/lib/validation/deals";
import type { ActionResult } from "@/lib/actions/types";
import { resolveWorkspaceId } from "@/lib/workspace";

type DealRow = Database["public"]["Tables"]["deals"]["Row"];

export type DealInput = {
  title: string;
  estimated_value: number;
  lead_id: string | null;
  owner_id: string | null;
  due_date: string | null;
  stage: DealStage;
};

function validateDealInput(input: DealInput) {
  const fieldErrors: Record<string, string> = {};

  const titleError = validateDealTitle(input.title);
  if (titleError) fieldErrors.title = titleError;

  const valueError = validateDealEstimatedValue(input.estimated_value);
  if (valueError) fieldErrors.estimated_value = valueError;

  const dueDateError = validateDealDueDate(input.due_date ?? "");
  if (dueDateError) fieldErrors.due_date = dueDateError;

  if (!input.lead_id) fieldErrors.lead_id = "Selecione um lead vinculado.";

  return fieldErrors;
}

export async function listDeals(workspaceSlug: string): Promise<ActionResult<DealRow[]>> {
  const supabase = await createClient();
  const workspaceId = await resolveWorkspaceId(supabase, workspaceSlug);

  if (!workspaceId) {
    return { success: false, error: "Você não tem acesso a este workspace." };
  }

  const { data, error } = await supabase
    .from("deals")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return { success: false, error: "Não foi possível carregar os negócios." };
  }

  return { success: true, data };
}

export async function createDeal(
  workspaceSlug: string,
  input: DealInput,
): Promise<ActionResult<DealRow>> {
  const supabase = await createClient();
  const workspaceId = await resolveWorkspaceId(supabase, workspaceSlug);

  if (!workspaceId) {
    return { success: false, error: "Você não tem acesso a este workspace." };
  }

  const fieldErrors = validateDealInput(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: "Verifique os campos do formulário.", fieldErrors };
  }

  const { data, error } = await supabase
    .from("deals")
    .insert({
      workspace_id: workspaceId,
      title: input.title.trim(),
      estimated_value: input.estimated_value,
      lead_id: input.lead_id,
      owner_id: input.owner_id,
      due_date: input.due_date,
      stage: input.stage,
    })
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: "Não foi possível cadastrar o negócio." };
  }

  revalidatePath(`/${workspaceSlug}/pipeline`);
  revalidatePath(`/${workspaceSlug}`);

  return { success: true, data };
}

export async function updateDeal(
  workspaceSlug: string,
  dealId: string,
  input: DealInput,
): Promise<ActionResult<DealRow>> {
  const supabase = await createClient();
  const workspaceId = await resolveWorkspaceId(supabase, workspaceSlug);

  if (!workspaceId) {
    return { success: false, error: "Você não tem acesso a este workspace." };
  }

  const fieldErrors = validateDealInput(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: "Verifique os campos do formulário.", fieldErrors };
  }

  const { data, error } = await supabase
    .from("deals")
    .update({
      title: input.title.trim(),
      estimated_value: input.estimated_value,
      lead_id: input.lead_id,
      owner_id: input.owner_id,
      due_date: input.due_date,
      stage: input.stage,
    })
    .eq("workspace_id", workspaceId)
    .eq("id", dealId)
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: "Não foi possível atualizar o negócio." };
  }

  revalidatePath(`/${workspaceSlug}/pipeline`);
  revalidatePath(`/${workspaceSlug}`);

  return { success: true, data };
}

export async function updateDealStage(
  workspaceSlug: string,
  dealId: string,
  stage: DealStage,
): Promise<ActionResult<DealRow>> {
  const supabase = await createClient();
  const workspaceId = await resolveWorkspaceId(supabase, workspaceSlug);

  if (!workspaceId) {
    return { success: false, error: "Você não tem acesso a este workspace." };
  }

  const { data, error } = await supabase
    .from("deals")
    .update({ stage })
    .eq("workspace_id", workspaceId)
    .eq("id", dealId)
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: "Não foi possível mover o negócio." };
  }

  revalidatePath(`/${workspaceSlug}/pipeline`);
  revalidatePath(`/${workspaceSlug}`);

  return { success: true, data };
}

export async function deleteDeal(
  workspaceSlug: string,
  dealId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const workspaceId = await resolveWorkspaceId(supabase, workspaceSlug);

  if (!workspaceId) {
    return { success: false, error: "Você não tem acesso a este workspace." };
  }

  const { error } = await supabase
    .from("deals")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", dealId);

  if (error) {
    return { success: false, error: "Não foi possível excluir o negócio." };
  }

  revalidatePath(`/${workspaceSlug}/pipeline`);
  revalidatePath(`/${workspaceSlug}`);

  return { success: true, data: undefined };
}
