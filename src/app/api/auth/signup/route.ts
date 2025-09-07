import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendConfirmationEmail } from '@/lib/resend'
import { createVerificationToken } from '@/lib/email-verification'

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

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    const processedEmail = email.trim().toLowerCase()

    // Create user with Supabase Auth (but with email confirmation disabled temporarily)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: processedEmail,
      password,
      email_confirm: false // We'll handle confirmation manually
    })

    if (authError) {
      console.error('Supabase auth error:', authError)
      
      // Handle specific auth errors
      if (authError.message.includes('already been registered') || authError.code === 'email_exists') {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in instead.' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to create account. Please try again.' },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      )
    }

    // Generate secure confirmation token
    const verificationToken = createVerificationToken(authData.user.id, processedEmail)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const confirmationUrl = `${baseUrl}/confirm-email?token=${verificationToken}`

    // Send confirmation email via Resend
    const emailResult = await sendConfirmationEmail(processedEmail, confirmationUrl)

    if (!emailResult.success) {
      console.error('Failed to send confirmation email:', emailResult.error)
      
      // Clean up the created user if email fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json(
        { error: 'Failed to send confirmation email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Account created! Please check your email for the confirmation link.',
      success: true
    })

  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}