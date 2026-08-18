"use server";

import { getStripeClient } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/types";
import { getCurrentUserRole, getWorkspaceBySlug, resolveWorkspaceId } from "@/lib/workspace";

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function createCheckoutSession(workspaceSlug: string): Promise<ActionResult<{ url: string }>> {
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
  if (workspace.plan === "pro") {
    return { success: false, error: "Este workspace já está no plano Pro." };
  }

  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO;
  if (!priceId) {
    return { success: false, error: "Configuração de preço do plano Pro ausente." };
  }

  const { data: userData } = await supabase.auth.getUser();
  const appUrl = getAppUrl();

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: workspaceId,
      customer: workspace.stripe_customer_id ?? undefined,
      customer_email: workspace.stripe_customer_id ? undefined : userData.user?.email,
      metadata: { workspace_id: workspaceId },
      subscription_data: { metadata: { workspace_id: workspaceId } },
      success_url: `${appUrl}/${workspaceSlug}/settings?checkout=success`,
      cancel_url: `${appUrl}/${workspaceSlug}/settings?checkout=cancelled`,
    });

    if (!session.url) {
      return { success: false, error: "Não foi possível iniciar o checkout." };
    }

    return { success: true, data: { url: session.url } };
  } catch {
    return { success: false, error: "Não foi possível iniciar o checkout." };
  }
}
