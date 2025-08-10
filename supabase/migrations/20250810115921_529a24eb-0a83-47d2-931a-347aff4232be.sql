
-- 1) Allow admins to read all profiles
create policy profiles_admin_select_all
on public.profiles
for select
to authenticated
using (public.is_admin());

-- 2) Allow admins to update any profile (including role)
create policy profiles_admin_update_all
on public.profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- 3) Prevent removing the last remaining admin
create or replace function public.prevent_last_admin_loss()
returns trigger
language plpgsql
security definer
set search_path = 'public','pg_temp'
as $$
begin
  if tg_op = 'UPDATE' then
    if old.role = 'admin' and new.role <> 'admin' then
      if (select count(*) from public.profiles where role = 'admin') <= 1 then
        raise exception 'Cannot demote the last admin';
      end if;
    end if;
  elsif tg_op = 'DELETE' then
    if old.role = 'admin' then
      if (select count(*) from public.profiles where role = 'admin') <= 1 then
        raise exception 'Cannot delete the last admin';
      end if;
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  else
    return new;
  end if;
end;
$$;

drop trigger if exists prevent_last_admin_loss_update on public.profiles;
create trigger prevent_last_admin_loss_update
before update on public.profiles
for each row execute function public.prevent_last_admin_loss();

drop trigger if exists prevent_last_admin_loss_delete on public.profiles;
create trigger prevent_last_admin_loss_delete
before delete on public.profiles
for each row execute function public.prevent_last_admin_loss();
