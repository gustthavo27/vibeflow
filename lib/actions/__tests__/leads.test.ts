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
import { createLead, deleteLead, listLeads, updateLead } from "@/lib/actions/leads";

const mockedCreateClient = vi.mocked(createClient);

const validInput = {
  name: "Maria Souza",
  email: "maria@empresa.com",
  phone: "11999998888",
  company: "Empresa X",
  job_title: "",
  status: "novo" as const,
  owner_id: null,
  deal_value: 0,
  notes: "",
};

describe("listLeads", () => {
  beforeEach(() => vi.clearAllMocks());

  it("denies access when the caller is not a workspace member", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockReturnValue(workspaceNotFoundBuilder());
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await listLeads("acme");

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/acesso/i);
  });

  it("lists leads scoped to the resolved workspace, applying filters", async () => {
    const supabase = createSupabaseMock();
    const leadsBuilder = makeQueryBuilder({ data: [{ id: "lead-1", name: "Ana" }], error: null });
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceFoundBuilder();
      if (table === "leads") return leadsBuilder;
      throw new Error(`unexpected table ${table}`);
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await listLeads("acme", { search: "ana", status: "novo" });

    expect(result.success).toBe(true);
    expect(leadsBuilder.eq).toHaveBeenCalledWith("workspace_id", "workspace-1");
    expect(leadsBuilder.eq).toHaveBeenCalledWith("status", "novo");
    expect(leadsBuilder.or).toHaveBeenCalledWith(expect.stringContaining("ana"));
  });
});

describe("createLead", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns field errors when required fields are invalid", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockReturnValue(workspaceFoundBuilder());
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await createLead("acme", { ...validInput, name: "", email: "invalid" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.name).toBeDefined();
      expect(result.fieldErrors?.email).toBeDefined();
    }
  });

  it("denies creation when the caller is not a workspace member", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockReturnValue(workspaceNotFoundBuilder());
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await createLead("acme", validInput);

    expect(result.success).toBe(false);
  });

  it("translates the plan_lead_limit error from the insert trigger", async () => {
    const supabase = createSupabaseMock();
    const insertBuilder = makeQueryBuilder({ data: null, error: { message: "plan_lead_limit" } });
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceFoundBuilder();
      if (table === "leads") return insertBuilder;
      throw new Error(`unexpected table ${table}`);
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await createLead("acme", validInput);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toMatch(/50 leads/i);
  });

  it("creates a lead on success and issues an insert", async () => {
    const supabase = createSupabaseMock();
    const insertBuilder = makeQueryBuilder({ data: { id: "lead-1", ...validInput }, error: null });
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceFoundBuilder();
      if (table === "leads") return insertBuilder;
      throw new Error(`unexpected table ${table}`);
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await createLead("acme", validInput);

    expect(result.success).toBe(true);
    expect(insertBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ workspace_id: "workspace-1", name: validInput.name }),
    );
  });
});

describe("updateLead", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates a lead successfully", async () => {
    const supabase = createSupabaseMock();
    const updateBuilder = makeQueryBuilder({ data: { id: "lead-1", name: "Novo nome" }, error: null });
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceFoundBuilder();
      if (table === "leads") return updateBuilder;
      throw new Error(`unexpected table ${table}`);
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await updateLead("acme", "lead-1", { ...validInput, name: "Novo nome" });

    expect(result.success).toBe(true);
    expect(updateBuilder.update).toHaveBeenCalled();
  });
});

describe("deleteLead", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes a lead successfully", async () => {
    const supabase = createSupabaseMock();
    const deleteBuilder = makeQueryBuilder({ data: null, error: null });
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceFoundBuilder();
      if (table === "leads") return deleteBuilder;
      throw new Error(`unexpected table ${table}`);
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await deleteLead("acme", "lead-1");

    expect(result.success).toBe(true);
    expect(deleteBuilder.delete).toHaveBeenCalled();
  });

  it("denies deletion when the caller is not a workspace member", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockReturnValue(workspaceNotFoundBuilder());
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await deleteLead("acme", "lead-1");

    expect(result.success).toBe(false);
  });
});
