'use client'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Clock, DollarSign } from "lucide-react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export interface Campaign {
  title: string
  genre: string
  players: string
  price: string
  master: string
  experience: string
  schedule: string
  description: string
  image: string
}

interface CampaignCardProps {
  campaign: Campaign
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const router = useRouter()

  const handleJoin = async () => {
    try {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        router.push('/auth/login')
        return
      }
      
      // TODO: Реализовать логику вступления в партию
      alert('Функция вступления в партию будет реализована позже')
    } catch (error) {
      console.error('Failed to check auth:', error)
      router.push('/auth/login')
    }
  }

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow overflow-hidden">
      <div className="relative w-full h-48 overflow-hidden bg-muted">
        <Image 
          src={campaign.image || "/placeholder.svg"} 
          alt={campaign.title} 
          fill 
          className="object-cover" 
        />
      </div>

      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-xl text-balance">{campaign.title}</CardTitle>
          <Badge variant="secondary">{campaign.genre}</Badge>
        </div>
        <CardDescription className="text-pretty">{campaign.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Игроки:</span>
            </div>
            <span className="font-medium text-foreground">{campaign.players}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Расписание:</span>
            </div>
            <span className="font-medium text-foreground">{campaign.schedule}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Стоимость:</span>
            </div>
            <span className="font-bold text-foreground text-base">{campaign.price}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Мастер:</span>
            <span className="font-medium text-foreground">{campaign.master}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">Уровень:</span>
            <Badge variant="outline" className="text-xs">
              {campaign.experience}
            </Badge>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full" size="lg" onClick={handleJoin}>
          Вступить в партию
        </Button>
      </CardFooter>
    </Card>
  )
}

