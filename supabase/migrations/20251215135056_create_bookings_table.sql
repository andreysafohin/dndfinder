-- Migration: Create bookings table
-- Purpose: Player bookings/requests to join games
-- Affected tables: bookings

-- Create bookings table
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint unique_booking unique (game_id, player_id)
);

comment on table public.bookings is 'Player bookings/requests to join games. Tracks the status of player applications to games.';

-- Enable RLS
alter table public.bookings enable row level security;

-- Create policy for select (players see their bookings, masters see bookings for their games)
create policy "Users can view their own bookings"
  on public.bookings
  for select
  using (
    auth.uid() = player_id
    or exists (
      select 1 from public.games
      join public.masters on games.master_id = masters.id
      where games.id = bookings.game_id
      and masters.id = auth.uid()
    )
  );

-- Create policy for insert (only players, only on published games)
create policy "Players can create bookings on published games"
  on public.bookings
  for insert
  with check (
    exists (
      select 1 from public.players
      where players.id = auth.uid()
      and players.id = bookings.player_id
    )
    and exists (
      select 1 from public.games
      where games.id = bookings.game_id
      and games.status = 'published'
      and games.seats_available > 0
    )
  );

-- Create policy for update (masters can approve/reject, players can cancel)
create policy "Masters can update bookings for their games, players can cancel"
  on public.bookings
  for update
  using (
    auth.uid() = player_id
    or exists (
      select 1 from public.games
      join public.masters on games.master_id = masters.id
      where games.id = bookings.game_id
      and masters.id = auth.uid()
    )
  )
  with check (
    auth.uid() = player_id
    or exists (
      select 1 from public.games
      join public.masters on games.master_id = masters.id
      where games.id = bookings.game_id
      and masters.id = auth.uid()
    )
  );

-- Create indexes for performance
create index idx_bookings_game_id on public.bookings(game_id);
create index idx_bookings_player_id on public.bookings(player_id);
create index idx_bookings_status on public.bookings(status);

-- Create trigger for updated_at
create trigger set_updated_at
  before update on public.bookings
  for each row
  execute function public.handle_updated_at();

-- Create function to update seats_available when booking status changes
create or replace function public.update_game_seats()
returns trigger as $$
begin
  -- If booking is approved, decrease available seats
  if new.status = 'approved' and (old.status is null or old.status != 'approved') then
    update public.games
    set seats_available = seats_available - 1
    where id = new.game_id
    and seats_available > 0;
  end if;
  
  -- If booking status changes from approved to something else, increase available seats
  if old.status = 'approved' and new.status != 'approved' then
    update public.games
    set seats_available = seats_available + 1
    where id = old.game_id
    and seats_available < seats_total;
  end if;
  
  return new;
end;
$$ language plpgsql;

-- Create trigger to update seats when booking status changes
create trigger update_game_seats_on_booking_change
  after insert or update of status on public.bookings
  for each row
  execute function public.update_game_seats();

