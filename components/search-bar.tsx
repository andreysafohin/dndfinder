'use client'

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { useState } from "react"

export function SearchBar() {
  const [activeFilter, setActiveFilter] = useState(0)
  const genres = ["Все жанры", "Хоррор", "Приключения", "Эпик", "Для новичков", "Бесплатно"]

  return (
    <section className="border-b border-border bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input type="text" placeholder="Поиск по названию, жанру или мастеру..." className="pl-12 h-12 text-base" />
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {genres.map((genre, index) => (
            <Badge
              key={index}
              variant={index === activeFilter ? "secondary" : "outline"}
              className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
              onClick={() => setActiveFilter(index)}
            >
              {genre}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  )
}

