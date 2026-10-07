grant insert on public.extension_devices to authenticated;

create policy "workspace owner inserts own devices"
on public.extension_devices
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and public.is_workspace_member(workspace_id)
);

drop policy if exists "ws members update" on public.extension_devices;
create policy "device owner updates own device"
on public.extension_devices
for update
to authenticated
using (
  user_id = (select auth.uid())
  and public.is_workspace_member(workspace_id)
)
with check (
  user_id = (select auth.uid())
  and public.is_workspace_member(workspace_id)
);

drop policy if exists "ws members delete" on public.extension_devices;
create policy "device owner deletes own device"
on public.extension_devices
for delete
to authenticated
using (
  user_id = (select auth.uid())
  and public.is_workspace_member(workspace_id)
);

revoke execute on function public.is_workspace_member(uuid) from public, anon;
grant execute on function public.is_workspace_member(uuid) to authenticated;
