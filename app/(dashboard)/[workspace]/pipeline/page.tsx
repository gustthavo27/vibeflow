import { KanbanBoard } from "@/components/kanban/kanban-board";
import { listDeals } from "@/lib/actions/deals";
import { listLeads } from "@/lib/actions/leads";
import { getWorkspaceBySlug, listWorkspaceMembers } from "@/lib/workspace";

export default async function PipelinePage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace } = await params;
  const workspaceRow = await getWorkspaceBySlug(workspace);

  const [dealsResult, leadsResult, members] = await Promise.all([
    listDeals(workspace),
    listLeads(workspace),
    listWorkspaceMembers(workspaceRow.id),
  ]);

  return (
    <div className="h-full min-h-0">
      <KanbanBoard
        workspace={workspace}
        initialDeals={dealsResult.success ? dealsResult.data : []}
        leads={leadsResult.success ? leadsResult.data : []}
        members={members}
      />
    </div>
  );
}
