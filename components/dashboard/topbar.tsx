"use client";

import { Bell, Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { navItems } from "./nav-items";
import { UserMenu } from "./user-menu";

function useCurrentPageTitle(workspace: string) {
  const pathname = usePathname();

  const activeItem = navItems.find((item) => {
    const href = item.segment ? `/${workspace}/${item.segment}` : `/${workspace}`;
    return item.segment ? pathname.startsWith(href) : pathname === href;
  });

  return activeItem?.label ?? "Dashboard";
}

function Topbar({ workspace, onOpenNav }: { workspace: string; onOpenNav: () => void }) {
  const title = useCurrentPageTitle(workspace);

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
        <h2 className="truncate font-heading text-sm font-bold tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Notificações" className="relative">
          <Bell className="size-4.5" />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-primary" />
        </Button>
        <UserMenu variant="topbar" />
      </div>
    </header>
  );
}

export { Topbar };
