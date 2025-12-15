'use client'

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [showFreeOnly, setShowFreeOnly] = useState(false)
  const [showBeginnerFriendly, setShowBeginnerFriendly] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

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

  // Обновление URL при изменении фильтров (с debounce для поиска)
  const updateURL = useCallback(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('q', searchQuery)
    if (selectedGenre && selectedGenre !== 'Все жанры') params.set('genre', selectedGenre)
    if (showFreeOnly) params.set('free', 'true')
    if (showBeginnerFriendly) params.set('beginner', 'true')

    const newUrl = params.toString() ? `/?${params.toString()}` : '/'
    router.replace(newUrl, { scroll: false })
  }, [searchQuery, selectedGenre, showFreeOnly, showBeginnerFriendly, router])

  // Debounce для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, updateURL])

  // Немедленное обновление для фильтров
  useEffect(() => {
    updateURL()
  }, [selectedGenre, showFreeOnly, showBeginnerFriendly, updateURL])

  const genres = ["Все жанры", "Хоррор", "Приключения", "Эпик", "Фэнтези", "Научная фантастика"]

  const handleGenreClick = (genre: string) => {
    if (genre === 'Все жанры') {
      setSelectedGenre(null)
    } else {
      setSelectedGenre(genre === selectedGenre ? null : genre)
    }
  }

  const handleFreeClick = () => {
    setShowFreeOnly(!showFreeOnly)
  }

  const handleBeginnerClick = () => {
    setShowBeginnerFriendly(!showBeginnerFriendly)
  }

  return (
    <section className="border-b border-border bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="Поиск по названию, жанру или мастеру..." 
            className="pl-12 h-12 text-base" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {genres.map((genre) => (
            <Badge
              key={genre}
              variant={selectedGenre === genre ? "secondary" : "outline"}
              className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
              onClick={() => handleGenreClick(genre)}
            >
              {genre}
            </Badge>
          ))}
          <Badge
            variant={showFreeOnly ? "secondary" : "outline"}
            className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
            onClick={handleFreeClick}
          >
            Бесплатно
          </Badge>
          <Badge
            variant={showBeginnerFriendly ? "secondary" : "outline"}
            className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
            onClick={handleBeginnerClick}
          >
            Для новичков
          </Badge>
        </div>
      </div>
    </section>
  )
}


