import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/email/invite", () => ({
  sendWorkspaceInviteEmail: vi.fn(),
}));

import { createClient } from "@/lib/supabase/server";
import { sendWorkspaceInviteEmail } from "@/lib/email/invite";
import {
  createSupabaseMock,
  makeQueryBuilder,
  workspaceNotFoundBuilder,
} from "./test-utils";
import { acceptInvite, createInvite, getInvitePreview, revokeInvite } from "@/lib/actions/invites";

const mockedCreateClient = vi.mocked(createClient);
const mockedSendInviteEmail = vi.mocked(sendWorkspaceInviteEmail);

function workspaceRowBuilder(overrides: Partial<Record<string, unknown>> = {}) {
  return makeQueryBuilder({
    data: {
      id: "workspace-1",
      name: "Acme Vendas",
      slug: "acme",
      plan: "free",
      created_by: "user-1",
      created_at: "",
      updated_at: "",
      ...overrides,
    },
    error: null,
  });
}

describe("createInvite", () => {
  beforeEach(() => vi.clearAllMocks());

  it("denies access when the caller is not a workspace member", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockReturnValue(workspaceNotFoundBuilder());
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await createInvite("acme", "colega@empresa.com", "member");

    expect(result.success).toBe(false);
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("returns a field error for an invalid e-mail", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockReturnValue(workspaceRowBuilder());
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await createInvite("acme", "not-an-email", "member");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.email).toBeDefined();
    }
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("translates the plan_member_limit error from the RPC", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockReturnValue(workspaceRowBuilder());
    supabase.rpc.mockResolvedValue({ data: null, error: { message: "plan_member_limit" } });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await createInvite("acme", "colega@empresa.com", "member");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/plano Free/);
    }
    expect(mockedSendInviteEmail).not.toHaveBeenCalled();
  });

  it("creates the invite and sends the e-mail", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockReturnValue(workspaceRowBuilder());
    supabase.rpc.mockResolvedValue({
      data: { id: "invite-1", email: "colega@empresa.com", role: "member", token: "tok-1" },
      error: null,
    });
    mockedSendInviteEmail.mockResolvedValue({ success: true });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await createInvite("acme", "colega@empresa.com", "member");

    expect(result.success).toBe(true);
    expect(mockedSendInviteEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: "colega@empresa.com", workspaceName: "Acme Vendas" }),
    );
  });

  it("rolls back the invite when the e-mail fails to send", async () => {
    const supabase = createSupabaseMock();
    const invitesBuilder = makeQueryBuilder({ error: null });
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceRowBuilder();
      if (table === "workspace_invites") return invitesBuilder;
      throw new Error(`unexpected table ${table}`);
    });
    supabase.rpc.mockResolvedValue({
      data: { id: "invite-1", email: "colega@empresa.com", role: "member", token: "tok-1" },
      error: null,
    });
    mockedSendInviteEmail.mockResolvedValue({ success: false });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await createInvite("acme", "colega@empresa.com", "member");

    expect(result.success).toBe(false);
    expect(invitesBuilder.delete).toHaveBeenCalled();
  });
});

describe("revokeInvite", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes the invite scoped to the workspace", async () => {
    const supabase = createSupabaseMock();
    const deleteBuilder = makeQueryBuilder({ error: null });
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceRowBuilder();
      if (table === "workspace_invites") return deleteBuilder;
      throw new Error(`unexpected table ${table}`);
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await revokeInvite("acme", "invite-1");

    expect(result.success).toBe(true);
    expect(deleteBuilder.delete).toHaveBeenCalled();
    expect(deleteBuilder.eq).toHaveBeenCalledWith("id", "invite-1");
  });
});

describe("getInvitePreview", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns an error when the invite is not found", async () => {
    const supabase = createSupabaseMock();
    supabase.rpc.mockResolvedValue({ data: [], error: null });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await getInvitePreview("missing-token");

    expect(result.success).toBe(false);
  });

  it("returns the invite preview", async () => {
    const supabase = createSupabaseMock();
    supabase.rpc.mockResolvedValue({
      data: [
        {
          workspace_name: "Acme Vendas",
          workspace_slug: "acme",
          email: "colega@empresa.com",
          role: "member",
          status: "pending",
          expires_at: "2026-08-20T00:00:00.000Z",
        },
      ],
      error: null,
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await getInvitePreview("tok-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.workspaceSlug).toBe("acme");
    }
  });
});

describe("acceptInvite", () => {
  beforeEach(() => vi.clearAllMocks());

  it("translates the email_mismatch error from the RPC", async () => {
    const supabase = createSupabaseMock();
    supabase.rpc.mockResolvedValue({ data: null, error: { message: "email_mismatch" } });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await acceptInvite("tok-1");

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toMatch(/outro e-mail/);
    }
  });

  it("resolves the workspace slug on success", async () => {
    const supabase = createSupabaseMock();
    supabase.rpc.mockResolvedValue({
      data: { workspace_id: "workspace-1", user_id: "user-1", role: "member" },
      error: null,
    });
    supabase.from.mockReturnValue(makeQueryBuilder({ data: { slug: "acme" }, error: null }));
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await acceptInvite("tok-1");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.workspaceSlug).toBe("acme");
    }
  });
});
