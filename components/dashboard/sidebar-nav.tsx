"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";

function SidebarNav({
  workspace,
  onNavigate,
}: {
  workspace: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {navItems.map((item) => {
        const href = item.segment ? `/${workspace}/${item.segment}` : `/${workspace}`;
        const isActive = item.segment ? pathname.startsWith(href) : pathname === href;
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive &&
                "bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_0_0_1px_color-mix(in_oklch,var(--sidebar-primary)_35%,transparent)] hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export { SidebarNav };
