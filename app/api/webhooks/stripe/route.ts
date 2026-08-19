import type Stripe from "stripe";
import { NextResponse } from "next/server";

import { getStripeClient } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

async function activatePro(session: Stripe.Checkout.Session) {
  const workspaceId = session.metadata?.workspace_id ?? session.client_reference_id;
  const userId = session.metadata?.user_id;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  const subscriptionId =
    typeof session.subscription === "string" ? session.subscription : session.subscription?.id;

  if (!workspaceId || !customerId) return;

  const supabase = createAdminClient();
  await supabase
    .from("workspaces")
    .update({
      plan: "pro",
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId ?? null,
      subscription_status: "active",
    })
    .eq("id", workspaceId);

  console.info(
    `[stripe:webhook] checkout concluído workspace=${workspaceId} user=${userId ?? "desconhecido"} customer=${customerId}`,
  );
}

async function downgradeToFree(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  const supabase = createAdminClient();
  await supabase
    .from("workspaces")
    .update({ plan: "free", stripe_subscription_id: null, subscription_status: "canceled" })
    .eq("stripe_customer_id", customerId);
}

async function markPaymentFailed(invoice: Stripe.Invoice) {
  const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
  if (!customerId) return;

  const supabase = createAdminClient();
  await supabase
    .from("workspaces")
    .update({ subscription_status: "payment_failed" })
    .eq("stripe_customer_id", customerId);
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // O body precisa ser lido como texto puro (não JSON): o Stripe assina o
  // payload raw, e qualquer parse/re-serialização antes da verificação
  // invalida a assinatura.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await activatePro(event.data.object);
      break;

    case "customer.subscription.deleted":
      await downgradeToFree(event.data.object);
      break;

    case "invoice.payment_failed":
      await markPaymentFailed(event.data.object);
      break;

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
