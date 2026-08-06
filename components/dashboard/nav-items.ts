import { Kanban, LayoutDashboard, Settings, Users, type LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  segment: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { label: "Leads", segment: "leads", icon: Users },
  { label: "Pipeline", segment: "pipeline", icon: Kanban },
  { label: "Dashboard", segment: "", icon: LayoutDashboard },
  { label: "Configurações", segment: "settings", icon: Settings },
];
