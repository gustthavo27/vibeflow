import { CalendarDays, Mail, Phone, StickyNote, type LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import type { Activity, ActivityType } from "@/lib/mock-data";

const activityIcons: Record<ActivityType, LucideIcon> = {
  Ligação: Phone,
  "E-mail": Mail,
  Reunião: CalendarDays,
  Nota: StickyNote,
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Nenhuma atividade registrada"
        description="As interações com este lead aparecerão aqui."
      />
    );
  }

  const sorted = [...activities].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
  );

  return (
    <ol className="flex flex-col gap-6">
      {sorted.map((activity, index) => {
        const Icon = activityIcons[activity.tipo];
        const isLast = index === sorted.length - 1;

        return (
          <li key={activity.id} className="relative flex gap-3 pl-1">
            {!isLast && (
              <span
                aria-hidden
                className="absolute top-8 left-[19px] h-[calc(100%-0.5rem)] w-px bg-border"
              />
            )}
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-4" />
            </div>
            <div className="flex flex-1 flex-col gap-0.5 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">{activity.tipo}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(activity.data)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{activity.descricao}</p>
              <span className="text-xs text-muted-foreground">por {activity.autor}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export { ActivityTimeline };
