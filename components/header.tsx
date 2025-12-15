'use client'

import { Button } from "@/components/ui/button"
import { Dices } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { LogoutButton } from "@/components/logout-button"

export function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
          console.error('Auth error:', error)
          return
        }
        setIsAuthenticated(!!user)
        setUserEmail(user?.email || null)
      } catch (error) {
        console.error('Failed to check auth:', error)
        setIsAuthenticated(false)
        setUserEmail(null)
      }
    }
    checkAuth()

    try {
      const supabase = createClient()
      const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
        checkAuth()
      })

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error('Failed to set up auth listener:', error)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary p-2">
            <Dices className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">DND Finder</h1>
            <p className="text-sm text-muted-foreground">найди свой образ и команду!</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground">{userEmail}</span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link href="/auth/login">Войти</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">Регистрация</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

