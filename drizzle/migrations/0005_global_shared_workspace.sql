create or replace function public.global_workspace_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.workspaces order by created_at limit 1
$$;
grant execute on function public.global_workspace_id() to anon, authenticated;

-- Every signed-in session (including guest sessions) belongs to the one shared dashboard.
create or replace function public.is_workspace_member(_ws uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and (
    _ws = public.global_workspace_id()
    or exists (select 1 from public.workspace_members where workspace_id = _ws and user_id = auth.uid())
    or exists (select 1 from public.workspaces where id = _ws and owner_id = auth.uid())
  )
$$;

-- New users join the shared dashboard; sample data is only created once, for the very first user.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  ws uuid; site uuid; kid uuid; i int; k int; pos int; prev int;
  names text[] := array['project management software','team collaboration workspace','best productivity tool','project documentation platform','remote team knowledge base'];
  series int[][] := array[
    array[18,16,15,15,13,12,11,9,10,8,7,7,6],
    array[5,5,4,6,7,8,8,9,11,12,12,14,15],
    array[0,0,48,42,39,35,31,28,24,22,19,17,14],
    array[3,3,3,2,2,3,3,3,3,3,3,3,3],
    array[22,24,27,31,0,38,35,41,0,46,0,0,0]
  ];
  urls text[] := array['https://www.notion.so/product/projects','https://www.notion.so/teams','https://www.notion.so/product','https://www.notion.so/product/docs','https://www.notion.so/product/wikis'];
begin
  insert into public.profiles (id, display_name)
    values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email,'guest'),'@',1)))
    on conflict (id) do nothing;
  ws := public.global_workspace_id();
  if ws is not null then
    insert into public.workspace_members (workspace_id, user_id, role) values (ws, new.id, 'member')
      on conflict do nothing;
    return new;
  end if;
  insert into public.workspaces (name, owner_id) values ('Toblerone', new.id) returning id into ws;
  insert into public.workspace_members (workspace_id, user_id, role) values (ws, new.id, 'owner');
  insert into public.websites (workspace_id, domain) values (ws, 'notion.so') returning id into site;
  for k in 1..5 loop
    insert into public.keywords (workspace_id, website_id, keyword, pages_to_check, market, created_at)
      values (ws, site, names[k], case when k in (3,5) then 5 else 3 end, 'US', now() - interval '13 weeks')
      returning id into kid;
    prev := null;
    for i in 1..13 loop
      pos := nullif(series[k][i], 0);
      insert into public.ranking_runs (workspace_id, client_run_id, keyword_id, website_id, position, found, previous_position, position_change, ranking_url, pages_checked, market, checked_at, synced_at)
      values (ws, 'sample-' || kid || '-' || i, kid, site, pos, pos is not null, prev,
        case when pos is not null and prev is not null then prev - pos else null end,
        case when pos is not null then urls[k] else null end,
        case when k in (3,5) then 5 else 3 end, 'US',
        date_trunc('hour', now()) - ((13 - i) * interval '7 days') - (k * interval '17 minutes'),
        date_trunc('hour', now()) - ((13 - i) * interval '7 days') - (k * interval '17 minutes') + interval '4 seconds');
      prev := pos;
    end loop;
  end loop;
  return new;
end $$;

-- Backfill: existing users become members of the shared dashboard.
insert into public.workspace_members (workspace_id, user_id, role)
select public.global_workspace_id(), p.id, 'member' from public.profiles p
where public.global_workspace_id() is not null
on conflict do nothing;