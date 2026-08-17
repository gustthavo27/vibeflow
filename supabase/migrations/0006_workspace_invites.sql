-- Convites de colaboradores por e-mail, papéis Admin/Membro e limite do plano Free.

create table workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  email text not null,
  role workspace_role not null default 'member',
  invited_by uuid references auth.users (id) on delete set null,
  token uuid not null default gen_random_uuid(),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

create unique index workspace_invites_token_idx on workspace_invites (token);
create index workspace_invites_workspace_id_idx on workspace_invites (workspace_id);

-- Só pode existir um convite pendente por e-mail/workspace; um novo convite
-- para o mesmo par reaproveita a linha (upsert), gerando um novo token.
create unique index workspace_invites_pending_unique on workspace_invites (workspace_id, email)
  where status = 'pending';

alter table workspace_invites enable row level security;

-- Convites só são visíveis/gerenciáveis por admins do próprio workspace.
-- A leitura por token (para quem ainda não é membro) passa pela function
-- get_invite_by_token, que roda como security definer.
create policy workspace_invites_select on workspace_invites
  for select
  using ((select is_workspace_admin(workspace_id)));

create policy workspace_invites_insert on workspace_invites
  for insert
  with check ((select is_workspace_admin(workspace_id)));

create policy workspace_invites_delete on workspace_invites
  for delete
  using ((select is_workspace_admin(workspace_id)));

-- Inclui o papel do membro na listagem, para exibição na tela de colaboradores.
drop function if exists list_workspace_members(uuid);

create function list_workspace_members(target_workspace_id uuid)
returns table(user_id uuid, email text, role workspace_role)
language plpgsql
security definer
set search_path = ''
stable
as $$
begin
  if not (select public.is_workspace_member(target_workspace_id)) then
    raise exception 'not a member of this workspace';
  end if;

  return query
  select u.id, u.email::text, wm.role
  from auth.users u
  join public.workspace_members wm on wm.user_id = u.id
  where wm.workspace_id = target_workspace_id
  order by u.email;
end;
$$;

revoke all on function list_workspace_members(uuid) from public;
grant execute on function list_workspace_members(uuid) to authenticated;

-- Cria (ou renova, se já existir um convite pendente) um convite de colaborador.
-- Aplica o limite de membros do plano Free (2 membros, contando pendentes).
create function create_workspace_invite(
  target_workspace_id uuid,
  invite_email text,
  invite_role workspace_role default 'member'
)
returns workspace_invites
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_invite public.workspace_invites;
  workspace_plan text;
  member_count int;
  pending_count int;
  normalized_email text := lower(trim(invite_email));
begin
  if not (select public.is_workspace_admin(target_workspace_id)) then
    raise exception 'not_authorized';
  end if;

  select plan into workspace_plan from public.workspaces where id = target_workspace_id;

  select count(*) into member_count
  from public.workspace_members
  where workspace_id = target_workspace_id;

  select count(*) into pending_count
  from public.workspace_invites
  where workspace_id = target_workspace_id and status = 'pending' and email <> normalized_email;

  if workspace_plan = 'free' and (member_count + pending_count) >= 2 then
    raise exception 'plan_member_limit';
  end if;

  if exists (
    select 1
    from public.workspace_members wm
    join auth.users u on u.id = wm.user_id
    where wm.workspace_id = target_workspace_id and lower(u.email) = normalized_email
  ) then
    raise exception 'already_member';
  end if;

  insert into public.workspace_invites (workspace_id, email, role, invited_by)
  values (target_workspace_id, normalized_email, invite_role, (select auth.uid()))
  on conflict (workspace_id, email) where status = 'pending'
  do update set
    role = excluded.role,
    token = gen_random_uuid(),
    expires_at = now() + interval '7 days',
    created_at = now()
  returning * into new_invite;

  return new_invite;
end;
$$;

revoke all on function create_workspace_invite(uuid, text, workspace_role) from public;
grant execute on function create_workspace_invite(uuid, text, workspace_role) to authenticated;

-- Prévia pública (sem exigir sessão) dos dados de um convite, usada na tela de aceite.
create function get_invite_by_token(invite_token uuid)
returns table(
  workspace_name text,
  workspace_slug text,
  email text,
  role workspace_role,
  status text,
  expires_at timestamptz
)
language sql
security definer
set search_path = ''
stable
as $$
  select w.name, w.slug, i.email, i.role, i.status, i.expires_at
  from public.workspace_invites i
  join public.workspaces w on w.id = i.workspace_id
  where i.token = invite_token;
$$;

revoke all on function get_invite_by_token(uuid) from public;
grant execute on function get_invite_by_token(uuid) to authenticated, anon;

-- Aceita um convite pendente para o usuário autenticado, respeitando o limite
-- de membros do plano Free e validando e-mail/expiração/status.
create function accept_workspace_invite(invite_token uuid)
returns workspace_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  invite_row public.workspace_invites;
  current_user_id uuid := (select auth.uid());
  current_email text;
  workspace_plan text;
  member_count int;
  new_member public.workspace_members;
begin
  if current_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select email into current_email from auth.users where id = current_user_id;

  select * into invite_row from public.workspace_invites where token = invite_token for update;

  if invite_row is null then
    raise exception 'invite_not_found';
  end if;

  if invite_row.status <> 'pending' then
    raise exception 'invite_not_pending';
  end if;

  if invite_row.expires_at < now() then
    raise exception 'invite_expired';
  end if;

  if lower(current_email) <> invite_row.email then
    raise exception 'email_mismatch';
  end if;

  select plan into workspace_plan from public.workspaces where id = invite_row.workspace_id;

  select count(*) into member_count
  from public.workspace_members
  where workspace_id = invite_row.workspace_id;

  if workspace_plan = 'free' and member_count >= 2 then
    raise exception 'plan_member_limit';
  end if;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (invite_row.workspace_id, current_user_id, invite_row.role)
  on conflict (workspace_id, user_id) do update set role = excluded.role
  returning * into new_member;

  update public.workspace_invites set status = 'accepted' where id = invite_row.id;

  return new_member;
end;
$$;

revoke all on function accept_workspace_invite(uuid) from public;
grant execute on function accept_workspace_invite(uuid) to authenticated;
