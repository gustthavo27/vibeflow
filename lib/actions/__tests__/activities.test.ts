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
import { createActivity, listActivities } from "@/lib/actions/activities";

const mockedCreateClient = vi.mocked(createClient);

describe("listActivities", () => {
  beforeEach(() => vi.clearAllMocks());

  it("denies access when the caller is not a workspace member", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockReturnValue(workspaceNotFoundBuilder());
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await listActivities("acme", "lead-1");

    expect(result.success).toBe(false);
  });

  it("lists activities scoped to the lead and workspace, applying the type filter", async () => {
    const supabase = createSupabaseMock();
    const activitiesBuilder = makeQueryBuilder({ data: [{ id: "activity-1" }], error: null });
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceFoundBuilder();
      if (table === "activities") return activitiesBuilder;
      throw new Error(`unexpected table ${table}`);
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await listActivities("acme", "lead-1", { type: "ligacao" });

    expect(result.success).toBe(true);
    expect(activitiesBuilder.eq).toHaveBeenCalledWith("workspace_id", "workspace-1");
    expect(activitiesBuilder.eq).toHaveBeenCalledWith("lead_id", "lead-1");
    expect(activitiesBuilder.eq).toHaveBeenCalledWith("type", "ligacao");
  });
});

describe("createActivity", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a field error when the description is empty", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockReturnValue(workspaceFoundBuilder());
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await createActivity("acme", "lead-1", { type: "nota", description: "" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors?.description).toBeDefined();
    }
  });

  it("denies creation when the caller is not a workspace member", async () => {
    const supabase = createSupabaseMock();
    supabase.from.mockReturnValue(workspaceNotFoundBuilder());
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await createActivity("acme", "lead-1", {
      type: "nota",
      description: "Uma nota qualquer",
    });

    expect(result.success).toBe(false);
  });

  it("creates an activity tagging the authenticated user as author", async () => {
    const supabase = createSupabaseMock();
    const insertBuilder = makeQueryBuilder({
      data: { id: "activity-1", type: "nota", description: "Uma nota qualquer" },
      error: null,
    });
    supabase.from.mockImplementation((table: string) => {
      if (table === "workspaces") return workspaceFoundBuilder();
      if (table === "activities") return insertBuilder;
      throw new Error(`unexpected table ${table}`);
    });
    mockedCreateClient.mockResolvedValue(supabase as never);

    const result = await createActivity("acme", "lead-1", {
      type: "nota",
      description: "Uma nota qualquer",
    });

    expect(result.success).toBe(true);
    expect(insertBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ lead_id: "lead-1", author_id: "user-1" }),
    );
  });
});
