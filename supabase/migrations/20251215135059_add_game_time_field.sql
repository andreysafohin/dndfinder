-- Migration: Add game_time field to games table
-- Purpose: Add separate time field for game start time
-- Affected tables: games

-- Add game_time field
alter table public.games
add column if not exists game_time time;

comment on column public.games.game_time is 'Time of day when the game starts (e.g., 19:00)';

