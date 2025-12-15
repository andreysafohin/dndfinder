-- Migration: Create games table
-- Purpose: Game listings created by masters
-- Affected tables: games

-- Create games table
create table public.games (
  id uuid primary key default gen_random_uuid(),
  master_id uuid not null references public.masters(id) on delete cascade,
  title text not null,
  system text not null,
  format text not null check (format in ('one-shot', 'campaign')),
  description text,
  image_url text,
  scheduled_at timestamptz,
  session_length_minutes integer default 180 check (session_length_minutes > 0),
  seats_total integer not null check (seats_total > 0),
  seats_available integer not null check (seats_available >= 0),
  price_rub integer check (price_rub >= 0),
  platform text,
  status text default 'draft' check (status in ('draft', 'published', 'completed', 'cancelled')),
  beginner_friendly boolean default false,
  genre text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint seats_available_check check (seats_available <= seats_total)
);

comment on table public.games is 'Game listings created by masters. Contains all information about D&D games including scheduling, pricing, and availability.';

-- Enable RLS
alter table public.games enable row level security;

-- Create policy for public read access (only published games)
create policy "Published games are viewable by everyone"
  on public.games
  for select
  using (status = 'published');

-- Create policy for insert (only masters)
create policy "Masters can create games"
  on public.games
  for insert
  with check (
    exists (
      select 1 from public.masters
      where masters.id = auth.uid()
      and masters.id = games.master_id
    )
  );

-- Create policy for update (only game author)
create policy "Masters can update their own games"
  on public.games
  for update
  using (
    exists (
      select 1 from public.masters
      where masters.id = auth.uid()
      and masters.id = games.master_id
    )
  )
  with check (
    exists (
      select 1 from public.masters
      where masters.id = auth.uid()
      and masters.id = games.master_id
    )
  );

-- Create indexes for performance
create index idx_games_status on public.games(status);
create index idx_games_master_id on public.games(master_id);
create index idx_games_scheduled_at on public.games(scheduled_at);
create index idx_games_genre on public.games(genre);
create index idx_games_system on public.games(system);

-- Create trigger for updated_at
create trigger set_updated_at
  before update on public.games
  for each row
  execute function public.handle_updated_at();

