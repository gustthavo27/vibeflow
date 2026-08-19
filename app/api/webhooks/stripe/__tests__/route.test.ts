import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/stripe/client", () => ({
  getStripeClient: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

import { getStripeClient } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { POST } from "@/app/api/webhooks/stripe/route";

const mockedGetStripeClient = vi.mocked(getStripeClient);
const mockedCreateAdminClient = vi.mocked(createAdminClient);

function makeRequest(body: string) {
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers: { "stripe-signature": "sig_test" },
    body,
  });
}

function makeUpdateChain() {
  const eq = vi.fn().mockResolvedValue({ error: null });
  const update = vi.fn(() => ({ eq }));
  return { update, eq };
}

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
  });

  it("rejects requests with an invalid signature", async () => {
    const constructEvent = vi.fn(() => {
      throw new Error("bad signature");
    });
    mockedGetStripeClient.mockReturnValue({ webhooks: { constructEvent } } as never);

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(400);
    expect(mockedCreateAdminClient).not.toHaveBeenCalled();
  });

  it("activates the Pro plan on checkout.session.completed", async () => {
    const workspacesChain = makeUpdateChain();
    const admin = { from: vi.fn(() => workspacesChain) };
    mockedCreateAdminClient.mockReturnValue(admin as never);

    const subscriptionsRetrieve = vi.fn().mockResolvedValue({ id: "sub_1", status: "active" });
    const constructEvent = vi.fn().mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { workspace_id: "workspace-1" },
          client_reference_id: "workspace-1",
          customer: "cus_123",
          subscription: "sub_1",
        },
      },
    });
    mockedGetStripeClient.mockReturnValue({
      webhooks: { constructEvent },
      subscriptions: { retrieve: subscriptionsRetrieve },
    } as never);

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(200);
    expect(workspacesChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ stripe_customer_id: "cus_123" }),
    );
    expect(workspacesChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ plan: "pro", stripe_subscription_id: "sub_1" }),
    );
  });

  it("downgrades to Free on customer.subscription.deleted", async () => {
    const workspacesChain = makeUpdateChain();
    const admin = { from: vi.fn(() => workspacesChain) };
    mockedCreateAdminClient.mockReturnValue(admin as never);

    const constructEvent = vi.fn().mockReturnValue({
      type: "customer.subscription.deleted",
      data: { object: { id: "sub_1", customer: "cus_123", status: "canceled" } },
    });
    mockedGetStripeClient.mockReturnValue({ webhooks: { constructEvent } } as never);

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(200);
    expect(workspacesChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ plan: "free", stripe_subscription_id: null }),
    );
    expect(workspacesChain.eq).toHaveBeenCalledWith("stripe_customer_id", "cus_123");
  });

  it("marks the subscription as payment_failed on invoice.payment_failed", async () => {
    const workspacesChain = makeUpdateChain();
    const admin = { from: vi.fn(() => workspacesChain) };
    mockedCreateAdminClient.mockReturnValue(admin as never);

    const constructEvent = vi.fn().mockReturnValue({
      type: "invoice.payment_failed",
      data: { object: { customer: "cus_123" } },
    });
    mockedGetStripeClient.mockReturnValue({ webhooks: { constructEvent } } as never);

    const response = await POST(makeRequest("{}"));

    expect(response.status).toBe(200);
    expect(workspacesChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ subscription_status: "payment_failed" }),
    );
    expect(workspacesChain.eq).toHaveBeenCalledWith("stripe_customer_id", "cus_123");
  });
});
