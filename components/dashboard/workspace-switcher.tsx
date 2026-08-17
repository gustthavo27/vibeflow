"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createWorkspace, type MyWorkspace } from "@/lib/actions/workspaces";
import { validateWorkspaceName } from "@/lib/validation/auth";

const PLAN_LABELS: Record<MyWorkspace["plan"], string> = {
  free: "Free",
  pro: "Pro",
};

function WorkspaceSwitcher({
  currentSlug,
  workspaces,
}: {
  currentSlug: string;
  workspaces: MyWorkspace[];
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selected = workspaces.find((workspace) => workspace.slug === currentSlug) ?? workspaces[0];

  function handleSelect(slug: string) {
    if (slug === currentSlug) return;
    router.push(`/${slug}`);
  }

  function openCreateDialog() {
    setName("");
    setError(undefined);
    setDialogOpen(true);
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextError = validateWorkspaceName(name);
    setError(nextError);
    if (nextError) return;

    setIsSubmitting(true);
    const result = await createWorkspace(name);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.fieldErrors?.name ?? result.error);
      return;
    }

    setDialogOpen(false);
    router.push(`/${result.data.slug}`);
    router.refresh();
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="group flex w-full items-center gap-2 rounded-xl border border-sidebar-border bg-sidebar-accent/60 px-2.5 py-2 text-left transition-colors hover:border-sidebar-primary/30 hover:bg-sidebar-accent aria-expanded:border-sidebar-primary/30 aria-expanded:bg-sidebar-accent">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Building2 className="size-3.5" />
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-sidebar-foreground">
            {selected?.name ?? "Workspace"}
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-sidebar-foreground/50" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Seus workspaces</DropdownMenuLabel>
            {workspaces.map((workspace) => (
              <DropdownMenuItem key={workspace.id} onClick={() => handleSelect(workspace.slug)}>
                <Building2 className="size-4 text-muted-foreground" />
                <span className="flex-1 truncate">{workspace.name}</span>
                <span className="text-xs text-muted-foreground">{PLAN_LABELS[workspace.plan]}</span>
                {workspace.slug === currentSlug && <Check className="size-4 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              openCreateDialog();
            }}
          >
            <Plus className="size-4 text-muted-foreground" />
            Criar workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar novo workspace</DialogTitle>
            <DialogDescription>
              Crie um novo workspace para organizar leads e negócios separadamente.
            </DialogDescription>
          </DialogHeader>
          <form noValidate onSubmit={handleCreate}>
            <FieldGroup>
              <Field data-invalid={!!error}>
                <FieldLabel htmlFor="newWorkspaceName">Nome do workspace</FieldLabel>
                <Input
                  id="newWorkspaceName"
                  autoComplete="organization"
                  placeholder="Ex.: Acme Vendas"
                  value={name}
                  aria-invalid={!!error}
                  onChange={(event) => setName(event.target.value)}
                />
                <FieldError>{error}</FieldError>
              </Field>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="animate-spin" />}
                  {isSubmitting ? "Criando..." : "Criar workspace"}
                </Button>
              </DialogFooter>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export { WorkspaceSwitcher };
