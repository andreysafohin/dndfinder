'use client'

import { useRouter } from 'next/navigation'
import { GameForm } from '@/components/game-form'
import { updateGame, GameFormData } from './actions'
import { Game } from '@/lib/supabase/types'
import { uploadGameImage } from '@/lib/storage'

interface ClientFormWrapperProps {
  game: Game
}

export function ClientFormWrapper({ game }: ClientFormWrapperProps) {
  const router = useRouter()

  async function handleSubmit(data: GameFormData) {
    try {
      // Если есть файл, не передаем image_url (будет установлен после загрузки)
      const gameData = { ...data }
      if (data.imageFile) {
        gameData.image_url = undefined
      }
      
      await updateGame(game.id, gameData)
      
      // Если есть новый файл изображения, загружаем его (функция сама обновит image_url в БД)
      if (data.imageFile) {
        try {
          await uploadGameImage(game.id, data.imageFile)
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError)
          // Не прерываем процесс, игра уже обновлена
        }
      }
      
      // Используем только push, без refresh - push уже делает навигацию
      router.push('/games/my-games')
    } catch (error) {
      // Пробрасываем ошибку в форму для отображения
      throw error
    }
  }

  return (
    <GameForm 
      initialData={game}
      onSubmit={handleSubmit}
      submitLabel="Сохранить изменения"
    />
  )
}

