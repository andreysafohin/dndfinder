'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface QuickJoinButtonProps {
  gameId: string
  seatsAvailable: number
  hasBooking?: boolean
  bookingStatus?: string | null
}

export function QuickJoinButton({ gameId, seatsAvailable, hasBooking = false, bookingStatus = null }: QuickJoinButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleQuickJoin = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (seatsAvailable <= 0) {
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push('/auth/login')
        return
      }

      // Проверяем, является ли пользователь игроком
      const { data: player } = await supabase
        .from('players')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!player) {
        alert('Только игроки могут присоединяться к играм')
        return
      }

      // Если игрок уже в игре, показываем кнопку "Покинуть"
      if (hasBooking && bookingStatus === 'approved') {
        if (!confirm('Вы уверены, что хотите покинуть игру?')) {
          return
        }

        const { error: updateError } = await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('game_id', gameId)
          .eq('player_id', user.id)
          .eq('status', 'approved')

        if (updateError) {
          throw new Error(updateError.message || 'Ошибка при выходе из игры')
        }

        alert('Вы покинули игру')
        router.refresh()
        return
      }

      // Проверяем, есть ли уже заявка
      const { data: existingBooking } = await supabase
        .from('bookings')
        .select('status')
        .eq('game_id', gameId)
        .eq('player_id', user.id)
        .single()

      if (existingBooking) {
        if (existingBooking.status === 'approved') {
          alert('Вы уже присоединились к этой игре')
          return
        } else if (existingBooking.status === 'pending' || existingBooking.status === 'cancelled') {
          // Обновляем старые pending или cancelled заявки на approved
          const { error: updateError } = await supabase
            .from('bookings')
            .update({ status: 'approved' })
            .eq('game_id', gameId)
            .eq('player_id', user.id)
            .in('status', ['pending', 'cancelled'])

          if (updateError) {
            throw new Error(updateError.message || 'Ошибка при обновлении заявки')
          }

          alert('Вы успешно присоединились к игре!')
          router.refresh()
          return
        } else {
          alert('У вас уже есть заявка на эту игру')
          return
        }
      }

      // Создаем новую заявку со статусом approved (игрок сразу попадает в игру)
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          game_id: gameId,
          player_id: user.id,
          status: 'approved',
        })

      if (bookingError) {
        throw new Error(bookingError.message || 'Ошибка при присоединении к игре')
      }

      alert('Вы успешно присоединились к игре!')
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  // Если игрок уже в игре, показываем кнопку "Покинуть"
  if (hasBooking && bookingStatus === 'approved') {
    return (
      <Button
        size="sm"
        variant="destructive"
        onClick={handleQuickJoin}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Выход...' : 'Покинуть'}
      </Button>
    )
  }

  if (seatsAvailable <= 0) {
    return null
  }

  return (
    <Button
      size="sm"
      variant="default"
      onClick={handleQuickJoin}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? 'Отправка...' : 'Присоединиться'}
    </Button>
  )
}

