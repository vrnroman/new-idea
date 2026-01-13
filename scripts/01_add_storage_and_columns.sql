-- 1. Create the storage bucket
insert into storage.buckets (id, name, public)
values ('room-uploads', 'room-uploads', true)
on conflict (id) do nothing;

-- 2. Set up storage policies for anonymous access
-- Allow public SELECT
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'room-uploads' );

-- Allow public INSERT
drop policy if exists "Public Insert" on storage.objects;
create policy "Public Insert"
  on storage.objects for insert
  with check ( bucket_id = 'room-uploads' );

-- Allow public DELETE
drop policy if exists "Public Delete" on storage.objects;
create policy "Public Delete"
  on storage.objects for delete
  using ( bucket_id = 'room-uploads' );

-- 3. Update messages table to support file attachments
alter table messages
add column if not exists file_url text,
add column if not exists file_path text;
