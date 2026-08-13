-- Cria workspace + vincula o criador como admin em uma única transação.
-- security invoker: respeita as mesmas RLS policies do usuário autenticado.
create or replace function create_workspace_with_owner(workspace_name text, workspace_slug text)
returns workspaces
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_workspace public.workspaces;
begin
  insert into public.workspaces (name, slug, created_by)
  values (workspace_name, workspace_slug, (select auth.uid()))
  returning * into new_workspace;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace.id, (select auth.uid()), 'admin');

  return new_workspace;
end;
$$;
