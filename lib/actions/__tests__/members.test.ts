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
import { changeMemberRole, listMembers, removeMember } from "@/lib/actions/members";

const mockedCreateClient = vi.mocked(createClient);

describe("listMembers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("denies access when the caller is not a workspace member", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockReturnValue(workspaceNotFoundBuilder());
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await listMembers("acme");

    expect(result.success).toBe(false);
  });

  it("lists members via the list_workspace_members RPC", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockReturnValue(workspaceFoundBuilder());
    supabase.rpc.mockResolvedValue({
      data: [{ user_id: "user-1", email: "bianca@vibeflow.app", role: "admin" }],
      error: null,
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await listMembers("acme");

    expect(result.success).toBe(true);
    expect(supabase.rpc).toHaveBeenCalledWith("list_workspace_members", {
      target_workspace_id: "workspace-1",
    });
  });
});

describe("removeMember", () => {
  beforeEach(() => vi.clearAllMocks());

  it("denies non-admins", async () => {
    const supabase = createSupabaseMock();
    let workspaceMembersCalls = 0;
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceFoundBuilder();
      if (table === "workspace_members") {
        workspaceMembersCalls += 1;
        return makeQueryBuilder({ data: { role: "member" }, error: null });
      }
      throw new Error(`unexpected table ${table}`);
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await removeMember("acme", "user-2");

    expect(result.success).toBe(false);
    expect(workspaceMembersCalls).toBe(1);
  });

  it("prevents removing yourself", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceFoundBuilder();
      if (table === "workspace_members") return makeQueryBuilder({ data: { role: "admin" }, error: null });
      throw new Error(`unexpected table ${table}`);
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await removeMember("acme", "user-1");

    expect(result.success).toBe(false);
  });

  it("removes a non-admin member", async () => {
    const supabase = createSupabaseMock();
    const deleteBuilder = makeQueryBuilder({ error: null });
    let workspaceMembersCalls = 0;
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceFoundBuilder();
      if (table === "workspace_members") {
        workspaceMembersCalls += 1;
        if (workspaceMembersCalls === 1) {
          return makeQueryBuilder({ data: { role: "admin" }, error: null });
        }
        if (workspaceMembersCalls === 2) {
          return makeQueryBuilder({
            data: [
              { user_id: "user-1", role: "admin" },
              { user_id: "user-2", role: "member" },
            ],
            error: null,
          });
        }
        return deleteBuilder;
      }
      throw new Error(`unexpected table ${table}`);
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await removeMember("acme", "user-2");

    expect(result.success).toBe(true);
    expect(deleteBuilder.delete).toHaveBeenCalled();
  });
});

describe("changeMemberRole", () => {
  beforeEach(() => vi.clearAllMocks());

  it("denies non-admins", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceFoundBuilder();
      if (table === "workspace_members") return makeQueryBuilder({ data: { role: "member" }, error: null });
      throw new Error(`unexpected table ${table}`);
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await changeMemberRole("acme", "user-2", "admin");

    expect(result.success).toBe(false);
  });

  it("prevents demoting the last admin", async () => {
    const supabase = createSupabaseMock();
    let workspaceMembersCalls = 0;
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceFoundBuilder();
      if (table === "workspace_members") {
        workspaceMembersCalls += 1;
        if (workspaceMembersCalls === 1) {
          return makeQueryBuilder({ data: { role: "admin" }, error: null });
        }
        return makeQueryBuilder({ data: [{ user_id: "user-1", role: "admin" }], error: null });
      }
      throw new Error(`unexpected table ${table}`);
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await changeMemberRole("acme", "user-1", "member");

    expect(result.success).toBe(false);
  });

  it("promotes a member to admin", async () => {
    const supabase = createSupabaseMock();
    const updateBuilder = makeQueryBuilder({ error: null });
    let workspaceMembersCalls = 0;
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceFoundBuilder();
      if (table === "workspace_members") {
        workspaceMembersCalls += 1;
        if (workspaceMembersCalls === 1) {
          return makeQueryBuilder({ data: { role: "admin" }, error: null });
        }
        return updateBuilder;
      }
      throw new Error(`unexpected table ${table}`);
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await changeMemberRole("acme", "user-2", "admin");

    expect(result.success).toBe(true);
    expect(updateBuilder.update).toHaveBeenCalledWith({ role: "admin" });
  });
});
