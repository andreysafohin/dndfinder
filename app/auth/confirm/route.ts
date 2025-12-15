import { createClient } from '@/lib/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const _next = searchParams.get('next')
  const next = _next?.startsWith('/') ? _next : '/'

  if (token_hash && type) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error && data.user) {
      // Create master/player profile if role is set in metadata
      const role = data.user.user_metadata?.role as 'master' | 'player' | undefined
      
      if (role) {
        try {
          // Use database function to create profile (idempotent, uses on conflict do nothing)
          const { error: profileError } = await supabase.rpc('create_role_profile', {
            p_user_id: data.user.id,
            p_role: role,
          })

          if (profileError) {
            // Log error but don't block the redirect
            console.error('Error creating role profile:', profileError)
          }
        } catch (profileError) {
          // Log error but don't block the redirect
          console.error('Error creating role profile:', profileError)
        }
      }

      // Redirect based on role if specified, otherwise use next parameter
      // Note: /games/create will be created in Phase 2, redirecting to home for now
      if (role === 'player' || role === 'master') {
        redirect('/')
      } else {
        redirect(next)
      }
    } else {
      // redirect the user to an error page with some instructions
      redirect(`/auth/error?error=${error?.message}`)
    }
  }

  // redirect the user to an error page with some instructions
  redirect(`/auth/error?error=No token hash or type`)
}
