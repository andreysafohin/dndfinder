-- Migration: Create function to create master/player profiles
-- Purpose: Allow profile creation without active auth session (for sign-up flow)
-- Affected functions: create_role_profile

-- Create function to create master or player profile
-- Uses security definer to bypass RLS policies
create or replace function public.create_role_profile(
  p_user_id uuid,
  p_role text
)
returns void
language plpgsql
security definer
as $$
begin
  -- Validate role
  if p_role not in ('master', 'player') then
    raise exception 'Invalid role. Must be "master" or "player"';
  end if;

  -- Create master profile
  if p_role = 'master' then
    insert into public.masters (id, experience_level)
    values (p_user_id, 'beginner')
    on conflict (id) do nothing;
  end if;

  -- Create player profile
  if p_role = 'player' then
    insert into public.players (id, experience_level)
    values (p_user_id, 'beginner')
    on conflict (id) do nothing;
  end if;
end;
$$;

comment on function public.create_role_profile is 'Creates a master or player profile for a user. Uses security definer to bypass RLS policies.';

