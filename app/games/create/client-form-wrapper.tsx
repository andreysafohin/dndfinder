'use client'

import { useRouter } from 'next/navigation'
import { GameForm } from '@/components/game-form'
import { createGame, GameFormData } from './actions'
import { uploadGameImage } from '@/lib/storage'

export function ClientFormWrapper() {
  const router = useRouter()

  async function handleSubmit(data: GameFormData) {
    try {
      // Если есть файл, не передаем image_url (будет установлен после загрузки)
      const gameData = { ...data }
      if (data.imageFile) {
        gameData.image_url = undefined
      }
      
      // Создаем игру и получаем ID
      const gameId = await createGame(gameData)
      
      // Если есть файл изображения, загружаем его (функция сама обновит image_url в БД)
      if (data.imageFile && gameId) {
        try {
          await uploadGameImage(gameId, data.imageFile)
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError)
          // Не прерываем процесс, игра уже создана
        }
      }
      
      router.push('/games/my-games')
      router.refresh()
    } catch (error) {
      throw error
    }
  }

  return <GameForm onSubmit={handleSubmit} />
}

