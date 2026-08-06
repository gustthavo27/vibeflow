"use client";

import { useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";
import { Topbar } from "./topbar";
import { VibeflowLogo } from "./vibeflow-logo";

function DashboardShell({
  workspace,
  children,
}: {
  workspace: string;
  children: React.ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="bg-grain relative flex min-h-dvh bg-background">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(ellipse_60%_60%_at_50%_-10%,color-mix(in_oklch,var(--color-primary)_14%,transparent),transparent)]"
      />

      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-14 items-center px-4">
          <VibeflowLogo href={`/${workspace}`} />
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <SidebarNav workspace={workspace} />
        </div>
      </aside>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="left" className="w-72 gap-0 bg-sidebar p-0 text-sidebar-foreground">
          <SheetHeader className="h-14 flex-row items-center gap-2 border-b border-sidebar-border px-4 py-0">
            <VibeflowLogo />
            <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
            <SheetDescription className="sr-only">
              Navegação principal do workspace
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-2">
            <SidebarNav workspace={workspace} onNavigate={() => setNavOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-h-dvh flex-1 flex-col">
        <Topbar workspace={workspace} onOpenNav={() => setNavOpen(true)} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

export { DashboardShell };
