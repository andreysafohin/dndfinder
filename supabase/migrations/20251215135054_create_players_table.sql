-- Migration: Create players table
-- Purpose: Extended profiles for Players
-- Affected tables: players

-- Create players table
create table public.players (
  id uuid primary key references public.profiles(id) on delete cascade,
  experience_level text not null check (experience_level in ('beginner', 'intermediate', 'advanced', 'expert')),
  preferred_systems text[] default array[]::text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.players is 'Extended profiles for Players. Contains player-specific information like experience level and preferred game systems.';

-- Enable RLS
alter table public.players enable row level security;

-- Create policy for public read access
create policy "Players are viewable by everyone"
  on public.players
  for select
  using (true);

-- Create policy for insert (only authenticated users, their own profile)
create policy "Users can create their own player profile"
  on public.players
  for insert
  with check (auth.uid() = id);

-- Create policy for update (only own profile)
create policy "Users can update their own player profile"
  on public.players
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Create unique index
create unique index idx_players_profile on public.players(id);

-- Create trigger for updated_at
create trigger set_updated_at
  before update on public.players
  for each row
  execute function public.handle_updated_at();

