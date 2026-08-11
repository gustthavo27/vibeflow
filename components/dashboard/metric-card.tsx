import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  iconClassName,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  iconClassName?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </span>
          <span className="font-heading text-2xl font-semibold text-foreground">{value}</span>
          {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        </div>
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary",
            iconClassName,
          )}
        >
          <Icon className="size-4.5" />
        </div>
      </CardContent>
    </Card>
  );
}

export { MetricCard };
