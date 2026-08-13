import { LeadsView } from "@/components/leads/leads-view";
import { listLeads } from "@/lib/actions/leads";
import { getWorkspaceBySlug, listWorkspaceMembers } from "@/lib/workspace";

export default async function LeadsPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace } = await params;
  const workspaceRow = await getWorkspaceBySlug(workspace);

  const [leadsResult, members] = await Promise.all([
    listLeads(workspace),
    listWorkspaceMembers(workspaceRow.id),
  ]);

  return (
    <LeadsView
      workspace={workspace}
      initialLeads={leadsResult.success ? leadsResult.data : []}
      members={members}
    />
  );
}
