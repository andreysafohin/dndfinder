'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CampaignCard } from '@/components/campaign-card'
import { Game } from '@/lib/supabase/types'

interface GamesListProps {
  games: Game[]
  mastersData: Record<string, any>
  playersCount: Record<string, number>
  playerBookings: Record<string, string>
}

export function GamesList({ games, mastersData, playersCount, playerBookings }: GamesListProps) {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [showFreeOnly, setShowFreeOnly] = useState(false)
  const [showBeginnerFriendly, setShowBeginnerFriendly] = useState(false)

  // Инициализация из URL параметров
  useEffect(() => {
    const query = searchParams.get('q') || ''
    const genre = searchParams.get('genre') || null
    const free = searchParams.get('free') === 'true'
    const beginner = searchParams.get('beginner') === 'true'

    setSearchQuery(query)
    setSelectedGenre(genre)
    setShowFreeOnly(free)
    setShowBeginnerFriendly(beginner)
  }, [searchParams])

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      // Поиск по названию, описанию, системе
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = game.title?.toLowerCase().includes(query)
        const matchesDescription = game.description?.toLowerCase().includes(query)
        const matchesSystem = game.system?.toLowerCase().includes(query)
        const matchesMaster = mastersData[game.master_id]?.display_name?.toLowerCase().includes(query)
        
        if (!matchesTitle && !matchesDescription && !matchesSystem && !matchesMaster) {
          return false
        }
      }

      // Фильтр по жанру
      if (selectedGenre && selectedGenre !== 'Все жанры') {
        if (game.genre?.toLowerCase() !== selectedGenre.toLowerCase()) {
          return false
        }
      }

      // Фильтр "Бесплатно"
      if (showFreeOnly && game.price_rub && game.price_rub > 0) {
        return false
      }

      // Фильтр "Для новичков"
      if (showBeginnerFriendly && !game.beginner_friendly) {
        return false
      }

      return true
    })
  }, [games, searchQuery, selectedGenre, showFreeOnly, showBeginnerFriendly, mastersData])

  return (
    <>
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game) => {
            const masterInfo = mastersData[game.master_id] || {
              display_name: 'Мастер',
              experience_level: 'beginner'
            }
            const playersJoined = playersCount[game.id] || 0
            return (
              <CampaignCard 
                key={game.id} 
                game={game}
                masterName={masterInfo.display_name}
                masterExperience={masterInfo.experience_level}
                hasBooking={!!playerBookings[game.id]}
                bookingStatus={playerBookings[game.id] || null}
                playersJoined={playersJoined}
              />
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            Игры не найдены. Попробуйте изменить параметры поиска.
          </p>
        </div>
      )}
    </>
  )
}

