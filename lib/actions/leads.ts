"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database, LeadStatus } from "@/lib/supabase/types";
import {
  validateLeadCompany,
  validateLeadEmail,
  validateLeadName,
  validateLeadPhone,
} from "@/lib/validation/leads";
import type { ActionResult } from "@/lib/actions/types";
import { resolveWorkspaceId } from "@/lib/workspace";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];

export type LeadInput = {
  name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  status: LeadStatus;
  owner_id: string | null;
  deal_value: number;
  notes: string;
};

export type LeadFilters = {
  search?: string;
  status?: LeadStatus | "all";
};

function escapeOrFilterValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function validateLeadInput(input: LeadInput) {
  const fieldErrors: Record<string, string> = {};

  const nameError = validateLeadName(input.name);
  if (nameError) fieldErrors.name = nameError;

  const emailError = validateLeadEmail(input.email);
  if (emailError) fieldErrors.email = emailError;

  const phoneError = validateLeadPhone(input.phone);
  if (phoneError) fieldErrors.phone = phoneError;

  const companyError = validateLeadCompany(input.company);
  if (companyError) fieldErrors.company = companyError;

  return fieldErrors;
}

export async function listLeads(
  workspaceSlug: string,
  filters: LeadFilters = {},
): Promise<ActionResult<LeadRow[]>> {
  const supabase = await createClient();
  const workspaceId = await resolveWorkspaceId(supabase, workspaceSlug);

  if (!workspaceId) {
    return { success: false, error: "Você não tem acesso a este workspace." };
  }

  let query = supabase
    .from("leads")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.search?.trim()) {
    const term = escapeOrFilterValue(filters.search.trim());
    query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%,company.ilike.%${term}%`);
  }

  const { data, error } = await query;

  if (error || !data) {
    return { success: false, error: "Não foi possível carregar os leads." };
  }

  return { success: true, data };
}

export async function getLead(
  workspaceSlug: string,
  leadId: string,
): Promise<ActionResult<LeadRow>> {
  const supabase = await createClient();
  const workspaceId = await resolveWorkspaceId(supabase, workspaceSlug);

  if (!workspaceId) {
    return { success: false, error: "Você não tem acesso a este workspace." };
  }

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("id", leadId)
    .maybeSingle();

  if (error || !data) {
    return { success: false, error: "Lead não encontrado." };
  }

  return { success: true, data };
}

export async function createLead(
  workspaceSlug: string,
  input: LeadInput,
): Promise<ActionResult<LeadRow>> {
  const supabase = await createClient();
  const workspaceId = await resolveWorkspaceId(supabase, workspaceSlug);

  if (!workspaceId) {
    return { success: false, error: "Você não tem acesso a este workspace." };
  }

  const fieldErrors = validateLeadInput(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: "Verifique os campos do formulário.", fieldErrors };
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({
      workspace_id: workspaceId,
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      company: input.company.trim(),
      job_title: input.job_title.trim() || null,
      status: input.status,
      owner_id: input.owner_id,
      deal_value: input.deal_value,
      notes: input.notes.trim() || null,
    })
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: "Não foi possível cadastrar o lead." };
  }

  revalidatePath(`/${workspaceSlug}/leads`);
  revalidatePath(`/${workspaceSlug}`);

  return { success: true, data };
}

export async function updateLead(
  workspaceSlug: string,
  leadId: string,
  input: LeadInput,
): Promise<ActionResult<LeadRow>> {
  const supabase = await createClient();
  const workspaceId = await resolveWorkspaceId(supabase, workspaceSlug);

  if (!workspaceId) {
    return { success: false, error: "Você não tem acesso a este workspace." };
  }

  const fieldErrors = validateLeadInput(input);
  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: "Verifique os campos do formulário.", fieldErrors };
  }

  const { data, error } = await supabase
    .from("leads")
    .update({
      name: input.name.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      company: input.company.trim(),
      job_title: input.job_title.trim() || null,
      status: input.status,
      owner_id: input.owner_id,
      deal_value: input.deal_value,
      notes: input.notes.trim() || null,
    })
    .eq("workspace_id", workspaceId)
    .eq("id", leadId)
    .select("*")
    .single();

  if (error || !data) {
    return { success: false, error: "Não foi possível atualizar o lead." };
  }

  revalidatePath(`/${workspaceSlug}/leads`);
  revalidatePath(`/${workspaceSlug}/leads/${leadId}`);
  revalidatePath(`/${workspaceSlug}`);

  return { success: true, data };
}

export async function deleteLead(
  workspaceSlug: string,
  leadId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const workspaceId = await resolveWorkspaceId(supabase, workspaceSlug);

  if (!workspaceId) {
    return { success: false, error: "Você não tem acesso a este workspace." };
  }

  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", leadId);

  if (error) {
    return { success: false, error: "Não foi possível excluir o lead." };
  }

  revalidatePath(`/${workspaceSlug}/leads`);
  revalidatePath(`/${workspaceSlug}`);

  return { success: true, data: undefined };
}
