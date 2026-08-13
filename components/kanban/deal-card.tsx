"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CalendarClock } from "lucide-react";

import { CLOSED_DEAL_STAGES } from "@/lib/labels";
import { cn, formatCurrency } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";
import type { WorkspaceMember } from "@/lib/workspace";

type Deal = Database["public"]["Tables"]["deals"]["Row"];
type Lead = Database["public"]["Tables"]["leads"]["Row"];

const AVATAR_COLORS = [
  "bg-blue-500/20 text-blue-300",
  "bg-fuchsia-500/20 text-fuchsia-300",
  "bg-amber-500/20 text-amber-300",
  "bg-emerald-500/20 text-emerald-300",
  "bg-cyan-500/20 text-cyan-300",
  "bg-violet-500/20 text-violet-300",
];

function avatarColorFor(name: string) {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function DealCardContent({
  deal,
  lead,
  owner,
  today,
}: {
  deal: Deal;
  lead: Lead | undefined;
  owner: WorkspaceMember | undefined;
  today: string;
}) {
  const isOverdue =
    !CLOSED_DEAL_STAGES.includes(deal.stage) && !!deal.due_date && deal.due_date < today;

  return (
    <>
      <p className="font-medium text-foreground">{deal.title}</p>

      {lead && (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-semibold",
              avatarColorFor(lead.name),
            )}
          >
            {initialsFor(lead.name)}
          </span>
          <span className="min-w-0 truncate text-xs text-muted-foreground">
            {lead.name} <span className="text-muted-foreground/60">·</span> {lead.company}
          </span>
        </div>
      )}

      <p className="text-base font-bold text-foreground">{formatCurrency(deal.estimated_value)}</p>

      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <span
          className={cn(
            "flex items-center gap-1 text-xs whitespace-nowrap",
            isOverdue ? "font-medium text-destructive" : "text-muted-foreground",
          )}
        >
          <CalendarClock className="size-3.5 shrink-0" />
          {deal.due_date ? formatDate(deal.due_date) : "Sem prazo"}
          {isOverdue && <span className="font-mono uppercase">· Vencido</span>}
        </span>
        {owner && (
          <span className="font-mono text-[0.65rem] font-medium tracking-wide text-muted-foreground uppercase">
            {owner.email.split("@")[0]}
          </span>
        )}
      </div>
    </>
  );
}

function DealCard({
  deal,
  lead,
  owner,
  onClick,
  today,
}: {
  deal: Deal;
  lead: Lead | undefined;
  owner: WorkspaceMember | undefined;
  onClick: () => void;
  today: string;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    data: { stage: deal.stage },
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      role="button"
      tabIndex={0}
      className={cn(
        "flex cursor-grab flex-col gap-2.5 rounded-xl bg-card p-3 text-sm ring-1 ring-foreground/10 transition-shadow select-none hover:ring-foreground/20 active:cursor-grabbing",
        isDragging && "z-10 opacity-50 shadow-lg",
      )}
    >
      <DealCardContent deal={deal} lead={lead} owner={owner} today={today} />
    </div>
  );
}

function DealCardPreview({
  deal,
  lead,
  owner,
  today,
}: {
  deal: Deal;
  lead: Lead | undefined;
  owner: WorkspaceMember | undefined;
  today: string;
}) {
  return (
    <div className="flex cursor-grabbing flex-col gap-2.5 rounded-xl bg-card p-3 text-sm shadow-lg ring-1 ring-foreground/20">
      <DealCardContent deal={deal} lead={lead} owner={owner} today={today} />
    </div>
  );
}

export { DealCard, DealCardPreview };
