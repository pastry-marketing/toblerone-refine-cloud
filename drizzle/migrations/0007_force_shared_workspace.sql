-- Anything the extension (or anyone) creates always lands in the one shared dashboard.
create or replace function public.force_global_workspace()
returns trigger language plpgsql security definer set search_path = public as $$
declare g uuid := public.global_workspace_id();
begin
  if g is not null then new.workspace_id := g; end if;
  return new;
end $$;

create trigger force_global_ws before insert on public.websites for each row execute function public.force_global_workspace();
create trigger force_global_ws before insert on public.keywords for each row execute function public.force_global_workspace();
create trigger force_global_ws before insert on public.ranking_runs for each row execute function public.force_global_workspace();
create trigger force_global_ws before insert on public.extension_devices for each row execute function public.force_global_workspace();
create trigger force_global_ws before insert on public.connection_codes for each row execute function public.force_global_workspace();

-- Backfill: move existing extension devices into the shared dashboard and reconnect the latest one.
update public.extension_devices set workspace_id = public.global_workspace_id()
where workspace_id <> public.global_workspace_id();
update public.extension_devices set revoked_at = null
where id = (select id from public.extension_devices order by created_at desc limit 1);