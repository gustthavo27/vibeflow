-- VibeFlow CRM — schema inicial (workspaces, membros, leads, negócios, atividades)

create extension if not exists "pgcrypto";

create type workspace_role as enum ('admin', 'member');
create type lead_status as enum ('novo', 'contato_realizado', 'proposta_enviada', 'negociacao', 'fechado_ganho', 'fechado_perdido');
create type deal_stage as enum ('novo_lead', 'contato_realizado', 'proposta_enviada', 'negociacao', 'fechado_ganho', 'fechado_perdido');
create type activity_type as enum ('ligacao', 'email', 'reuniao', 'nota');

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table workspace_members (
  workspace_id uuid not null references workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role workspace_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  name text not null,
  email text,
  phone text,
  company text,
  job_title text,
  status lead_status not null default 'novo',
  owner_id uuid references auth.users (id) on delete set null,
  deal_value numeric(12, 2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table deals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  lead_id uuid references leads (id) on delete set null,
  title text not null,
  estimated_value numeric(12, 2) not null default 0,
  stage deal_stage not null default 'novo_lead',
  owner_id uuid references auth.users (id) on delete set null,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  lead_id uuid not null references leads (id) on delete cascade,
  type activity_type not null,
  description text not null,
  author_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index leads_workspace_id_idx on leads (workspace_id);
create index deals_workspace_id_idx on deals (workspace_id);
create index deals_lead_id_idx on deals (lead_id);
create index activities_workspace_id_idx on activities (workspace_id);
create index activities_lead_id_idx on activities (lead_id);
create index workspace_members_user_id_idx on workspace_members (user_id);
