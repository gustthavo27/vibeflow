-- Corrige create_workspace_with_owner: usa security definer para evitar
-- falso-negativo da policy de INSERT em workspaces/workspace_members
-- (a função só insere linhas vinculadas a auth.uid(), nunca a um parâmetro,
-- então continua seguro mesmo bypassando RLS internamente).
create or replace function create_workspace_with_owner(workspace_name text, workspace_slug text)
returns workspaces
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_workspace public.workspaces;
  current_user_id uuid := (select auth.uid());
begin
  if current_user_id is null then
    raise exception 'not authenticated';
  end if;

  insert into public.workspaces (name, slug, created_by)
  values (workspace_name, workspace_slug, current_user_id)
  returning * into new_workspace;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace.id, current_user_id, 'admin');

  return new_workspace;
end;
$$;

revoke all on function create_workspace_with_owner(text, text) from public;
grant execute on function create_workspace_with_owner(text, text) to authenticated;
