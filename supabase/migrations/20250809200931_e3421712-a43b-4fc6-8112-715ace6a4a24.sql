-- Buckets: ensure existence
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('content', 'content', false)
on conflict (id) do nothing;

-- Ensure RLS is enabled on storage.objects
alter table storage.objects enable row level security;

-- Reset storage policies we manage
drop policy if exists "Public read avatars" on storage.objects;
drop policy if exists "Users manage own avatars" on storage.objects;
drop policy if exists "Users read own content files" on storage.objects;
drop policy if exists "Users manage own content files" on storage.objects;

-- Avatars bucket: public read, users manage their own files (stored under <user_id>/...)
create policy "Public read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users manage own avatars"
  on storage.objects for all
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Content bucket: private, only owners can list/manage their files
create policy "Users read own content files"
  on storage.objects for select
  using (bucket_id = 'content' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users manage own content files"
  on storage.objects for all
  using (bucket_id = 'content' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'content' and auth.uid()::text = (storage.foldername(name))[1]);

-- Content uploads table
create table if not exists public.content_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  screen_id text,
  file_name text not null,
  file_path text not null,
  file_type text not null,
  file_size bigint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_uploads enable row level security;

-- Reset policies on content_uploads
drop policy if exists content_uploads_select_own on public.content_uploads;
drop policy if exists content_uploads_insert_own on public.content_uploads;
drop policy if exists content_uploads_update_own on public.content_uploads;
drop policy if exists content_uploads_delete_own on public.content_uploads;

create policy content_uploads_select_own on public.content_uploads for select using (user_id = auth.uid());
create policy content_uploads_insert_own on public.content_uploads for insert with check (user_id = auth.uid());
create policy content_uploads_update_own on public.content_uploads for update using (user_id = auth.uid());
create policy content_uploads_delete_own on public.content_uploads for delete using (user_id = auth.uid());

-- Updated_at trigger
drop trigger if exists update_content_uploads_updated_at on public.content_uploads;
create trigger update_content_uploads_updated_at
before update on public.content_uploads
for each row execute function public.update_updated_at_column();

-- Indexes
create index if not exists idx_content_uploads_user_created_at on public.content_uploads (user_id, created_at desc);
create index if not exists idx_content_uploads_screen_id on public.content_uploads (screen_id);