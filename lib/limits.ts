import { createClient } from "@/lib/supabase/server";
import { FREE_PLAN_LEAD_LIMIT, FREE_PLAN_MEMBER_LIMIT } from "@/lib/labels";

export type PlanLimitStatus = {
  allowed: boolean;
  current: number;
  limit: number | null;
};

async function getWorkspacePlan(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workspaceId: string,
): Promise<"free" | "pro" | null> {
  const { data, error } = await supabase
    .from("workspaces")
    .select("plan")
    .eq("id", workspaceId)
    .maybeSingle();

  if (error || !data) return null;
  return data.plan;
}

// Plano Pro não tem limite; plano Free permite no máximo 50 leads. Espelha a
// regra aplicada pelo trigger `enforce_lead_plan_limit` no banco — este check
// é só para dar feedback rápido/amigável antes do insert, o trigger continua
// sendo a fonte de verdade sob concorrência.
export async function canAddLead(workspaceId: string): Promise<PlanLimitStatus> {
  const supabase = await createClient();
  const plan = await getWorkspacePlan(supabase, workspaceId);

  if (plan !== "free") {
    return { allowed: true, current: 0, limit: null };
  }

  const { count } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);

  const current = count ?? 0;
  return { allowed: current < FREE_PLAN_LEAD_LIMIT, current, limit: FREE_PLAN_LEAD_LIMIT };
}

// Plano Pro não tem limite; plano Free permite no máximo 2 membros, contando
// convites pendentes — espelha a regra da função `create_workspace_invite`.
// `renewingEmail` exclui do total um convite pendente já existente para o
// mesmo e-mail, já que renová-lo não ocupa uma vaga extra (mesma exceção
// aplicada pela função no banco).
export async function canAddMember(
  workspaceId: string,
  renewingEmail?: string,
): Promise<PlanLimitStatus> {
  const supabase = await createClient();
  const plan = await getWorkspacePlan(supabase, workspaceId);

  if (plan !== "free") {
    return { allowed: true, current: 0, limit: null };
  }

  let pendingQuery = supabase
    .from("workspace_invites")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("status", "pending");

  if (renewingEmail) {
    pendingQuery = pendingQuery.neq("email", renewingEmail.trim().toLowerCase());
  }

  const [{ count: memberCount }, { count: pendingCount }] = await Promise.all([
    supabase
      .from("workspace_members")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    pendingQuery,
  ]);

  const current = (memberCount ?? 0) + (pendingCount ?? 0);
  return { allowed: current < FREE_PLAN_MEMBER_LIMIT, current, limit: FREE_PLAN_MEMBER_LIMIT };
}
