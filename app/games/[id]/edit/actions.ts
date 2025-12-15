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

export async function updateGame(gameId: string, data: GameFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Проверка, что пользователь - владелец игры
  const { data: game } = await supabase
    .from('games')
    .select('master_id, seats_available, seats_total')
    .eq('id', gameId)
    .single()

  if (!game || game.master_id !== user.id) {
    throw new Error('У вас нет прав на редактирование этой игры')
  }

  // Если количество мест уменьшилось, нужно скорректировать доступные места
  let seatsAvailable = game.seats_available
  if (data.seats_total < game.seats_total) {
    // Если уменьшили общее количество мест, уменьшаем доступные места
    const diff = game.seats_total - data.seats_total
    seatsAvailable = Math.max(0, game.seats_available - diff)
  } else if (data.seats_total > game.seats_total) {
    // Если увеличили общее количество мест, увеличиваем доступные места
    const diff = data.seats_total - game.seats_total
    seatsAvailable = game.seats_available + diff
  }

  const { error } = await supabase
    .from('games')
    .update({
      title: data.title,
      description: data.description,
      system: data.system,
      format: data.format,
      seats_total: data.seats_total,
      seats_available: seatsAvailable,
      price_rub: data.price_rub || 0,
      genre: data.genre || null,
      platform: data.platform || null,
      image_url: data.image_url || null,
      game_time: data.game_time || null,
      game_date: data.game_date || null,
    })
    .eq('id', gameId)

  if (error) {
    throw new Error(error.message || 'Ошибка при обновлении игры')
  }
}

