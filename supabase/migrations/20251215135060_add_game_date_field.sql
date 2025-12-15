-- Migration: Add game_date field to games table
-- Purpose: Add separate date field for game day
-- Affected tables: games

-- Add game_date field
alter table public.games
add column if not exists game_date date;

comment on column public.games.game_date is 'Date when the game will be held';

