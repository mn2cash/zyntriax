-- Enable extensions
create extension if not exists "uuid-ossp";

-- Profiles table extends auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  username text unique,
  display_name text,
  avatar_url text,
  description text,
  created_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default uuid_generate_v4(),
  is_group boolean not null default false,
  title text,
  created_at timestamptz not null default now()
);

create table public.conversation_members (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text default 'member'
);

create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text,
  type text default 'text',
  created_at timestamptz not null default now()
);

create table public.stories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  media_url text,
  caption text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.channels (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.channel_messages (
  id uuid primary key default uuid_generate_v4(),
  channel_id uuid not null references public.channels(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text,
  created_at timestamptz not null default now()
);

create table public.lobby_messages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  username text,
  message text,
  created_at timestamptz not null default now()
);

-- Direct messages table for user-to-user chat
create table if not exists public.direct_messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  sender_username text,
  message text,
  created_at timestamptz not null default now()
);

-- Simple rooms and room messages (no membership needed)
create table if not exists public.rooms (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.room_messages (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  sender_username text,
  message text,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.stories enable row level security;
alter table public.channels enable row level security;
alter table public.channel_messages enable row level security;
alter table public.lobby_messages enable row level security;
alter table if exists public.direct_messages enable row level security;
alter table if exists public.rooms enable row level security;
alter table if exists public.room_messages enable row level security;

-- Profiles: users manage their own row
create policy "Profiles are readable to owners" on public.profiles
  for select using (auth.uid() = id);
create policy "Profiles owners can update" on public.profiles
  for update using (auth.uid() = id);
create policy "Profiles owners can insert" on public.profiles
  for insert with check (auth.uid() = id);

-- Conversations: visible if member
create policy "Conversations read for members" on public.conversations
  for select using (exists (
    select 1 from public.conversation_members m
    where m.conversation_id = conversations.id and m.user_id = auth.uid()
  ));

-- Conversation members: only see your memberships
create policy "Conversation members read own" on public.conversation_members
  for select using (user_id = auth.uid());
create policy "Conversation members insert by authenticated" on public.conversation_members
  for insert with check (auth.uid() is not null);

-- Messages: only see messages in conversations you belong to
create policy "Messages readable in member conversations" on public.messages
  for select using (exists (
    select 1 from public.conversation_members m
    where m.conversation_id = messages.conversation_id and m.user_id = auth.uid()
  ));
create policy "Messages insert for members" on public.messages
  for insert with check (exists (
    select 1 from public.conversation_members m
    where m.conversation_id = messages.conversation_id and m.user_id = auth.uid()
  ));

-- Stories: public read, owners write
create policy "Stories readable by anyone" on public.stories
  for select using (true);
create policy "Stories insert/update by owner" on public.stories
  for insert with check (auth.uid() = user_id);
create policy "Stories update by owner" on public.stories
  for update using (auth.uid() = user_id);

-- Channels: visible to members (v1 everyone is member)
create policy "Channels readable by all" on public.channels
  for select using (true);
create policy "Channels insert by authenticated" on public.channels
  for insert with check (auth.uid() is not null);

-- Channel messages: readable by all, write by authenticated
create policy "Channel messages readable by all" on public.channel_messages
  for select using (true);
create policy "Channel messages insert by authenticated" on public.channel_messages
  for insert with check (auth.uid() is not null);

-- Lobby messages: global room; readable by all, write by authenticated users with username
create policy "Lobby messages readable by all" on public.lobby_messages
  for select using (true);
create policy "Lobby messages insert by authenticated" on public.lobby_messages
  for insert with check (auth.uid() is not null);

-- Direct messages: only participants can read, sender can write
create policy if not exists "Direct messages readable by participants" on public.direct_messages
  for select using (
    auth.uid() = sender_id or auth.uid() = recipient_id
  );
create policy if not exists "Direct messages insert by sender" on public.direct_messages
  for insert with check (auth.uid() = sender_id);

-- Rooms: readable by all, created by authenticated
create policy if not exists "Rooms readable by all" on public.rooms
  for select using (true);
create policy if not exists "Rooms insert by authenticated" on public.rooms
  for insert with check (auth.uid() is not null);

-- Room messages: readable by all, write by authenticated
create policy if not exists "Room messages readable by all" on public.room_messages
  for select using (true);
create policy if not exists "Room messages insert by authenticated" on public.room_messages
  for insert with check (auth.uid() is not null);
