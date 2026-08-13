import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import {
  createSupabaseMock,
  makeQueryBuilder,
  workspaceFoundBuilder,
  workspaceNotFoundBuilder,
} from "./test-utils";
import { createDeal, deleteDeal, listDeals, updateDealStage } from "@/lib/actions/deals";

const mockedCreateClient = vi.mocked(createClient);

const validInput = {
  title: "Proposta Enterprise",
  estimated_value: 1000,
  lead_id: "lead-1",
  owner_id: null,
  due_date: "2026-09-01",
  stage: "novo_lead" as const,
};

describe("listDeals", () => {
  beforeEach(() => vi.clearAllMocks());

  it("denies access when the caller is not a workspace member", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockReturnValue(workspaceNotFoundBuilder());
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await listDeals("acme");

    expect(result.success).toBe(false);
  });

  it("lists deals scoped to the resolved workspace", async () => {
    const supabase = createSupabaseMock();
    const dealsBuilder = makeQueryBuilder({ data: [{ id: "deal-1" }], error: null });
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceFoundBuilder();
      if (table === "deals") return dealsBuilder;
      throw new Error(`unexpected table ${table}`);
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await listDeals("acme");

    expect(result.success).toBe(true);
    expect(dealsBuilder.eq).toHaveBeenCalledWith("workspace_id", "workspace-1");
  });
});

describe("createDeal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns field errors when the title or lead is missing", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockReturnValue(workspaceFoundBuilder());
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await createDeal("acme", { ...validInput, title: "", lead_id: null });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.title).toBeDefined();
      expect(result.fieldErrors?.lead_id).toBeDefined();
    }
  });

  it("creates a deal on success", async () => {
    const supabase = createSupabaseMock();
    const insertBuilder = makeQueryBuilder({ data: { id: "deal-1", ...validInput }, error: null });
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceFoundBuilder();
      if (table === "deals") return insertBuilder;
      throw new Error(`unexpected table ${table}`);
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await createDeal("acme", validInput);

    expect(result.success).toBe(true);
    expect(insertBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ workspace_id: "workspace-1", title: validInput.title }),
    );
  });
});

describe("updateDealStage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("persists the new stage when dropped on a column", async () => {
    const supabase = createSupabaseMock();
    const updateBuilder = makeQueryBuilder({
      data: { id: "deal-1", stage: "negociacao" },
      error: null,
    });
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceFoundBuilder();
      if (table === "deals") return updateBuilder;
      throw new Error(`unexpected table ${table}`);
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await updateDealStage("acme", "deal-1", "negociacao");

    expect(result.success).toBe(true);
    expect(updateBuilder.update).toHaveBeenCalledWith({ stage: "negociacao" });
  });

  it("denies the move when the caller is not a workspace member", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockReturnValue(workspaceNotFoundBuilder());
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await updateDealStage("acme", "deal-1", "negociacao");

    expect(result.success).toBe(false);
  });
});

describe("deleteDeal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes a deal successfully", async () => {
    const supabase = createSupabaseMock();
    const deleteBuilder = makeQueryBuilder({ data: null, error: null });
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceFoundBuilder();
      if (table === "deals") return deleteBuilder;
      throw new Error(`unexpected table ${table}`);
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await deleteDeal("acme", "deal-1");

    expect(result.success).toBe(true);
    expect(deleteBuilder.delete).toHaveBeenCalled();
  });
});
