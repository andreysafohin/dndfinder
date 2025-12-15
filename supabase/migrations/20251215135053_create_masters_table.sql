-- Migration: Create masters table
-- Purpose: Extended profiles for Dungeon Masters
-- Affected tables: masters

-- Create masters table
create table public.masters (
  id uuid primary key references public.profiles(id) on delete cascade,
  experience_level text not null check (experience_level in ('beginner', 'intermediate', 'advanced', 'expert')),
  systems text[] default array[]::text[],
  playstyle_tags text[] default array[]::text[],
  platforms text[] default array[]::text[],
  rating numeric(3, 2) default 0.00 check (rating >= 0 and rating <= 5),
  total_sessions integer default 0 check (total_sessions >= 0),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.masters is 'Extended profiles for Dungeon Masters. Contains DM-specific information like experience, systems, playstyle, and ratings.';

-- Enable RLS
alter table public.masters enable row level security;

-- Create policy for public read access
create policy "Masters are viewable by everyone"
  on public.masters
  for select
  using (true);

-- Create policy for insert (only authenticated users, their own profile)
create policy "Users can create their own master profile"
  on public.masters
  for insert
  with check (auth.uid() = id);

-- Create policy for update (only own profile)
create policy "Users can update their own master profile"
  on public.masters
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Create unique index
create unique index idx_masters_profile on public.masters(id);

-- Create trigger for updated_at
create trigger set_updated_at
  before update on public.masters
  for each row
  execute function public.handle_updated_at();

