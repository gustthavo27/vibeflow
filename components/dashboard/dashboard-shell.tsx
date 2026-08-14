"use client";

import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { MyWorkspace } from "@/lib/actions/workspaces";
import type { CurrentUser } from "@/lib/workspace";
import { SidebarNav } from "./sidebar-nav";
import { Topbar } from "./topbar";
import { UserMenu } from "./user-menu";
import { VibeflowLogo } from "./vibeflow-logo";
import { WorkspaceSwitcher } from "./workspace-switcher";

function SidebarBody({
  workspace,
  workspaces,
  currentUser,
  onNavigate,
}: {
  workspace: string;
  workspaces: MyWorkspace[];
  currentUser: CurrentUser;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex flex-col gap-3 px-3 pt-3 pb-2">
        <div className="px-1">
          <VibeflowLogo href={`/${workspace}`} />
        </div>
        <WorkspaceSwitcher currentSlug={workspace} workspaces={workspaces} />
      </div>
      <div className="flex-1 overflow-y-auto px-0 py-2">
        <SidebarNav workspace={workspace} onNavigate={onNavigate} />
      </div>
      <div className="border-t border-sidebar-border p-3">
        <UserMenu variant="sidebar" currentUser={currentUser} />
      </div>
    </>
  );
}

function DashboardShell({
  workspace,
  workspaces,
  currentUser,
  children,
}: {
  workspace: string;
  workspaces: MyWorkspace[];
  currentUser: CurrentUser;
  children: React.ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="bg-grain relative flex h-dvh overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,color-mix(in_oklch,var(--color-primary)_10%,transparent),transparent)]"
      />

      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <SidebarBody workspace={workspace} workspaces={workspaces} currentUser={currentUser} />
      </aside>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="w-72 gap-0 bg-sidebar p-0 text-sidebar-foreground">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu de navegação</SheetTitle>
            <SheetDescription>Navegação principal do workspace</SheetDescription>
          </SheetHeader>
          <div className="flex h-full flex-col">
            <SidebarBody
              workspace={workspace}
              workspaces={workspaces}
              currentUser={currentUser}
              onNavigate={() => setNavOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Topbar workspace={workspace} currentUser={currentUser} onOpenNav={() => setNavOpen(true)} />
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export { DashboardShell };
