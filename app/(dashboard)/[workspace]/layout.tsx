import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { listMyWorkspaces } from "@/lib/actions/workspaces";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserDisplay } from "@/lib/workspace";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspace: string }>;
}) {
  const { workspace } = await params;
  const supabase = await createClient();

  const [workspacesResult, currentUser] = await Promise.all([
    listMyWorkspaces(),
    getCurrentUserDisplay(supabase),
  ]);
  const workspaces = workspacesResult.success ? workspacesResult.data : [];

  return (
    <DashboardShell
      workspace={workspace}
      workspaces={workspaces}
      currentUser={currentUser ?? { name: "Usuário", email: "", initials: "?" }}
    >
      {children}
    </DashboardShell>
  );
}
