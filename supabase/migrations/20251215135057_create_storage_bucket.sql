-- Migration: Create public-assets storage bucket
-- Purpose: Public bucket for avatars and game images
-- Affected: Storage bucket and policies

-- Create the public-assets bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'public-assets',
  'public-assets',
  true,
  10485760, -- 10MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
);

-- Create policy for public read access to avatars
create policy "Avatar images are publicly accessible"
  on storage.objects
  for select
  using (bucket_id = 'public-assets' and (storage.foldername(name))[1] = 'avatars');

-- Create policy for users to upload their own avatars
create policy "Users can upload their own avatars"
  on storage.objects
  for insert
  with check (
    bucket_id = 'public-assets'
    and (storage.foldername(name))[1] = 'avatars'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

-- Create policy for users to update their own avatars
create policy "Users can update their own avatars"
  on storage.objects
  for update
  using (
    bucket_id = 'public-assets'
    and (storage.foldername(name))[1] = 'avatars'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

-- Create policy for users to delete their own avatars
create policy "Users can delete their own avatars"
  on storage.objects
  for delete
  using (
    bucket_id = 'public-assets'
    and (storage.foldername(name))[1] = 'avatars'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

-- Create policy for public read access to game images
create policy "Game images are publicly accessible"
  on storage.objects
  for select
  using (bucket_id = 'public-assets' and (storage.foldername(name))[1] = 'game-images');

-- Create policy for masters to upload images for their games
create policy "Masters can upload images for their games"
  on storage.objects
  for insert
  with check (
    bucket_id = 'public-assets'
    and (storage.foldername(name))[1] = 'game-images'
    and exists (
      select 1 from public.games
      join public.masters on games.master_id = masters.id
      where games.id::text = (storage.foldername(name))[2]
      and masters.id = auth.uid()
    )
  );

-- Create policy for masters to update images for their games
create policy "Masters can update images for their games"
  on storage.objects
  for update
  using (
    bucket_id = 'public-assets'
    and (storage.foldername(name))[1] = 'game-images'
    and exists (
      select 1 from public.games
      join public.masters on games.master_id = masters.id
      where games.id::text = (storage.foldername(name))[2]
      and masters.id = auth.uid()
    )
  );

-- Create policy for masters to delete images for their games
create policy "Masters can delete images for their games"
  on storage.objects
  for delete
  using (
    bucket_id = 'public-assets'
    and (storage.foldername(name))[1] = 'game-images'
    and exists (
      select 1 from public.games
      join public.masters on games.master_id = masters.id
      where games.id::text = (storage.foldername(name))[2]
      and masters.id = auth.uid()
    )
  );

