-- Enable the pgcrypto extension for UUID generation
create extension if not exists "pgcrypto";

-- Create rooms table
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  topic text not null unique,
  created_at timestamp with time zone default now()
);

-- Create messages table
create table if not exists messages (
  id bigint generated always as identity primary key,
  room_id uuid references rooms(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default now()
);

-- Indexes for performance (optional but good practice)
create index if not exists idx_rooms_created_at on rooms(created_at);
create index if not exists idx_messages_room_id on messages(room_id);
create index if not exists idx_messages_created_at on messages(created_at);

-- Disable RLS for simple anonymous access as requested
alter table rooms disable row level security;
alter table messages disable row level security;
