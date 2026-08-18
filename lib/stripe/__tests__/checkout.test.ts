import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/stripe/client", () => ({
  getStripeClient: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/client";
import { createSupabaseMock, makeQueryBuilder, workspaceNotFoundBuilder } from "@/lib/actions/__tests__/test-utils";
import { createCheckoutSession } from "@/lib/stripe/checkout";

const mockedCreateClient = vi.mocked(createClient);
const mockedGetStripeClient = vi.mocked(getStripeClient);

function workspaceRowBuilder(overrides: Partial<Record<string, unknown>> = {}) {
  return makeQueryBuilder({
    data: {
      id: "workspace-1",
      name: "Acme Vendas",
      slug: "acme",
      plan: "free",
      stripe_customer_id: null,
      created_by: "user-1",
      created_at: "",
      updated_at: "",
      ...overrides,
    },
    error: null,
  });
}

describe("createCheckoutSession", () => {
  const originalPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO = "price_123";
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO = originalPriceId;
  });

  it("denies access when the caller does not belong to the workspace", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockReturnValue(workspaceNotFoundBuilder());
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await createCheckoutSession("acme");

    expect(result.success).toBe(false);
    expect(mockedGetStripeClient).not.toHaveBeenCalled();
  });

  it("denies non-admins", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceRowBuilder();
      if (table === "workspace_members") return makeQueryBuilder({ data: { role: "member" }, error: null });
      throw new Error(`unexpected table ${table}`);
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await createCheckoutSession("acme");

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/administradores/i);
  });

  it("refuses to checkout a workspace already on the Pro plan", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceRowBuilder({ plan: "pro" });
      if (table === "workspace_members") return makeQueryBuilder({ data: { role: "admin" }, error: null });
      throw new Error(`unexpected table ${table}`);
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await createCheckoutSession("acme");

    expect(result.success).toBe(false);
  });

  it("creates a Stripe Checkout session for an admin on the Free plan", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceRowBuilder();
      if (table === "workspace_members") return makeQueryBuilder({ data: { role: "admin" }, error: null });
      throw new Error(`unexpected table ${table}`);
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const create = vi.fn().mockResolvedValue({ url: "https://checkout.stripe.com/session-1" });
    mockedGetStripeClient.mockReturnValue({
      checkout: { sessions: { create } },
    } as never);

    const result = await createCheckoutSession("acme");

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.url).toBe("https://checkout.stripe.com/session-1");
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        client_reference_id: "workspace-1",
        metadata: { workspace_id: "workspace-1" },
      }),
    );
  });
});
