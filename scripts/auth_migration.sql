-- 1. Add owner_id to rooms
alter table rooms add column if not exists owner_id uuid references auth.users(id);

-- 2. Add owner_id to messages
alter table messages add column if not exists owner_id uuid references auth.users(id);

-- Create indexes
create index if not exists idx_rooms_owner_id on rooms(owner_id);
create index if not exists idx_messages_owner_id on messages(owner_id);

-- Handle Topic Constraint
-- Drop global unique constraint on topic if it exists and add scoped unique constraint
alter table rooms drop constraint if exists rooms_topic_key;
create unique index if not exists idx_rooms_owner_topic on rooms(owner_id, topic);


-- 3. Enable RLS
alter table rooms enable row level security;
alter table messages enable row level security;

-- 4. Create Policies for Rooms
-- Users can only see their own rooms
drop policy if exists "Users can manage their own rooms" on rooms;
create policy "Users can manage their own rooms"
  on rooms
  for all
  using ( auth.uid() = owner_id )
  with check ( auth.uid() = owner_id );

-- 5. Create Policies for Messages
-- Users can only see/manage messages they own
drop policy if exists "Users can manage their own messages" on messages;
create policy "Users can manage their own messages"
  on messages
  for all
  using ( auth.uid() = owner_id )
  with check ( auth.uid() = owner_id );

-- 6. Storage Policies
-- Remove old public policies
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Public Insert" on storage.objects;
drop policy if exists "Public Delete" on storage.objects;

-- Create new policies for authenticated users
-- Path format: private/{user_id}/{room_id}/{filename}
-- We verify that the second segment of the path matches the user's ID
drop policy if exists "Authenticated users can manage their own files" on storage.objects;
create policy "Authenticated users can manage their own files"
  on storage.objects
  for all
  to authenticated
  using (
    bucket_id = 'room-uploads' and
    (storage.foldername(name))[1] = 'private' and
    (storage.foldername(name))[2] = auth.uid()::text
  )
  with check (
    bucket_id = 'room-uploads' and
    (storage.foldername(name))[1] = 'private' and
    (storage.foldername(name))[2] = auth.uid()::text
  );
