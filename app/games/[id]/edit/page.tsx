import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GameForm } from '@/components/game-form'
import { ClientFormWrapper } from './client-form-wrapper'

export default async function EditGamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Проверка аутентификации
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Получаем игру
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .single()

  if (gameError || !game) {
    redirect('/games/my-games')
  }

  // Проверка, что пользователь - владелец игры
  if (game.master_id !== user.id) {
    redirect('/games/my-games')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Редактировать игру</h1>
      <ClientFormWrapper game={game} />
    </div>
  )
}

