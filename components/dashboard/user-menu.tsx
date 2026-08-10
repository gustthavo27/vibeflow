"use client";

import Link from "next/link";
import { ChevronsUpDown, LogOut, Settings, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { mockCurrentUser } from "@/lib/mock-data";

function UserMenu({ variant = "topbar" }: { variant?: "topbar" | "sidebar" }) {
  const firstName = mockCurrentUser.name.split(" ")[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          variant === "topbar" &&
            "flex items-center gap-2 rounded-full pr-1 pl-1 transition-colors hover:bg-muted aria-expanded:bg-muted",
          variant === "sidebar" &&
            "flex w-full items-center gap-2.5 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-2.5 py-2 text-left transition-colors hover:border-sidebar-primary/30 hover:bg-sidebar-accent aria-expanded:border-sidebar-primary/30 aria-expanded:bg-sidebar-accent",
        )}
      >
        <Avatar size="sm">
          <AvatarFallback className="bg-primary/15 font-medium text-primary">
            {mockCurrentUser.initials}
          </AvatarFallback>
        </Avatar>
        {variant === "topbar" && (
          <span className="text-sm font-medium text-foreground">{firstName}</span>
        )}
        {variant === "sidebar" && (
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {mockCurrentUser.name}
            </span>
            <span className="truncate text-xs text-sidebar-foreground/50">
              {mockCurrentUser.email}
            </span>
          </span>
        )}
        <ChevronsUpDown
          className={cn(
            "size-3.5 shrink-0",
            variant === "topbar" ? "text-muted-foreground" : "text-sidebar-foreground/50",
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={variant === "sidebar" ? "start" : "end"} className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 py-1.5">
            <span className="text-sm font-medium text-foreground">{mockCurrentUser.name}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {mockCurrentUser.email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="size-4 text-muted-foreground" />
          Perfil
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="size-4 text-muted-foreground" />
          Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" render={<Link href="/login" />}>
          <LogOut className="size-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { UserMenu };
