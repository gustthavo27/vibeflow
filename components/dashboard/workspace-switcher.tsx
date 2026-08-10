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
      <DropdownMenuTrigger className="group flex w-full items-center gap-2 rounded-xl border border-sidebar-border bg-sidebar-accent/60 px-2.5 py-2 text-left transition-colors hover:border-sidebar-primary/30 hover:bg-sidebar-accent aria-expanded:border-sidebar-primary/30 aria-expanded:bg-sidebar-accent">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Building2 className="size-3.5" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-sidebar-foreground">
          {selected.name}
        </span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-sidebar-foreground/50" />
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
