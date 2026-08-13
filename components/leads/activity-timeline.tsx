"use client";

import { useEffect, useId, useMemo, useState, type FormEvent } from "react";
import { CalendarDays, Loader2, Mail, Phone, StickyNote, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createActivity, listActivities } from "@/lib/actions/activities";
import { ACTIVITY_TYPE_LABELS, ACTIVITY_TYPE_OPTIONS } from "@/lib/labels";
import { validateActivityDescription } from "@/lib/validation/activities";
import type { ActivityType, Database } from "@/lib/supabase/types";
import type { WorkspaceMember } from "@/lib/workspace";

type Activity = Database["public"]["Tables"]["activities"]["Row"];

const activityIcons: Record<ActivityType, LucideIcon> = {
  ligacao: Phone,
  email: Mail,
  reuniao: CalendarDays,
  nota: StickyNote,
};

const TYPE_ALL = "all";

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ActivityTimeline({
  workspace,
  leadId,
  initialActivities,
  members,
}: {
  workspace: string;
  leadId: string;
  initialActivities: Activity[];
  members: WorkspaceMember[];
}) {
  const formId = useId();
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [typeFilter, setTypeFilter] = useState<ActivityType | "all">(TYPE_ALL);

  const [type, setType] = useState<ActivityType>("nota");
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const membersById = useMemo(
    () => new Map(members.map((member) => [member.user_id, member])),
    [members],
  );

  useEffect(() => {
    listActivities(workspace, leadId, { type: typeFilter }).then((result) => {
      if (result.success) setActivities(result.data);
    });
  }, [workspace, leadId, typeFilter]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextError = validateActivityDescription(description);
    setDescriptionError(nextError);
    setFormError(undefined);

    if (nextError) return;

    setIsSubmitting(true);
    const result = await createActivity(workspace, leadId, { type, description });
    setIsSubmitting(false);

    if (!result.success) {
      setFormError(result.error);
      return;
    }

    if (typeFilter === TYPE_ALL || typeFilter === result.data.type) {
      setActivities((prev) => [result.data, ...prev]);
    }
    setDescription("");
  }

  const sorted = [...activities].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="flex flex-col gap-6">
      <form id={formId} noValidate onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Field className="sm:w-48">
            <FieldLabel htmlFor="activity-type">Tipo</FieldLabel>
            <Select value={type} onValueChange={(value) => setType((value as ActivityType) ?? type)}>
              <SelectTrigger id="activity-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {ACTIVITY_TYPE_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field className="flex-1" data-invalid={!!descriptionError}>
            <FieldLabel htmlFor="activity-description">Nova atividade</FieldLabel>
            <Textarea
              id="activity-description"
              placeholder="Descreva a interação com o lead..."
              rows={2}
              value={description}
              aria-invalid={!!descriptionError}
              onChange={(event) => setDescription(event.target.value)}
            />
            <FieldError>{descriptionError}</FieldError>
          </Field>
        </div>
        {formError && <p className="text-sm text-destructive">{formError}</p>}
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isSubmitting ? "Registrando..." : "Registrar atividade"}
          </Button>
        </div>
      </form>

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">Histórico</span>
        <Select
          value={typeFilter}
          onValueChange={(value) => setTypeFilter((value as ActivityType | "all") ?? TYPE_ALL)}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TYPE_ALL}>Todos os tipos</SelectItem>
            {ACTIVITY_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {ACTIVITY_TYPE_LABELS[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nenhuma atividade registrada"
          description="As interações com este lead aparecerão aqui."
        />
      ) : (
        <ol className="flex flex-col gap-6">
          {sorted.map((activity, index) => {
            const Icon = activityIcons[activity.type];
            const isLast = index === sorted.length - 1;
            const authorEmail = activity.author_id
              ? (membersById.get(activity.author_id)?.email ?? "Usuário removido")
              : "Sistema";

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
                    <span className="text-sm font-medium text-foreground">
                      {ACTIVITY_TYPE_LABELS[activity.type]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(activity.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <span className="text-xs text-muted-foreground">por {authorEmail}</span>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export { ActivityTimeline };
