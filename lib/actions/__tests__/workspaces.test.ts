import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { createSupabaseMock, makeQueryBuilder } from "./test-utils";
import { createWorkspace, listMyWorkspaces } from "@/lib/actions/workspaces";

const mockedCreateClient = vi.mocked(createClient);

describe("listMyWorkspaces", () => {
  beforeEach(() => vi.clearAllMocks());

  it("denies access when the caller is not authenticated", async () => {
    const supabase = createSupabaseMock();
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "no session" },
    } as never);
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await listMyWorkspaces();

    expect(result.success).toBe(false);
  });

  it("lists workspaces with the caller's role in each", async () => {
    const supabase = createSupabaseMock();
    const membersBuilder = makeQueryBuilder({
      data: [
        { role: "admin", workspaces: { id: "w1", slug: "acme", name: "Acme", plan: "free" } },
        { role: "member", workspaces: { id: "w2", slug: "orbita", name: "Órbita", plan: "pro" } },
      ],
      error: null,
    });
    supabase.from.mockReturnValue(membersBuilder);
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await listMyWorkspaces();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([
        { id: "w1", slug: "acme", name: "Acme", plan: "free", role: "admin" },
        { id: "w2", slug: "orbita", name: "Órbita", plan: "pro", role: "member" },
      ]);
    }
  });
});

describe("createWorkspace", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a field error when the name is invalid", async () => {
    const supabase = createSupabaseMock();
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await createWorkspace("ab");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.name).toBeDefined();
    }
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("creates the workspace via RPC and returns its slug", async () => {
    const supabase = createSupabaseMock();
    supabase.rpc.mockResolvedValue({ data: { slug: "acme-vendas" }, error: null });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await createWorkspace("Acme Vendas");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ slug: "acme-vendas" });
    }
    expect(supabase.rpc).toHaveBeenCalledWith("create_workspace_with_owner", {
      workspace_name: "Acme Vendas",
      workspace_slug: "acme-vendas",
    });
  });
});
