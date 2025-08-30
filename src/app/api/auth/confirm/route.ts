import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const token = searchParams.get('token') // This is the user ID
    const email = searchParams.get('email')

    if (!token || !email) {
      // Redirect to login with error
      return NextResponse.redirect(new URL('/login?error=invalid_link', request.url))
    }

    // Verify the user exists and is not already confirmed
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.getUserById(token)

    if (userError || !user.user) {
      console.error('Error fetching user:', userError)
      return NextResponse.redirect(new URL('/login?error=invalid_link', request.url))
    }

    // Check if email matches
    if (user.user.email !== decodeURIComponent(email)) {
      return NextResponse.redirect(new URL('/login?error=invalid_link', request.url))
    }

    // Check if already confirmed
    if (user.user.email_confirmed_at) {
      return NextResponse.redirect(new URL('/login?message=already_confirmed', request.url))
    }

    // Confirm the user's email
    const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(token, {
      email_confirm: true
    })

    if (confirmError) {
      console.error('Error confirming user:', confirmError)
      return NextResponse.redirect(new URL('/login?error=confirmation_failed', request.url))
    }

    // Successful confirmation - redirect to login with success message
    return NextResponse.redirect(new URL('/login?message=confirmed', request.url))

  } catch (error) {
    console.error('Confirmation API error:', error)
    return NextResponse.redirect(new URL('/login?error=server_error', request.url))
  }
}