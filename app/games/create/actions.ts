'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type GameFormData = {
  title: string
  description: string
  system: string
  format: 'one-shot' | 'campaign'
  seats_total: number
  price_rub?: number
  genre?: string
  platform?: string
  image_url?: string
  game_time?: string
  game_date?: string
}

export async function createGame(data: GameFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Проверка, что пользователь - мастер
  const { data: master } = await supabase
    .from('masters')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!master) {
    throw new Error('Только мастера могут создавать игры')
  }

  const { data: game, error } = await supabase
    .from('games')
    .insert({
      master_id: user.id,
      title: data.title,
      description: data.description,
      system: data.system,
      format: data.format,
      seats_total: data.seats_total,
      seats_available: data.seats_total,
      price_rub: data.price_rub || 0,
      genre: data.genre || null,
      platform: data.platform || null,
      image_url: data.image_url || null, // Если URL указан, используем его
      game_time: data.game_time || null,
      game_date: data.game_date || null,
      status: 'published',
      session_length_minutes: 180,
      beginner_friendly: false,
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(error.message || 'Ошибка при создании игры')
  }

  return game.id
}

