"use server";

import { getStripeClient } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/types";
import { getCurrentUserRole, getWorkspaceBySlug, resolveWorkspaceId } from "@/lib/workspace";

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function createPortalSession(workspaceSlug: string): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient();
  const workspaceId = await resolveWorkspaceId(supabase, workspaceSlug);

  if (!workspaceId) {
    return { success: false, error: "Você não tem acesso a este workspace." };
  }

  const role = await getCurrentUserRole(supabase, workspaceId);
  if (role !== "admin") {
    return { success: false, error: "Apenas administradores podem gerenciar a assinatura." };
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug);
  if (!workspace.stripe_customer_id) {
    return { success: false, error: "Este workspace ainda não possui uma assinatura." };
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: workspace.stripe_customer_id,
      return_url: `${getAppUrl()}/${workspaceSlug}/settings`,
    });

    return { success: true, data: { url: session.url } };
  } catch {
    return { success: false, error: "Não foi possível abrir o portal de gerenciamento." };
  }
}
