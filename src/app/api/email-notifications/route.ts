import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { email, source = 'team-plan', metadata = {} } = await request.json()

    // Basic validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' },
        { status: 400 }
      )
    }

    // Validate source
    const validSources = ['team-plan', 'newsletter', 'beta-features']
    if (!validSources.includes(source)) {
      return NextResponse.json(
        { error: 'Invalid source provided' },
        { status: 400 }
      )
    }

    // Check if this email + source combination already exists
    const { data: existing } = await supabase
      .from('email_notifications')
      .select('id')
      .eq('email', email.toLowerCase())
      .eq('source', source)
      .single()

    if (existing) {
      return NextResponse.json(
        { message: 'Email already registered for this notification' },
        { status: 200 }
      )
    }

    // Insert the email notification
    const { data, error } = await supabase
      .from('email_notifications')
      .insert({
        email: email.toLowerCase(),
        source,
        metadata
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to save email notification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Successfully registered for notifications',
      id: data.id
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}