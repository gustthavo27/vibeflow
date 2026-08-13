import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];
export type WorkspaceMember = { user_id: string; email: string };

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
