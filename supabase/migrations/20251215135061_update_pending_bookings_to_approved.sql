-- Migration: Update pending bookings to approved
-- Purpose: Convert all pending bookings to approved status since we now auto-approve
-- Affected tables: bookings

-- Update all pending bookings to approved
update public.bookings
set status = 'approved'
where status = 'pending';

-- Update seats_available for games with newly approved bookings
-- This is handled by the trigger, but we can also do it manually if needed
-- The trigger update_game_seats should handle this automatically

comment on function public.update_game_seats is 'Automatically updates game seats when booking status changes to approved';

