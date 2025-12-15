'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Game } from '@/lib/supabase/types'
import { ImageUpload } from '@/components/image-upload'

export type GameFormData = {
  title: string
  description: string
  system: string
  format: 'one-shot' | 'campaign'
  seats_total: number
  price_rub?: number
  genre?: string
  platform?: string
  image_url?: string
  imageFile?: File | null
  game_time?: string
  game_date?: string
}

interface GameFormProps {
  initialData?: Game
  onSubmit: (data: GameFormData) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

export function GameForm({ initialData, onSubmit, isLoading: externalIsLoading = false, submitLabel = 'Создать игру' }: GameFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<GameFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    system: initialData?.system || 'D&D 5e',
    format: initialData?.format || 'one-shot',
    seats_total: initialData?.seats_total || 4,
    price_rub: initialData?.price_rub || 0,
    genre: initialData?.genre || '',
    platform: initialData?.platform || '',
    image_url: initialData?.image_url || '',
    imageFile: null,
    game_time: initialData?.game_time || '',
    game_date: initialData?.game_date || '',
  })
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null)

  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Валидация
    if (!formData.title.trim()) {
      setError('Название игры обязательно')
      return
    }
    if (formData.title.length < 2 || formData.title.length > 100) {
      setError('Название должно быть от 2 до 100 символов')
      return
    }
    if (!formData.description.trim()) {
      setError('Описание обязательно')
      return
    }
    if (formData.seats_total < 1 || formData.seats_total > 20) {
      setError('Количество мест должно быть от 1 до 20')
      return
    }

    setIsLoading(true)
    try {
      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Редактировать игру' : 'Создать новую игру'}</CardTitle>
        <CardDescription>Заполните информацию об игре</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="title">Название игры *</Label>
            <Input
              id="title"
              type="text"
              placeholder="Например: Потерянные руины Эльдории"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Описание *</Label>
            <textarea
              id="description"
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              placeholder="Опишите игру, сюжет, атмосферу..."
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="system">Система *</Label>
            <select
              id="system"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              required
              value={formData.system}
              onChange={(e) => setFormData({ ...formData, system: e.target.value })}
            >
              <option value="D&D 5e">D&D 5e</option>
              <option value="Pathfinder">Pathfinder</option>
              <option value="D&D 3.5">D&D 3.5</option>
              <option value="Call of Cthulhu">Call of Cthulhu</option>
              <option value="Другая">Другая</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label>Формат *</Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="format-one-shot"
                  name="format"
                  value="one-shot"
                  checked={formData.format === 'one-shot'}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value as 'one-shot' | 'campaign' })}
                  className="h-4 w-4"
                />
                <Label htmlFor="format-one-shot" className="font-normal cursor-pointer">
                  One-shot (одна сессия)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="format-campaign"
                  name="format"
                  value="campaign"
                  checked={formData.format === 'campaign'}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value as 'one-shot' | 'campaign' })}
                  className="h-4 w-4"
                />
                <Label htmlFor="format-campaign" className="font-normal cursor-pointer">
                  Кампания (несколько сессий)
                </Label>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="seats_total">Количество мест *</Label>
            <Input
              id="seats_total"
              type="number"
              min="1"
              max="20"
              required
              value={formData.seats_total}
              onChange={(e) => setFormData({ ...formData, seats_total: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price_rub">Стоимость (₽)</Label>
            <Input
              id="price_rub"
              type="number"
              min="0"
              placeholder="0"
              value={formData.price_rub || ''}
              onChange={(e) => setFormData({ ...formData, price_rub: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="genre">Жанр</Label>
            <Input
              id="genre"
              type="text"
              placeholder="Например: Приключения, Хоррор, Эпик"
              value={formData.genre || ''}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="platform">Платформа</Label>
            <Input
              id="platform"
              type="text"
              placeholder="Например: Discord, Roll20, Foundry VTT"
              value={formData.platform || ''}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="game_date">День проведения</Label>
              <Input
                id="game_date"
                type="date"
                value={formData.game_date || ''}
                onChange={(e) => setFormData({ ...formData, game_date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-muted-foreground">
                Выберите дату проведения игры
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="game_time">Время начала игры</Label>
              <Input
                id="game_time"
                type="time"
                value={formData.game_time || ''}
                onChange={(e) => setFormData({ ...formData, game_time: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Укажите время начала игры (например, 19:00)
              </p>
            </div>
          </div>

          <div className="grid gap-2">
            <ImageUpload
              value={imagePreview || undefined}
              onChange={(file, previewUrl) => {
                setFormData({ ...formData, imageFile: file, image_url: previewUrl || undefined })
                setImagePreview(previewUrl)
              }}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading || externalIsLoading}>
            {(isLoading || externalIsLoading) ? 'Сохранение...' : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

