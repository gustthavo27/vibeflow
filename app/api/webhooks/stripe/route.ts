import type Stripe from "stripe";

import { getStripeClient } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";

async function syncSubscription(customerId: string, subscription: Stripe.Subscription | null) {
  const supabase = createAdminClient();

  const isActive = subscription
    ? subscription.status === "active" || subscription.status === "trialing"
    : false;

  await supabase
    .from("workspaces")
    .update({
      plan: isActive ? "pro" : "free",
      stripe_subscription_id: subscription?.id ?? null,
      subscription_status: subscription?.status ?? null,
    })
    .eq("stripe_customer_id", customerId);
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return new Response("Missing signature", { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const workspaceId = session.metadata?.workspace_id ?? session.client_reference_id;
      const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;

      if (workspaceId && customerId) {
        const supabase = createAdminClient();
        await supabase
          .from("workspaces")
          .update({ stripe_customer_id: customerId })
          .eq("id", workspaceId);

        if (typeof session.subscription === "string") {
          const subscription = await getStripeClient().subscriptions.retrieve(session.subscription);
          await syncSubscription(customerId, subscription);
        }
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId =
        typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

      await syncSubscription(
        customerId,
        event.type === "customer.subscription.deleted" ? null : subscription,
      );
      break;
    }

    default:
      break;
  }

  return new Response(null, { status: 200 });
}
