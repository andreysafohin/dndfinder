import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, Home } from 'lucide-react'
import Image from 'next/image'
import { CancelBookingButton } from './cancel-button'
import { GamesCalendar } from '@/components/games-calendar'

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  approved: { label: 'Вы в игре', variant: 'default' },
  rejected: { label: 'Отклонено', variant: 'destructive' },
  cancelled: { label: 'Отменено', variant: 'secondary' },
}

export default async function MyBookingsPage() {
  const supabase = await createClient()

  // Проверка аутентификации
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Проверка, что пользователь - игрок
  const { data: player, error: playerError } = await supabase
    .from('players')
    .select('id')
    .eq('id', user.id)
    .single()

  if (playerError || !player) {
    redirect('/')
  }

  // Получаем все заявки игрока
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('*')
    .eq('player_id', user.id)
    .order('created_at', { ascending: false })

  if (bookingsError) {
    console.error('Error fetching bookings:', bookingsError)
  }

  // Получаем информацию об играх
  let gamesData: Record<string, any> = {}
  let mastersData: Record<string, any> = {}
  
  if (bookings && bookings.length > 0) {
    const gameIds = [...new Set(bookings.map((b: any) => b.game_id))]
    
    // Получаем игры
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('id, title, description, image_url, scheduled_at, seats_total, seats_available, price_rub, system, format, genre, master_id, game_time, game_date')
      .in('id', gameIds)

    if (gamesError) {
      console.error('Error fetching games:', gamesError)
    }

    // Получаем информацию о мастерах
    if (games) {
      const masterIds = [...new Set(games.map((g: any) => g.master_id))]
      
      const { data: masters, error: mastersError } = await supabase
        .from('masters')
        .select('id')
        .in('id', masterIds)

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', masterIds)

      if (mastersError) {
        console.error('Error fetching masters:', mastersError)
      }
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError)
      }

      // Объединяем данные мастера
      if (masters) {
        masters.forEach((master) => {
          const profile = profiles?.find((p: any) => p.id === master.id)
          mastersData[master.id] = {
            display_name: profile?.display_name || 'Мастер',
          }
        })
      }

      // Сохраняем данные игр
      games.forEach((game: any) => {
        gamesData[game.id] = {
          ...game,
          master: mastersData[game.master_id],
        }
      })
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

  // Подготавливаем данные для календаря
  const calendarGames = bookings
    ?.filter((booking: any) => booking.status === 'approved' && gamesData[booking.game_id])
    .map((booking: any) => {
      const game = gamesData[booking.game_id]
      return {
        id: game.id,
        title: game.title,
        date: game.game_date || game.scheduled_at?.split('T')[0] || null,
        time: game.game_time,
      }
    })
    .filter((game: any) => game.date) || []

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Мои игры</h1>
        <Link href="/">
          <Button variant="outline">
            <Home className="h-4 w-4 mr-2" />
            На главную
          </Button>
        </Link>
      </div>

      {/* Календарь игр */}
      {calendarGames.length > 0 && (
        <div className="mb-8">
          <GamesCalendar games={calendarGames} />
        </div>
      )}

      {bookings && bookings.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {bookings.map((booking: any) => {
            const game = gamesData[booking.game_id]
            const master = game?.master

            return (
              <Card key={booking.id} className="flex flex-col">
                <div className="relative w-full h-48 overflow-hidden bg-muted">
                  <Image
                    src={game?.image_url || "/placeholder.svg"}
                    alt={game?.title || 'Игра'}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl line-clamp-2">{game?.title || 'Игра'}</CardTitle>
                    <Badge variant={statusLabels[booking.status]?.variant || 'outline'}>
                      {statusLabels[booking.status]?.label || booking.status}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {game?.description || 'Описание отсутствует'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Мастер: </span>
                    <span className="font-medium">{master?.display_name || 'Мастер'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Расписание: </span>
                    <span className="font-medium">{formatSchedule(game?.scheduled_at)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Места: </span>
                    <span className="font-medium">
                      {game?.seats_total - game?.seats_available}/{game?.seats_total}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Стоимость: </span>
                    <span className="font-medium">{formatPrice(game?.price_rub)}</span>
                  </div>
                  {booking.message && (
                    <div className="text-sm pt-2 border-t">
                      <span className="text-muted-foreground">Ваше сообщение: </span>
                      <p className="text-foreground mt-1">{booking.message}</p>
                    </div>
                  )}
                </CardContent>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Link href={`/games/${game?.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Подробнее
                      </Button>
                    </Link>
                    {booking.status === 'approved' && (
                      <CancelBookingButton bookingId={booking.id} />
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              У вас пока нет заявок на участие в играх
            </p>
            <Link href="/">
              <Button>Найти игру</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


