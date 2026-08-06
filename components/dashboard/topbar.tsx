"use client";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { WorkspaceSwitcher } from "./workspace-switcher";

function Topbar({ workspace, onOpenNav }: { workspace: string; onOpenNav: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/70 bg-background/85 px-3 backdrop-blur-md md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 md:hidden"
        onClick={onOpenNav}
        aria-label="Abrir menu de navegação"
      >
        <Menu className="size-5" />
      </Button>
      <div className="min-w-0 flex-1">
        <WorkspaceSwitcher currentSlug={workspace} />
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <UserMenu />
      </div>
    </header>
  );
}

export { Topbar };
