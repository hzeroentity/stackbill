import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { userSubscriptionService } from '@/lib/user-subscription-service'
import type { Database } from '@/lib/database.types'

export async function GET(request: NextRequest) {
  try {
    // Get user from Supabase using SSR client for auth
    const cookieStore = await cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('User subscription API - Auth check:', { user: !!user, error: authError })

    if (authError || !user) {
      console.error('User subscription API - Auth failed:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get or create user subscription
    try {
      const userSubscription = await userSubscriptionService.ensureUserSubscription(user.id)
      return NextResponse.json({ userSubscription })
    } catch (serviceError) {
      console.warn('User subscription service error, returning default:', serviceError)
      // Return default free subscription if service fails
      const defaultUserSubscription = {
        id: 'temp',
        user_id: user.id,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        plan_type: 'free' as const,
        status: 'active' as const,
        current_period_start: null,
        current_period_end: null,
        canceled_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return NextResponse.json({ userSubscription: defaultUserSubscription })
    }

  } catch (error) {
    console.error('User subscription API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}