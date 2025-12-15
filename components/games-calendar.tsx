'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface GameDate {
  id: string
  title: string
  date: string
  time?: string | null
}

interface GamesCalendarProps {
  games: GameDate[]
}

export function GamesCalendar({ games }: GamesCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Первый день месяца
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // Названия месяцев
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ]

  // Названия дней недели
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

  // Группируем игры по датам
  const gamesByDate: Record<string, GameDate[]> = {}
  games.forEach((game) => {
    if (game.date) {
      const dateKey = game.date
      if (!gamesByDate[dateKey]) {
        gamesByDate[dateKey] = []
      }
      gamesByDate[dateKey].push(game)
    }
  })

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getDateKey = (day: number) => {
    const date = new Date(year, month, day)
    return date.toISOString().split('T')[0]
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Календарь игр</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={previousMonth}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold min-w-[140px] text-center">
              {monthNames[month]} {year}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1
            const dateKey = getDateKey(day)
            const dayGames = gamesByDate[dateKey] || []
            const isToday = 
              new Date().toDateString() === new Date(year, month, day).toDateString()

            return (
              <div
                key={day}
                className={`
                  aspect-square border rounded-md p-1 text-sm
                  ${isToday ? 'border-primary bg-primary/5' : 'border-border'}
                  ${dayGames.length > 0 ? 'bg-accent/50' : ''}
                `}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={isToday ? 'font-bold text-primary' : ''}>
                    {day}
                  </span>
                  {dayGames.length > 0 && (
                    <Badge variant="secondary" className="h-4 px-1 text-xs">
                      {dayGames.length}
                    </Badge>
                  )}
                </div>
                {dayGames.length > 0 && (
                  <div className="space-y-0.5 max-h-[60px] overflow-y-auto">
                    {dayGames.slice(0, 2).map((game) => (
                      <Link
                        key={game.id}
                        href={`/games/${game.id}`}
                        className="block text-xs truncate hover:underline text-primary"
                        title={`${game.time ? `${game.time} - ` : ''}${game.title}`}
                      >
                        {game.time && (
                          <span className="font-medium">{game.time}</span>
                        )}
                        <span className={game.time ? ' ml-1' : ''}>{game.title}</span>
                      </Link>
                    ))}
                    {dayGames.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayGames.length - 2} еще
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

