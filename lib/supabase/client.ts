import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  // Поддерживаем оба варианта: publishable key (новый) и anon key (legacy)
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY || 
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  // Детальная диагностика
  if (!supabaseUrl) {
    const error = 'NEXT_PUBLIC_SUPABASE_URL is not set. Please set it in Vercel environment variables.'
    console.error(error)
    console.error('Expected format: https://your-project.supabase.co')
  }

  if (!supabaseKey) {
    const error = 'Supabase API key is not set. Please set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables.'
    console.error(error)
    console.error('You can find your keys in Supabase Dashboard → Settings → API')
    console.error('Use either:')
    console.error('  - Legacy anon key (starts with "eyJ")')
    console.error('  - Publishable key (starts with "sb_publishable_")')
  }

  if (supabaseKey && !supabaseKey.startsWith('eyJ') && !supabaseKey.startsWith('sb_publishable_')) {
    console.error('⚠️ Supabase key format looks incorrect!')
    console.error('Key should start with:')
    console.error('  - "eyJ" for legacy anon key')
    console.error('  - "sb_publishable_" for publishable key')
    console.error('Current key starts with:', supabaseKey.substring(0, 20) + '...')
  }

  if (!supabaseUrl || !supabaseKey) {
    // В продакшене не бросаем ошибку, чтобы не ломать приложение, но логируем
    if (process.env.NODE_ENV === 'development') {
      throw new Error('Supabase environment variables are not configured. Check console for details.')
    }
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
