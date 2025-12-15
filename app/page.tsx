import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SearchBar } from "@/components/search-bar"
import { GamesList } from "@/app/games-list"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  const supabase = await createClient()

  // Проверяем, авторизован ли пользователь
  const { data: { user } } = await supabase.auth.getUser()
  let playerBookings: Record<string, string> = {}

  if (user) {
    // Получаем заявки игрока
    const { data: bookings } = await supabase
      .from('bookings')
      .select('game_id, status')
      .eq('player_id', user.id)
      .eq('status', 'approved')

    if (bookings) {
      bookings.forEach((booking: any) => {
        playerBookings[booking.game_id] = booking.status
      })
    }
  }

  // Получаем опубликованные игры
  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (gamesError) {
    console.error('Error fetching games:', gamesError)
  }

  // Получаем количество approved bookings для каждой игры
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

  // Получаем информацию о мастерах и профилях для этих игр
  let mastersData: Record<string, any> = {}
  if (games && games.length > 0) {
    const masterIds = [...new Set(games.map(g => g.master_id))]
    
    // Получаем мастера
    const { data: masters, error: mastersError } = await supabase
      .from('masters')
      .select('id, experience_level')
      .in('id', masterIds)

    // Получаем профили
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url')
      .in('id', masterIds)

    if (mastersError) {
      console.error('Error fetching masters:', mastersError)
    }
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
    }

    // Объединяем данные
    if (masters) {
      masters.forEach((master) => {
        const profile = profiles?.find((p: any) => p.id === master.id)
        mastersData[master.id] = {
          experience_level: master.experience_level,
          display_name: profile?.display_name || 'Мастер',
          avatar_url: profile?.avatar_url || null,
        }
      })
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <SearchBar />
      <main className="container mx-auto px-4 py-8 flex-1">
        {games && games.length > 0 ? (
          <GamesList 
            games={games}
            mastersData={mastersData}
            playersCount={playersCount}
            playerBookings={playerBookings}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Пока нет доступных игр. Станьте первым мастером!
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
