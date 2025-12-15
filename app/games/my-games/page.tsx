import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Users, Home } from 'lucide-react'

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  draft: { label: 'Черновик', variant: 'outline' },
  published: { label: 'Опубликовано', variant: 'default' },
  completed: { label: 'Завершено', variant: 'secondary' },
  cancelled: { label: 'Отменено', variant: 'destructive' },
}

export default async function MyGamesPage() {
  const supabase = await createClient()

  // Проверка аутентификации
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Проверка, что пользователь - мастер
  const { data: master, error: masterError } = await supabase
    .from('masters')
    .select('id')
    .eq('id', user.id)
    .single()

  if (masterError || !master) {
    redirect('/')
  }

  // Получаем все игры мастера
  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select('*')
    .eq('master_id', user.id)
    .order('created_at', { ascending: false })

  if (gamesError) {
    console.error('Error fetching games:', gamesError)
  }

  // Получаем количество одобренных заявок для каждой игры
  let playersCount: Record<string, number> = {}
  if (games && games.length > 0) {
    const gameIds = games.map(g => g.id)
    const { data: bookings } = await supabase
      .from('bookings')
      .select('game_id')
      .in('game_id', gameIds)
      .eq('status', 'approved')

    if (bookings) {
      bookings.forEach((booking: any) => {
        playersCount[booking.game_id] = (playersCount[booking.game_id] || 0) + 1
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Мои игры</h1>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="outline">
              <Home className="h-4 w-4 mr-2" />
              На главную
            </Button>
          </Link>
          <Link href="/games/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Создать игру
            </Button>
          </Link>
        </div>
      </div>

      {games && games.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Card key={game.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xl line-clamp-2">{game.title}</CardTitle>
                  <Badge variant={statusLabels[game.status]?.variant || 'outline'}>
                    {statusLabels[game.status]?.label || game.status}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {game.description || 'Описание отсутствует'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Места:</span>
                  <span className="font-medium">
                    {playersCount[game.id] || 0}/{game.seats_total}
                  </span>
                  {(game.seats_total - (playersCount[game.id] || 0)) > 0 && (
                    <span className="text-green-600 text-xs">
                      ({game.seats_total - (playersCount[game.id] || 0)} свободно)
                    </span>
                  )}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Система: </span>
                  <span className="font-medium">{game.system}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Формат: </span>
                  <Badge variant="outline" className="text-xs">
                    {game.format === 'one-shot' ? 'One-shot' : 'Кампания'}
                  </Badge>
                </div>
              </CardContent>
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Link href={`/games/${game.id}/edit`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Редактировать
                    </Button>
                  </Link>
                  <Link href={`/games/${game.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full">
                      Просмотр
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              У вас пока нет созданных игр
            </p>
            <Link href="/games/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Создать первую игру
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

