-- Migration: Create profiles table
-- Purpose: Base user profiles linked to auth.users
-- Affected tables: profiles

-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  timezone text default 'Europe/Moscow',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.profiles is 'Base user profiles linked to auth.users. Contains common information for all users.';

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policy for public read access
create policy "Profiles are viewable by everyone"
  on public.profiles
  for select
  using (true);

-- Create policy for insert (only through trigger)
create policy "Users can insert their own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- Create policy for update (only own profile)
create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Create function to automatically update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

-- Create function to automatically create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

