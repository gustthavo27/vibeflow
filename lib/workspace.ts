import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];
export type WorkspaceRole = Database["public"]["Tables"]["workspace_members"]["Row"]["role"];
export type WorkspaceMember = { user_id: string; email: string; role: WorkspaceRole };
export type CurrentUser = { name: string; email: string; initials: string };

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export async function getCurrentUserDisplay(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<CurrentUser | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) return null;

  const fullName = (data.user.user_metadata as { full_name?: string } | null)?.full_name;
  const name = fullName?.trim() || data.user.email.split("@")[0];

  return { name, email: data.user.email, initials: deriveInitials(name) };
}

export async function getWorkspaceBySlug(slug: string): Promise<Workspace> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("workspaces").select("*").eq("slug", slug).maybeSingle();

  if (error || !data) {
    notFound();
  }

  return data;
}

export async function resolveWorkspaceId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string,
): Promise<string | null> {
  const { data, error } = await supabase.from("workspaces").select("id").eq("slug", slug).maybeSingle();

  if (error || !data) return null;
  return data.id;
}

export async function listWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_workspace_members", {
    target_workspace_id: workspaceId,
  });

  if (error || !data) return [];

  return data;
}

export async function getCurrentUserRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workspaceId: string,
): Promise<WorkspaceRole | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;

  const { data, error } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userData.user.id)
    .maybeSingle();

  if (error || !data) return null;

  return data.role;
}
