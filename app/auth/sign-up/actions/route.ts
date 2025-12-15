import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId, role } = await request.json()

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      )
    }

    if (role !== 'master' && role !== 'player') {
      return NextResponse.json(
        { error: 'Invalid role. Must be "master" or "player"' },
        { status: 400 }
      )
    }

    // Validate userId format (should be UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }

    // Try to create profile using direct REST API call (bypasses auth session requirement)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY || ''
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    // Use direct REST API call to bypass auth session requirement
    // The function uses security definer, so it will work with anon key
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/create_role_profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          p_user_id: userId,
          p_role: role,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.warn('Profile creation via REST API failed (will be created after email confirmation):', errorText)
        // Don't fail - profile will be created in confirm route after email verification
        return NextResponse.json({ 
          success: true, 
          deferred: true,
          message: 'Profile creation will happen after email confirmation' 
        })
      }
    } catch (error) {
      console.warn('Error calling create_role_profile (will be created after email confirmation):', error)
      // Don't fail - profile will be created in confirm route
      return NextResponse.json({ 
        success: true, 
        deferred: true,
        message: 'Profile creation will happen after email confirmation' 
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in profile creation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

