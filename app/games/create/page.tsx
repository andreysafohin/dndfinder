import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClientFormWrapper } from './client-form-wrapper'

export default async function CreateGamePage() {
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Создать новую игру</h1>
      <ClientFormWrapper />
    </div>
  )
}

