create or replace function public.join_workspace(invite_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $body
declare
  target_ws uuid;
  code_id uuid;
begin
  select id, workspace_id into code_id, target_ws
  from public.connection_codes
  where code = invite_code
    and expires_at > now()
    and used_at is null;

  if target_ws is null then
    return false;
  end if;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (target_ws, auth.uid(), 'member')
  on conflict (workspace_id, user_id) do nothing;

  delete from public.connection_codes where id = code_id;

  delete from public.workspaces
  where owner_id = auth.uid()
    and id != target_ws
    and not exists (select 1 from public.keywords where workspace_id = public.workspaces.id);

  return true;
end;
$body;

grant execute on function public.join_workspace(text) to authenticated;
