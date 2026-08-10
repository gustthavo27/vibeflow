import { LeadsView } from "@/components/leads/leads-view";
import { mockLeads } from "@/lib/mock-data";

export default async function LeadsPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace } = await params;

  return <LeadsView workspace={workspace} initialLeads={mockLeads} />;
}
