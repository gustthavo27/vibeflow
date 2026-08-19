import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { BillingView } from "@/components/settings/billing-view";
import { Button } from "@/components/ui/button";
import { listMembers } from "@/lib/actions/members";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceBySlug } from "@/lib/workspace";

export default async function BillingPage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace } = await params;
  const workspaceRow = await getWorkspaceBySlug(workspace);
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  const membersResult = await listMembers(workspace);
  const members = membersResult.success ? membersResult.data : [];
  const currentUserId = userData.user?.id ?? "";
  const isAdmin = members.find((member) => member.user_id === currentUserId)?.role === "admin";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2.5 mb-2 w-fit"
          nativeButton={false}
          render={<Link href={`/${workspace}/settings`} />}
        >
          <ArrowLeft />
          Voltar para configurações
        </Button>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Plano e cobrança
        </h1>
        <p className="text-sm text-muted-foreground">
          Compare os planos Free e Pro e gerencie sua assinatura.
        </p>
      </div>

      <BillingView workspace={workspace} plan={workspaceRow.plan} isAdmin={isAdmin} showComparison />
    </div>
  );
}
