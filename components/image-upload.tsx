'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  value?: string
  onChange: (file: File | null, previewUrl: string | null) => void
  error?: string
}

export function ImageUpload({ value, onChange, error }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Валидация типа файла
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
    if (!allowedTypes.includes(file.type)) {
      alert('Недопустимый тип файла. Разрешены: JPEG, PNG, WebP, AVIF')
      return
    }

    // Валидация размера (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      alert('Размер файла превышает 10MB')
      return
    }

    setSelectedFile(file)

    // Создаем preview
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      setPreview(result)
      onChange(file, result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setPreview(null)
    onChange(null, null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    if (url) {
      setPreview(url)
      setSelectedFile(null)
      onChange(null, url)
    } else {
      handleRemove()
    }
  }

  return (
    <div className="space-y-2">
      <Label>Изображение игры</Label>
      
      {/* Preview */}
      {preview && (
        <div className="relative w-full h-48 rounded-md border border-input overflow-hidden bg-muted">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload button */}
      {!preview && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Загрузить изображение
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={handleFileSelect}
          />
          <span className="text-sm text-muted-foreground">или</span>
        </div>
      )}

      {/* URL input */}
      <div>
        <input
          type="url"
          placeholder="https://example.com/image.jpg"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          value={preview && !selectedFile ? preview : ''}
          onChange={handleUrlChange}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Загрузите файл или введите URL изображения
        </p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

