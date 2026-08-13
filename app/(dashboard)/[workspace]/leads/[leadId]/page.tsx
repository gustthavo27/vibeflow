import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { LeadDetailView } from "@/components/leads/lead-detail-view";
import { getLead } from "@/lib/actions/leads";
import { listActivities } from "@/lib/actions/activities";
import { getWorkspaceBySlug, listWorkspaceMembers } from "@/lib/workspace";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ workspace: string; leadId: string }>;
}) {
  const { workspace, leadId } = await params;
  const workspaceRow = await getWorkspaceBySlug(workspace);

  const leadResult = await getLead(workspace, leadId);

  if (!leadResult.success) {
    notFound();
  }

  const [activitiesResult, members] = await Promise.all([
    listActivities(workspace, leadId),
    listWorkspaceMembers(workspaceRow.id),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/${workspace}/leads`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para Leads
        </Link>
      </div>

      <LeadDetailView
        workspace={workspace}
        initialLead={leadResult.data}
        activities={activitiesResult.success ? activitiesResult.data : []}
        members={members}
      />
    </div>
  );
}
