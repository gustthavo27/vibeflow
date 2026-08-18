import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/stripe/client", () => ({
  getStripeClient: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { getStripeClient } from "@/lib/stripe/client";
import { createSupabaseMock, makeQueryBuilder } from "@/lib/actions/__tests__/test-utils";
import { createPortalSession } from "@/lib/stripe/portal";

const mockedCreateClient = vi.mocked(createClient);
const mockedGetStripeClient = vi.mocked(getStripeClient);

function workspaceRowBuilder(overrides: Partial<Record<string, unknown>> = {}) {
  return makeQueryBuilder({
    data: {
      id: "workspace-1",
      name: "Acme Vendas",
      slug: "acme",
      plan: "pro",
      stripe_customer_id: "cus_123",
      created_by: "user-1",
      created_at: "",
      updated_at: "",
      ...overrides,
    },
    error: null,
  });
}

describe("createPortalSession", () => {
  beforeEach(() => vi.clearAllMocks());

  it("denies non-admins", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceRowBuilder();
      if (table === "workspace_members") return makeQueryBuilder({ data: { role: "member" }, error: null });
      throw new Error(`unexpected table ${table}`);
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await createPortalSession("acme");

    expect(result.success).toBe(false);
    expect(mockedGetStripeClient).not.toHaveBeenCalled();
  });

  it("refuses workspaces without a Stripe customer", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceRowBuilder({ stripe_customer_id: null });
      if (table === "workspace_members") return makeQueryBuilder({ data: { role: "admin" }, error: null });
      throw new Error(`unexpected table ${table}`);
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await createPortalSession("acme");

    expect(result.success).toBe(false);
  });

  it("creates a billing portal session for an admin", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceRowBuilder();
      if (table === "workspace_members") return makeQueryBuilder({ data: { role: "admin" }, error: null });
      throw new Error(`unexpected table ${table}`);
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const create = vi.fn().mockResolvedValue({ url: "https://billing.stripe.com/session-1" });
    mockedGetStripeClient.mockReturnValue({
      billingPortal: { sessions: { create } },
    } as never);

    const result = await createPortalSession("acme");

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.url).toBe("https://billing.stripe.com/session-1");
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "cus_123" }),
    );
  });
});
