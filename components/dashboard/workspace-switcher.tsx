"use client";

import { useState } from "react";
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockWorkspaces } from "@/lib/mock-data";

function WorkspaceSwitcher({ currentSlug }: { currentSlug: string }) {
  const [selected, setSelected] = useState(
    mockWorkspaces.find((workspace) => workspace.slug === currentSlug) ?? mockWorkspaces[0],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex w-full max-w-64 items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1.5 text-left transition-colors hover:border-border hover:bg-muted aria-expanded:border-border aria-expanded:bg-muted">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Building2 className="size-3.5" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
          {selected.name}
        </span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Seus workspaces</DropdownMenuLabel>
          {mockWorkspaces.map((workspace) => (
            <DropdownMenuItem key={workspace.id} onClick={() => setSelected(workspace)}>
              <Building2 className="size-4 text-muted-foreground" />
              <span className="flex-1 truncate">{workspace.name}</span>
              <span className="text-xs text-muted-foreground">{workspace.plan}</span>
              {workspace.slug === selected.slug && <Check className="size-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Plus className="size-4 text-muted-foreground" />
          Criar workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { WorkspaceSwitcher };
