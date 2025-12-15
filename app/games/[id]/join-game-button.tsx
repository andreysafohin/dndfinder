'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface JoinGameButtonProps {
  gameId: string
  seatsAvailable: number
  isPlayer: boolean
  hasBooking: boolean
  bookingStatus: string | null
}

export function JoinGameButton({ gameId, seatsAvailable, isPlayer, hasBooking, bookingStatus }: JoinGameButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleJoin = async () => {
    if (!isPlayer) {
      router.push('/auth/login')
      return
    }

    if (hasBooking) {
      if (bookingStatus === 'approved') {
        setError('Вы уже присоединились к этой игре')
        return
      } else if (bookingStatus === 'pending' || bookingStatus === 'cancelled') {
        // Обновляем старые pending или cancelled заявки на approved
        setIsLoading(true)
        try {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          
          if (!user) {
            router.push('/auth/login')
            return
          }

          const { error: updateError } = await supabase
            .from('bookings')
            .update({ status: 'approved' })
            .eq('game_id', gameId)
            .eq('player_id', user.id)
            .in('status', ['pending', 'cancelled'])

          if (updateError) {
            throw new Error(updateError.message || 'Ошибка при обновлении заявки')
          }

          setSuccess(true)
          router.refresh()
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Произошла ошибка')
        } finally {
          setIsLoading(false)
        }
        return
      } else if (bookingStatus === 'rejected') {
        setError('Ваша заявка была отклонена')
        return
      }
    }

    if (seatsAvailable <= 0) {
      setError('Нет свободных мест')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Проверяем, есть ли уже заявка (может быть cancelled)
      const { data: existingBooking } = await supabase
        .from('bookings')
        .select('status')
        .eq('game_id', gameId)
        .eq('player_id', user.id)
        .single()

      if (existingBooking) {
        // Если есть cancelled заявка, обновляем её
        if (existingBooking.status === 'cancelled' || existingBooking.status === 'pending') {
          const { error: updateError } = await supabase
            .from('bookings')
            .update({ status: 'approved' })
            .eq('game_id', gameId)
            .eq('player_id', user.id)

          if (updateError) {
            throw new Error(updateError.message || 'Ошибка при обновлении заявки')
          }
        } else {
          throw new Error('У вас уже есть активная заявка на эту игру')
        }
      } else {
        // Создаем новую заявку
        const { error: bookingError } = await supabase
          .from('bookings')
          .insert({
            game_id: gameId,
            player_id: user.id,
            status: 'approved', // Игрок сразу попадает в игру
          })

        if (bookingError) {
          throw new Error(bookingError.message || 'Ошибка при создании заявки')
        }
      }

      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isPlayer) {
    return (
      <div className="space-y-2">
        <Button className="w-full" size="lg" onClick={handleJoin}>
          Войти для присоединения
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Только зарегистрированные игроки могут присоединяться к играм
        </p>
      </div>
    )
  }

  const handleLeave = async () => {
    if (!isPlayer) {
      return
    }

    if (!confirm('Вы уверены, что хотите покинуть игру?')) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
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

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  if (hasBooking) {
    if (bookingStatus === 'approved') {
      return (
        <div className="space-y-2">
          <Button 
            className="w-full" 
            size="lg" 
            variant="destructive"
            onClick={handleLeave}
            disabled={isLoading}
          >
            {isLoading ? 'Выход...' : 'Покинуть игру'}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Вы присоединены к этой игре
          </p>
        </div>
      )
    }
    // Для pending и cancelled показываем кнопку присоединения
    if (bookingStatus === 'pending' || bookingStatus === 'cancelled') {
      // Продолжаем показывать кнопку присоединиться ниже
    } else {
      // Для rejected или других статусов
      return null
    }
  }

  if (seatsAvailable <= 0) {
    return (
      <Button className="w-full" size="lg" disabled>
        Мест нет
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      {success ? (
        <>
          <Button className="w-full" size="lg" disabled>
            Вы присоединились!
          </Button>
          <p className="text-xs text-green-600 text-center">
            Вы успешно присоединились к игре!
          </p>
        </>
      ) : (
        <>
          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleJoin}
            disabled={isLoading}
          >
            {isLoading ? 'Отправка...' : 'Присоединиться к игре'}
          </Button>
          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}
          <p className="text-xs text-muted-foreground text-center">
            Свободных мест: {seatsAvailable}
          </p>
        </>
      )}
    </div>
  )
}

