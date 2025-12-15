import { createClient } from '@/lib/supabase/client'

const BUCKET_NAME = 'public-assets'
const MAX_AVATAR_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_GAME_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_GAME_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

/**
 * Upload avatar for a user
 * @param userId - User ID
 * @param file - File to upload
 * @returns URL of the uploaded file or null if error
 */
export async function uploadAvatar(userId: string, file: File): Promise<string | null> {
  // Validate file
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP')
  }
  
  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error('File size exceeds 5MB limit')
  }

  const supabase = createClient()
  
  // Delete old avatar if exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', userId)
    .single()
  
  if (profile?.avatar_url) {
    // Extract path from full URL
    const urlParts = profile.avatar_url.split(`/${BUCKET_NAME}/`)
    if (urlParts.length > 1) {
      const oldPath = urlParts[1]
      await supabase.storage.from(BUCKET_NAME).remove([oldPath])
    }
  }

  // Generate unique filename
  const timestamp = Date.now()
  const fileExt = file.name.split('.').pop()
  const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `avatars/${userId}/${fileName}`

  // Upload file
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Error uploading avatar:', error)
    return null
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath)

  // Update profile with new avatar URL
  await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', userId)

  return publicUrl
}

/**
 * Upload game image
 * @param gameId - Game ID
 * @param file - File to upload
 * @returns URL of the uploaded file or null if error
 */
export async function uploadGameImage(gameId: string, file: File): Promise<string | null> {
  // Validate file
  if (!ALLOWED_GAME_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP, AVIF')
  }
  
  if (file.size > MAX_GAME_IMAGE_SIZE) {
    throw new Error('File size exceeds 10MB limit')
  }

  const supabase = createClient()
  
  // Delete old image if exists
  const { data: game } = await supabase
    .from('games')
    .select('image_url')
    .eq('id', gameId)
    .single()
  
  if (game?.image_url) {
    // Extract path from full URL
    const urlParts = game.image_url.split(`/${BUCKET_NAME}/`)
    if (urlParts.length > 1) {
      const oldPath = urlParts[1]
      await supabase.storage.from(BUCKET_NAME).remove([oldPath])
    }
  }

  // Generate unique filename
  const timestamp = Date.now()
  const fileExt = file.name.split('.').pop()
  const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `game-images/${gameId}/${fileName}`

  // Upload file
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('Error uploading game image:', error)
    return null
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath)

  // Update game with new image URL
  await supabase
    .from('games')
    .update({ image_url: publicUrl })
    .eq('id', gameId)

  return publicUrl
}

/**
 * Delete avatar
 * @param userId - User ID
 */
export async function deleteAvatar(userId: string): Promise<void> {
  const supabase = createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', userId)
    .single()
  
  if (profile?.avatar_url) {
    // Extract path from full URL
    const urlParts = profile.avatar_url.split(`/${BUCKET_NAME}/`)
    if (urlParts.length > 1) {
      const path = urlParts[1]
      await supabase.storage.from(BUCKET_NAME).remove([path])
    }
    
    // Update profile to remove avatar URL
    await supabase
      .from('profiles')
      .update({ avatar_url: null })
      .eq('id', userId)
  }
}

/**
 * Delete game image
 * @param gameId - Game ID
 */
export async function deleteGameImage(gameId: string): Promise<void> {
  const supabase = createClient()
  
  const { data: game } = await supabase
    .from('games')
    .select('image_url')
    .eq('id', gameId)
    .single()
  
  if (game?.image_url) {
    // Extract path from full URL
    const urlParts = game.image_url.split(`/${BUCKET_NAME}/`)
    if (urlParts.length > 1) {
      const path = urlParts[1]
      await supabase.storage.from(BUCKET_NAME).remove([path])
    }
    
    // Update game to remove image URL
    await supabase
      .from('games')
      .update({ image_url: null })
      .eq('id', gameId)
  }
}

/**
 * Get public URL for a storage path
 * @param path - Storage path
 * @returns Public URL
 */
export function getStorageUrl(path: string): string {
  const supabase = createClient()
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path)
  return publicUrl
}

