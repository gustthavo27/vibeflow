"use client";

import { useState } from "react";
import { CreditCard, Loader2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FREE_PLAN_LEAD_LIMIT, FREE_PLAN_MEMBER_LIMIT } from "@/lib/labels";
import { createCheckoutSession } from "@/lib/stripe/checkout";
import { createPortalSession } from "@/lib/stripe/portal";

function BillingView({
  workspace,
  plan,
  isAdmin,
}: {
  workspace: string;
  plan: "free" | "pro";
  isAdmin: boolean;
}) {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string>();

  async function handleUpgrade() {
    setIsRedirecting(true);
    setError(undefined);
    const result = await createCheckoutSession(workspace);
    if (!result.success) {
      setError(result.error);
      setIsRedirecting(false);
      return;
    }
    window.location.href = result.data.url;
  }

  async function handleManage() {
    setIsRedirecting(true);
    setError(undefined);
    const result = await createPortalSession(workspace);
    if (!result.success) {
      setError(result.error);
      setIsRedirecting(false);
      return;
    }
    window.location.href = result.data.url;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Plano e assinatura</CardTitle>
          <Badge variant={plan === "pro" ? "default" : "outline"}>
            {plan === "pro" ? "Pro" : "Free"}
          </Badge>
        </div>
        <CardDescription>
          {plan === "pro"
            ? "Assinatura Pro ativa — sem limite de colaboradores ou leads."
            : `Plano Free — até ${FREE_PLAN_MEMBER_LIMIT} colaboradores e ${FREE_PLAN_LEAD_LIMIT} leads.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error && (
          <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        {!isAdmin ? (
          <p className="text-sm text-muted-foreground">
            Apenas administradores podem gerenciar a assinatura do workspace.
          </p>
        ) : plan === "pro" ? (
          <Button variant="outline" disabled={isRedirecting} onClick={handleManage} className="w-fit">
            {isRedirecting ? <Loader2 className="animate-spin" /> : <CreditCard />}
            {isRedirecting ? "Abrindo..." : "Gerenciar assinatura"}
          </Button>
        ) : (
          <Button disabled={isRedirecting} onClick={handleUpgrade} className="w-fit">
            {isRedirecting ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {isRedirecting ? "Redirecionando..." : "Assinar Pro"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export { BillingView };
