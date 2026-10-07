create or replace function public.global_workspace_id()
returns uuid language sql stable security definer set search_path = public as $$
  select w.id from public.workspaces w
  order by exists (select 1 from public.keywords k where k.workspace_id = w.id) desc, w.created_at
  limit 1
$$;