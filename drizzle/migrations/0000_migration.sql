
-- Profiles
create table public.profiles (
  id uuid primary key,
  display_name text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (id = auth.uid());
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());

-- Workspaces
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null,
  created_at timestamptz not null default now()
);
create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
grant select, insert, update, delete on public.workspaces to authenticated;
grant select on public.workspace_members to authenticated;
grant all on public.workspaces to service_role;
grant all on public.workspace_members to service_role;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

create or replace function public.is_workspace_member(_ws uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.workspace_members where workspace_id = _ws and user_id = auth.uid())
      or exists (select 1 from public.workspaces where id = _ws and owner_id = auth.uid())
$$;

create policy "members read ws" on public.workspaces for select to authenticated using (public.is_workspace_member(id));
create policy "owner update ws" on public.workspaces for update to authenticated using (owner_id = auth.uid());
create policy "owner insert ws" on public.workspaces for insert to authenticated with check (owner_id = auth.uid());
create policy "owner delete ws" on public.workspaces for delete to authenticated using (owner_id = auth.uid());
create policy "members read members" on public.workspace_members for select to authenticated using (public.is_workspace_member(workspace_id));

-- Websites
create table public.websites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  domain text not null,
  created_at timestamptz not null default now(),
  unique (workspace_id, domain)
);
-- Keywords
create table public.keywords (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  website_id uuid not null references public.websites(id) on delete cascade,
  keyword text not null,
  pages_to_check int not null default 5 check (pages_to_check between 1 and 10),
  market text,
  notes text,
  created_at timestamptz not null default now(),
  unique (website_id, keyword)
);
-- Devices
create table public.extension_devices (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null,
  name text not null default 'Chrome extension',
  token_hash text not null unique,
  last_seen_at timestamptz,
  last_sync_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
-- Ranking runs
create table public.ranking_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  client_run_id text not null,
  keyword_id uuid not null references public.keywords(id) on delete cascade,
  website_id uuid not null references public.websites(id) on delete cascade,
  position int,
  found boolean not null default true,
  previous_position int,
  position_change int,
  ranking_url text,
  pages_checked int not null default 5,
  search_engine text not null default 'google',
  market text,
  device_id uuid references public.extension_devices(id) on delete set null,
  checked_at timestamptz not null,
  synced_at timestamptz not null default now(),
  unique (workspace_id, client_run_id)
);
create index on public.ranking_runs (keyword_id, checked_at);
-- Connection codes
create table public.connection_codes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null,
  code text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
-- Shared reports
create table public.shared_reports (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  token text not null unique,
  config jsonb not null,
  created_by uuid not null,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.websites, public.keywords, public.ranking_runs, public.shared_reports to authenticated;
grant select, update, delete on public.extension_devices to authenticated;
grant select, insert, delete on public.connection_codes to authenticated;
grant all on public.websites, public.keywords, public.ranking_runs, public.extension_devices, public.connection_codes, public.shared_reports to service_role;

alter table public.websites enable row level security;
alter table public.keywords enable row level security;
alter table public.ranking_runs enable row level security;
alter table public.extension_devices enable row level security;
alter table public.connection_codes enable row level security;
alter table public.shared_reports enable row level security;

create policy "ws members all" on public.websites for all to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "ws members all" on public.keywords for all to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "ws members all" on public.ranking_runs for all to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "ws members all" on public.shared_reports for all to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id) and created_by = auth.uid());
create policy "ws members read" on public.extension_devices for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "ws members update" on public.extension_devices for update to authenticated using (public.is_workspace_member(workspace_id));
create policy "ws members delete" on public.extension_devices for delete to authenticated using (public.is_workspace_member(workspace_id));
create policy "own codes read" on public.connection_codes for select to authenticated using (user_id = auth.uid());
create policy "own codes insert" on public.connection_codes for insert to authenticated with check (user_id = auth.uid() and public.is_workspace_member(workspace_id));
create policy "own codes delete" on public.connection_codes for delete to authenticated using (user_id = auth.uid());

-- New user bootstrap: profile, workspace, sample data
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
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  insert into public.workspaces (name, owner_id) values ('My workspace', new.id) returning id into ws;
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

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
