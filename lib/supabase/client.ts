import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  // Поддерживаем оба варианта: publishable key (новый) и anon key (legacy)
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY || 
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseKey) {
    const error = 'Supabase environment variables are not set. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)'
    console.error(error)
    // В продакшене не бросаем ошибку, чтобы не ломать приложение
    if (process.env.NODE_ENV === 'development') {
      throw new Error(error)
    }
  }

  if (supabaseKey && !supabaseKey.startsWith('eyJ') && !supabaseKey.startsWith('sb_publishable_')) {
    console.warn('Supabase key format looks incorrect. Should start with "eyJ" (anon key) or "sb_publishable_" (publishable key)')
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
