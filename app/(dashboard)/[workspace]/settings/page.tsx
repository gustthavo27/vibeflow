import { CollaboratorsView } from "@/components/settings/collaborators-view";
import { listInvites } from "@/lib/actions/invites";
import { listMembers } from "@/lib/actions/members";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/workspace";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace } = await params;
  const workspaceRow = await getWorkspaceBySlug(workspace);
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const [membersResult, invitesResult] = await Promise.all([
    listMembers(workspace),
    listInvites(workspace),
  ]);

  const members = membersResult.success ? membersResult.data : [];
  const invites = invitesResult.success ? invitesResult.data : [];
  const currentUserId = userData.user?.id ?? "";
  const isAdmin = members.find((member) => member.user_id === currentUserId)?.role === "admin";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Configurações
        </h1>
        <p className="text-sm text-muted-foreground">
          Workspace, colaboradores e plano de assinatura.
        </p>
      </div>

      <CollaboratorsView
        workspace={workspace}
        plan={workspaceRow.plan}
        members={members}
        invites={invites}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
      />
    </div>
  );
}
