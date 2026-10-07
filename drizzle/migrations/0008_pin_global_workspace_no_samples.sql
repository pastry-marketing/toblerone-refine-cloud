alter table public.workspaces add column if not exists is_global boolean not null default false;
update public.workspaces set is_global = true where id = '85a19a55-84a5-4006-8919-c20cee074b0e';
create unique index if not exists one_global_workspace on public.workspaces (is_global) where is_global;

create or replace function public.global_workspace_id()
returns uuid language sql stable security definer set search_path = public as $$
  select coalesce(
    (select id from public.workspaces where is_global limit 1),
    (select id from public.workspaces order by created_at limit 1)
  )
$$;

-- New visitors simply join the shared dashboard. No sample data is ever created.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare ws uuid;
begin
  insert into public.profiles (id, display_name)
    values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email,'guest'),'@',1)))
    on conflict (id) do nothing;
  ws := public.global_workspace_id();
  if ws is null then
    insert into public.workspaces (name, owner_id, is_global) values ('Toblerone', new.id, true) returning id into ws;
  end if;
  insert into public.workspace_members (workspace_id, user_id, role) values (ws, new.id, 'member')
    on conflict do nothing;
  return new;
end $$;