'use client'

import { useRouter } from 'next/navigation'
import { GameForm, GameFormData } from '@/components/game-form'
import { createGame } from './actions'
import { uploadGameImage } from '@/lib/storage'

export function ClientFormWrapper() {
  const router = useRouter()

  async function handleSubmit(data: GameFormData) {
    try {
      // Если есть файл, не передаем image_url (будет установлен после загрузки)
      const { imageFile, ...gameData } = data
      if (imageFile) {
        gameData.image_url = undefined
      }
      
      // Создаем игру и получаем ID
      const gameId = await createGame(gameData)
      
      // Если есть файл изображения, загружаем его (функция сама обновит image_url в БД)
      if (imageFile && gameId) {
        try {
          await uploadGameImage(gameId, imageFile)
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

