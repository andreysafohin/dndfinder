'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cancelBooking } from './actions'

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    if (!confirm('Вы уверены, что хотите отменить заявку?')) {
      return
    }

    setIsLoading(true)
    try {
      await cancelBooking(bookingId)
      router.refresh()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Ошибка при отмене заявки')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="icon"
      onClick={handleCancel}
      disabled={isLoading}
      title="Отменить заявку"
    >
      <X className="h-4 w-4" />
    </Button>
  )
}

