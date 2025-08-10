
-- 1) Guarantee one profile per user
create unique index if not exists profiles_user_id_key on public.profiles(user_id);

-- 2) Keep updated_at fresh on profiles updates (uses existing function)
drop trigger if exists set_updated_at_on_profiles on public.profiles;
create trigger set_updated_at_on_profiles
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- 3) Backfill: create missing profiles from auth.users with metadata
insert into public.profiles (user_id, role, display_name, avatar_url)
select
  u.id as user_id,
  coalesce(u.raw_user_meta_data->>'role', 'broadcaster') as role,
  nullif(u.raw_user_meta_data->>'display_name','') as display_name,
  nullif(u.raw_user_meta_data->>'avatar_url','') as avatar_url
from auth.users u
left join public.profiles p on p.user_id = u.id
where p.user_id is null;

-- 4) Backfill: fill missing fields only when currently null/default; do not overwrite user-changed values
update public.profiles p
set
  display_name = coalesce(
    p.display_name,
    nullif(u.raw_user_meta_data->>'display_name','')
  ),
  avatar_url = coalesce(
    p.avatar_url,
    nullif(u.raw_user_meta_data->>'avatar_url','')
  ),
  role = case
           when p.role is null
             then coalesce(u.raw_user_meta_data->>'role', 'broadcaster')
           when p.role = 'broadcaster'
             then coalesce(u.raw_user_meta_data->>'role', p.role)
           else p.role
         end
from auth.users u
where p.user_id = u.id;
