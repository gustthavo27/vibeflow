"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, CreditCard, Loader2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FREE_PLAN_LEAD_LIMIT, FREE_PLAN_MEMBER_LIMIT } from "@/lib/labels";
import { createCheckoutSession } from "@/lib/stripe/checkout";
import { createPortalSession } from "@/lib/stripe/portal";
import { cn } from "@/lib/utils";

const PLAN_COMPARISON = [
  {
    id: "free" as const,
    name: "Free",
    price: "R$ 0",
    period: "para sempre",
    features: [
      `Até ${FREE_PLAN_MEMBER_LIMIT} colaboradores`,
      `Até ${FREE_PLAN_LEAD_LIMIT} leads`,
      "Pipeline Kanban completo",
      "Dashboard de métricas",
      "Timeline de atividades",
    ],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "R$ 49",
    period: "/mês",
    features: [
      "Colaboradores ilimitados",
      "Leads ilimitados",
      "Tudo do plano Free",
      "Convites ilimitados por e-mail",
      "Suporte prioritário",
    ],
  },
];

function BillingView({
  workspace,
  plan,
  isAdmin,
  showComparison = false,
}: {
  workspace: string;
  plan: "free" | "pro";
  isAdmin: boolean;
  showComparison?: boolean;
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
    <div className="flex flex-col gap-6">
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
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              {plan === "pro" ? (
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

              {!showComparison && (
                <Button
                  variant="ghost"
                  className="w-fit"
                  nativeButton={false}
                  render={<Link href={`/${workspace}/settings/billing`} />}
                >
                  Ver planos e cobrança
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showComparison && (
        <div className="grid gap-4 sm:grid-cols-2">
          {PLAN_COMPARISON.map((item) => (
            <Card key={item.id} className={cn(plan === item.id && "ring-2 ring-primary")}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{item.name}</CardTitle>
                  {plan === item.id && <Badge>Plano atual</Badge>}
                </div>
                <div className="flex items-end gap-1">
                  <span className="font-heading text-3xl font-bold tracking-tight text-foreground">
                    {item.price}
                  </span>
                  <span className="pb-0.5 text-sm text-muted-foreground">{item.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-2.5 text-sm">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export { BillingView };
