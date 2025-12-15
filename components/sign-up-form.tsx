'use client'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type UserRole = 'master' | 'player'

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [role, setRole] = useState<UserRole>('player')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?type=signup&next=/`,
          data: {
            role, // Store role in user metadata for server action
          },
        },
      })
      
      if (error) {
        console.error('Sign up error:', error)
        // Более понятные сообщения об ошибках
        if (error.message.includes('Invalid API key') || error.status === 401) {
          throw new Error('Ошибка конфигурации. Пожалуйста, обратитесь к администратору.')
        }
        if (error.message.includes('User already registered')) {
          throw new Error('Пользователь с таким email уже зарегистрирован')
        }
        if (error.message.includes('Password')) {
          throw new Error('Пароль слишком слабый. Используйте минимум 8 символов')
        }
        throw error
      }

      // Check if email confirmation is required
      // If session exists, user is immediately authenticated (no email confirmation)
      // If session is null, email confirmation is required
      if (data.session && data.user) {
        // User is immediately authenticated - create profile and redirect
        const user = data.user
        try {
          const response = await fetch('/auth/sign-up/actions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              role,
            }),
          })

          const result = await response.json()
          
          // Profile creation might be deferred, but user is authenticated
          if (result.deferred) {
            console.log('Profile creation deferred')
          }

          // User is authenticated - redirect to home
          // Note: /games/create will be created in Phase 2, redirecting to home for now
          router.push('/')
        } catch (profileError) {
          // If profile creation fails, still redirect (profile will be created later)
          console.warn('Profile creation will happen later:', profileError)
          router.push('/')
        }
      } else {
        // Email confirmation required - show success page
        // Try to create profile (will be created in confirm route if this fails)
        if (data.user) {
          const user = data.user
          try {
            await fetch('/auth/sign-up/actions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: user.id,
                role,
              }),
            })
          } catch (profileError) {
            // That's okay - profile will be created in confirm route
            console.log('Profile will be created after email confirmation')
          }
        }
        router.push('/auth/sign-up-success')
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Регистрация</CardTitle>
          <CardDescription>Создайте новый аккаунт</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@mail.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Пароль</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">Повторите пароль</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Выберите роль</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="role-player"
                      name="role"
                      value="player"
                      checked={role === 'player'}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="role-player" className="font-normal cursor-pointer">
                      Игрок
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="role-master"
                      name="role"
                      value="master"
                      checked={role === 'master'}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="role-master" className="font-normal cursor-pointer">
                      Мастер
                    </Label>
                  </div>
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Создание аккаунта...' : 'Зарегистрироваться'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Уже есть аккаунт?{' '}
              <Link href="/auth/login" className="underline underline-offset-4">
                Войти
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
