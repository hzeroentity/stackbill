import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendRenewalAlertEmail } from '@/lib/resend'
import { SubscriptionsService } from '@/lib/subscriptions'
import { Database } from '@/lib/database.types'

// Use service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    // Get userId from request body
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if user is Pro (optional check - can remove for testing)
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('plan_type')
      .eq('user_id', userId)
      .single()

    // Get user's profile for email and name
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, raw_user_meta_data')
      .eq('id', userId)
      .single()

    // For testing, use a fallback email if profile email not found
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let userEmail = (profile as any)?.email || 'test@example.com' // Hardcoded for testing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let userName = (profile as any)?.raw_user_meta_data?.name || (profile as any)?.raw_user_meta_data?.full_name
    
    // Only try auth lookup if userId looks like a UUID and email isn't hardcoded
    if (!userEmail || (userEmail === 'test@example.com' && userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i))) {
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(userId)
        if (authUser.user?.email) {
          userEmail = authUser.user.email
          userName = authUser.user?.user_metadata?.name || authUser.user?.user_metadata?.full_name
        }
      } catch {
        // Ignore UUID validation errors for test data
        console.log('Skipping auth lookup for test userId:', userId)
      }
    }

    // Get user's subscriptions (skip for test users)
    let subscriptions = null
    let subsError = null
    
    if (userId !== 'test123' && userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      const result = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('renewal_date', { ascending: true })
      
      subscriptions = result.data
      subsError = result.error
      
      if (subsError) {
        console.error('Failed to fetch subscriptions:', subsError)
        return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
      }
    }

    // Always send mock data for testing (even if user has subscriptions)
    if (!subscriptions || subscriptions.length === 0 || true) {
      // Create mock renewal data for testing
      const mockRenewals = [
        {
          id: 'test-1',
          name: 'Netflix',
          category: 'Media & Content',
          amount: 15.99,
          currency: 'USD',
          billing_period: 'monthly',
          renewal_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
          daysUntilRenewal: 2,
          is_active: true,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'test-2',
          name: 'ChatGPT Plus',
          category: 'AI Tools & LLMs',
          amount: 20.00,
          currency: 'USD',
          billing_period: 'monthly',
          renewal_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          daysUntilRenewal: 7,
          is_active: true,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      // Use fallback name if not already set
      if (!userName) {
        userName = userEmail.split('@')[0]
      }

      // Send test renewal alert email
      const emailResult = await sendRenewalAlertEmail(
        userEmail,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockRenewals as any,
        userName
      )

      return NextResponse.json({
        message: 'Test renewal alert email sent with mock data',
        success: emailResult.success,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userPlan: (subscription as any)?.plan_type || 'free',
        renewalCount: mockRenewals.length,
        error: emailResult.error || null
      })
    }

    // Find actual upcoming renewals (7 days or less)
    const upcomingRenewals = SubscriptionsService.getUpcomingRenewals(subscriptions, 7)

    if (upcomingRenewals.length === 0) {
      return NextResponse.json({
        message: 'No upcoming renewals found',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userPlan: (subscription as any)?.plan_type || 'free',
        totalSubscriptions: subscriptions.length
      })
    }

    // Calculate days until renewal for each subscription
    const today = new Date()
    const renewalsWithDays = upcomingRenewals.map(sub => {
      const renewalDate = new Date(sub.renewal_date)
      const diffTime = renewalDate.getTime() - today.getTime()
      const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
      return {
        ...sub,
        daysUntilRenewal: diffDays
      }
    })

    // Use fallback name if not already set from profile lookup above
    if (!userName) {
      userName = userEmail.split('@')[0]
    }

    // Send renewal alert email
    const emailResult = await sendRenewalAlertEmail(
      userEmail,
      renewalsWithDays,
      userName
    )

    return NextResponse.json({
      message: 'Test renewal alert email sent',
      success: emailResult.success,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userPlan: (subscription as any)?.plan_type || 'free',
      renewalCount: renewalsWithDays.length,
      renewals: renewalsWithDays.map(r => ({
        name: r.name,
        daysUntilRenewal: r.daysUntilRenewal,
        amount: r.amount,
        currency: r.currency
      })),
      error: emailResult.error || null
    })

  } catch (error) {
    console.error('Error in test renewal email endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}