import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Clock, DollarSign, User, Edit, Calendar } from 'lucide-react'
import { JoinGameButton } from './join-game-button'
import Link from 'next/link'

const experienceLabels: Record<string, string> = {
  beginner: 'Новичок',
  intermediate: 'Средний',
  advanced: 'Опытный',
  expert: 'Эксперт'
}

export default async function GameDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Получаем игру
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (gameError || !game) {
    redirect('/')
  }

  // Получаем количество approved bookings для этой игры
  const { count: playersJoined } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('game_id', id)
    .eq('status', 'approved')

  // Получаем информацию о мастере
  let masterInfo: any = null
  const { data: master, error: masterError } = await supabase
    .from('masters')
    .select('id, experience_level, rating')
    .eq('id', game.master_id)
    .single()

  if (!masterError && master) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, bio')
      .eq('id', game.master_id)
      .single()

    if (!profileError && profile) {
      masterInfo = {
        ...master,
        profile,
      }
    }
  }

  // Проверяем, авторизован ли пользователь и является ли он игроком/мастером
  const { data: { user } } = await supabase.auth.getUser()
  let isPlayer = false
  let hasBooking = false
  let bookingStatus = null
  let isGameMaster = false

  if (user) {
    // Проверяем, является ли пользователь мастером этой игры
    isGameMaster = game.master_id === user.id

    const { data: player } = await supabase
      .from('players')
      .select('id')
      .eq('id', user.id)
      .single()

    isPlayer = !!player

    if (isPlayer) {
      const { data: booking } = await supabase
        .from('bookings')
        .select('status')
        .eq('game_id', id)
        .eq('player_id', user.id)
        .single()

      hasBooking = !!booking
      bookingStatus = booking?.status || null
    }
  }

  const formatPrice = (price: number | null) => {
    if (!price || price === 0) return 'Бесплатно'
    return `${price} ₽`
  }

  const formatSchedule = (scheduledAt: string | null) => {
    if (!scheduledAt) return 'Не указано'
    const date = new Date(scheduledAt)
    return date.toLocaleDateString('ru-RU', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Не указано'
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Кнопка редактирования для мастера */}
      {isGameMaster && (
        <div className="mb-6 flex justify-end">
          <Link href={`/games/${game.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Редактировать игру
            </Button>
          </Link>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Изображение */}
          <div className="relative w-full h-64 md:h-96 overflow-hidden rounded-lg bg-muted">
            <Image 
              src={game.image_url || "/placeholder.svg"} 
              alt={game.title} 
              fill 
              className="object-cover" 
            />
          </div>

          {/* Основная информация */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-3xl mb-2">{game.title}</CardTitle>
                  {game.genre && <Badge variant="secondary" className="mb-2">{game.genre}</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{game.description || 'Описание отсутствует'}</p>
            </CardContent>
          </Card>

          {/* Детали игры */}
          <Card>
            <CardHeader>
              <CardTitle>Детали игры</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Места:</span>
                <span className="font-medium">
                  {playersJoined || 0} из {game.seats_total} занято
                  {game.seats_available > 0 && (
                    <span className="text-green-600 ml-2">({game.seats_available} свободно)</span>
                  )}
                </span>
              </div>
              {game.game_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">День проведения:</span>
                  <span className="font-medium">{formatDate(game.game_date)}</span>
                </div>
              )}
              {game.game_time && (
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Время начала:</span>
                  <span className="font-medium">{game.game_time}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Расписание:</span>
                <span className="font-medium">{formatSchedule(game.scheduled_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Стоимость:</span>
                <span className="font-medium text-lg">{formatPrice(game.price_rub)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Система:</span>
                <Badge variant="outline">{game.system}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Формат:</span>
                <Badge variant="outline">{game.format === 'one-shot' ? 'One-shot' : 'Кампания'}</Badge>
              </div>
              {game.platform && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Платформа:</span>
                  <span className="font-medium">{game.platform}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Информация о мастере */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Мастер
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold text-lg">{masterInfo?.profile?.display_name || 'Мастер'}</p>
                <Badge variant="outline" className="mt-1">
                  {experienceLabels[masterInfo?.experience_level || 'beginner'] || 'Новичок'}
                </Badge>
              </div>
              {masterInfo?.rating && (
                <div>
                  <span className="text-sm text-muted-foreground">Рейтинг: </span>
                  <span className="font-medium">{masterInfo.rating.toFixed(1)} ⭐</span>
                </div>
              )}
              {masterInfo?.profile?.bio && (
                <p className="text-sm text-muted-foreground">{masterInfo.profile.bio}</p>
              )}
            </CardContent>
          </Card>

          {/* Кнопка присоединения */}
          {game.status === 'published' && (
            <Card>
              <CardContent className="pt-6">
                <JoinGameButton 
                  gameId={game.id}
                  seatsAvailable={game.seats_available}
                  isPlayer={isPlayer}
                  hasBooking={hasBooking}
                  bookingStatus={bookingStatus}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

