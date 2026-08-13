-- Lista os membros de um workspace com e-mail, para exibição de responsável/autor.
-- auth.users não é exposto via PostgREST, então usamos uma function security definer
-- que faz a junção controlada, verificando que o chamador é membro do workspace.
create or replace function list_workspace_members(target_workspace_id uuid)
returns table(user_id uuid, email text)
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
  select u.id, u.email::text
  from auth.users u
  join public.workspace_members wm on wm.user_id = u.id
  where wm.workspace_id = target_workspace_id
  order by u.email;
end;
$$;

revoke all on function list_workspace_members(uuid) from public;
grant execute on function list_workspace_members(uuid) to authenticated;
