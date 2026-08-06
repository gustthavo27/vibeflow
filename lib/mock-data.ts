export type MockWorkspace = {
  id: string;
  slug: string;
  name: string;
  plan: "Free" | "Pro";
};

export const mockWorkspaces: MockWorkspace[] = [
  { id: "1", slug: "acme-vendas", name: "Acme Vendas", plan: "Pro" },
  { id: "2", slug: "nova-era-consultoria", name: "Nova Era Consultoria", plan: "Free" },
  { id: "3", slug: "grupo-orbita", name: "Grupo Órbita", plan: "Free" },
];

export const mockCurrentUser = {
  name: "Bianca Duarte",
  email: "bianca@vibeflow.app",
  initials: "BD",
};
