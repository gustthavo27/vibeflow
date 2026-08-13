-- Row Level Security multi-tenant por workspace

alter table workspaces enable row level security;
alter table workspace_members enable row level security;
alter table leads enable row level security;
alter table deals enable row level security;
alter table activities enable row level security;

-- Helper: verifica se o usuário autenticado é membro do workspace.
-- security definer evita recursão de RLS ao consultar workspace_members a partir de outra policy.
create or replace function is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = (select auth.uid())
  );
$$;

-- Helper: verifica se o usuário autenticado é admin do workspace.
create or replace function is_workspace_admin(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

-- workspaces: visível/editável apenas por quem é membro
create policy workspaces_select on workspaces
  for select
  using ((select is_workspace_member(id)));

create policy workspaces_insert on workspaces
  for insert
  with check ((select auth.uid()) = created_by);

create policy workspaces_update on workspaces
  for update
  using ((select is_workspace_admin(id)));

create policy workspaces_delete on workspaces
  for delete
  using ((select is_workspace_admin(id)));

-- workspace_members: cada membro enxerga a lista de membros do próprio workspace
create policy workspace_members_select on workspace_members
  for select
  using ((select is_workspace_member(workspace_id)));

create policy workspace_members_insert on workspace_members
  for insert
  with check (
    -- o criador do workspace se auto-adiciona como admin no onboarding
    (select auth.uid()) = user_id
    or (select is_workspace_admin(workspace_id))
  );

create policy workspace_members_update on workspace_members
  for update
  using ((select is_workspace_admin(workspace_id)));

create policy workspace_members_delete on workspace_members
  for delete
  using ((select is_workspace_admin(workspace_id)));

-- leads
create policy leads_select on leads
  for select
  using ((select is_workspace_member(workspace_id)));

create policy leads_insert on leads
  for insert
  with check ((select is_workspace_member(workspace_id)));

create policy leads_update on leads
  for update
  using ((select is_workspace_member(workspace_id)));

create policy leads_delete on leads
  for delete
  using ((select is_workspace_member(workspace_id)));

-- deals
create policy deals_select on deals
  for select
  using ((select is_workspace_member(workspace_id)));

create policy deals_insert on deals
  for insert
  with check ((select is_workspace_member(workspace_id)));

create policy deals_update on deals
  for update
  using ((select is_workspace_member(workspace_id)));

create policy deals_delete on deals
  for delete
  using ((select is_workspace_member(workspace_id)));

-- activities
create policy activities_select on activities
  for select
  using ((select is_workspace_member(workspace_id)));

create policy activities_insert on activities
  for insert
  with check ((select is_workspace_member(workspace_id)));

create policy activities_update on activities
  for update
  using ((select is_workspace_member(workspace_id)));

create policy activities_delete on activities
  for delete
  using ((select is_workspace_member(workspace_id)));
