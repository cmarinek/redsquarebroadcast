-- Create storage buckets for uploads (idempotent)
insert into storage.buckets (id, name, public)
values ('content', 'content', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage policies for avatars (public read, users manage their own files under user_id folder)
create policy if not exists "Avatar images are publicly accessible"
  on storage.objects
  for select using (bucket_id = 'avatars');

create policy if not exists "Users can upload their own avatar"
  on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can update their own avatar"
  on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can delete their own avatar"
  on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for content (private read; owners manage files under their user_id folder)
create policy if not exists "Users can read their own content files"
  on storage.objects
  for select to authenticated
  using (
    bucket_id = 'content'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can upload their own content files"
  on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'content'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can update their own content files"
  on storage.objects
  for update to authenticated
  using (
    bucket_id = 'content'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can delete their own content files"
  on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'content'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create content_uploads table to track uploads (idempotent)
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

-- RLS for content_uploads
create policy if not exists "content_uploads_select_own"
  on public.content_uploads
  for select to authenticated
  using (user_id = auth.uid());

create policy if not exists "content_uploads_insert_own"
  on public.content_uploads
  for insert to authenticated
  with check (user_id = auth.uid());

create policy if not exists "content_uploads_update_own"
  on public.content_uploads
  for update to authenticated
  using (user_id = auth.uid());

create policy if not exists "content_uploads_delete_own"
  on public.content_uploads
  for delete to authenticated
  using (user_id = auth.uid());

-- Trigger to keep updated_at fresh
drop trigger if exists update_content_uploads_updated_at on public.content_uploads;
create trigger update_content_uploads_updated_at
  before update on public.content_uploads
  for each row execute function public.update_updated_at_column();

-- Helpful indexes
create index if not exists idx_content_uploads_user_created on public.content_uploads(user_id, created_at desc);
create index if not exists idx_content_uploads_screen on public.content_uploads(screen_id);
