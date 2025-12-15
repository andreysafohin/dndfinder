'use client'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock, DollarSign, Calendar } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Game } from "@/lib/supabase/types"
import { QuickJoinButton } from "@/components/quick-join-button"

interface CampaignCardProps {
  game: Game
  masterName: string
  masterExperience: string
  hasBooking?: boolean
  bookingStatus?: string | null
  playersJoined?: number
}

const experienceLabels: Record<string, string> = {
  beginner: 'Новичок',
  intermediate: 'Средний',
  advanced: 'Опытный',
  expert: 'Эксперт'
}

export function CampaignCard({ game, masterName, masterExperience, hasBooking = false, bookingStatus = null, playersJoined }: CampaignCardProps) {
  const router = useRouter()

  const formatPrice = (price: number | null) => {
    if (!price || price === 0) return 'Бесплатно'
    return `${price} ₽`
  }

  const formatSchedule = (scheduledAt: string | null) => {
    if (!scheduledAt) return 'Не указано'
    const date = new Date(scheduledAt)
    return date.toLocaleDateString('ru-RU', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow overflow-hidden">
      <Link href={`/games/${game.id}`}>
        <div className="relative w-full h-48 overflow-hidden bg-muted cursor-pointer">
          <Image 
            src={game.image_url || "/placeholder.svg"} 
            alt={game.title} 
            fill 
            className="object-cover" 
          />
        </div>
      </Link>

      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link href={`/games/${game.id}`}>
            <CardTitle className="text-xl text-balance hover:underline cursor-pointer">{game.title}</CardTitle>
          </Link>
          {game.genre && <Badge variant="secondary">{game.genre}</Badge>}
        </div>
        <CardDescription className="text-pretty line-clamp-2">
          {game.description || 'Описание отсутствует'}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Игроки:</span>
            </div>
            <span className="font-medium text-foreground">
              {playersJoined !== undefined ? playersJoined : (game.seats_total - game.seats_available)}/{game.seats_total}
            </span>
          </div>
          {game.game_date && (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>День:</span>
              </div>
              <span className="font-medium text-foreground">{formatDate(game.game_date)}</span>
            </div>
          )}
          {game.game_time && (
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Время:</span>
              </div>
              <span className="font-medium text-foreground">{game.game_time}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Расписание:</span>
            </div>
            <span className="font-medium text-foreground">{formatSchedule(game.scheduled_at)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Стоимость:</span>
            </div>
            <span className="font-bold text-foreground text-base">{formatPrice(game.price_rub)}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Мастер:</span>
            <span className="font-medium text-foreground">{masterName}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">Уровень:</span>
            <Badge variant="outline" className="text-xs">
              {experienceLabels[masterExperience] || masterExperience}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Link href={`/games/${game.id}`} className="flex-1 min-w-0">
          <Button variant="outline" className="w-full" size="lg">
            Подробнее
          </Button>
        </Link>
        {(game.seats_available > 0 || (hasBooking && bookingStatus === 'approved')) && (
          <div className="flex-1 min-w-0">
            <QuickJoinButton 
              gameId={game.id} 
              seatsAvailable={game.seats_available}
              hasBooking={hasBooking}
              bookingStatus={bookingStatus}
            />
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

