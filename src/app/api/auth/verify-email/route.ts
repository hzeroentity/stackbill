import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyToken } from '@/lib/email-verification'

// Server-side Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ success: false, error: 'invalid_token' })
    }

    const tokenData = verifyToken(token)
    if (!tokenData) {
      return NextResponse.json({ success: false, error: 'invalid_token' })
    }

    // Verify the user exists and get current status
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(tokenData.userId)

    if (userError || !user.user) {
      return NextResponse.json({ success: false, error: 'user_not_found' })
    }

    // Check if email matches
    if (user.user.email !== tokenData.email) {
      return NextResponse.json({ success: false, error: 'email_mismatch' })
    }

    // Check if already confirmed
    if (user.user.email_confirmed_at) {
      return NextResponse.json({ success: true, error: 'already_confirmed' })
    }

    // Confirm the user's email
    const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(tokenData.userId, {
      email_confirm: true
    })

    if (confirmError) {
      console.error('Error confirming user:', confirmError)
      return NextResponse.json({ success: false, error: 'confirmation_failed' })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json({ success: false, error: 'server_error' })
  }
}

