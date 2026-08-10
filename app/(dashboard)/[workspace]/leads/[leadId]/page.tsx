import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { LeadDetailView } from "@/components/leads/lead-detail-view";
import { mockActivities, mockLeads } from "@/lib/mock-data";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ workspace: string; leadId: string }>;
}) {
  const { workspace, leadId } = await params;
  const lead = mockLeads.find((item) => item.id === leadId);

  if (!lead) {
    notFound();
  }

  const activities = mockActivities.filter((activity) => activity.leadId === lead.id);

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

      <LeadDetailView initialLead={lead} activities={activities} />
    </div>
  );
}
