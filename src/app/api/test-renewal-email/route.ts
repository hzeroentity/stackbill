import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendRenewalAlertEmail } from '@/lib/resend'
import { SubscriptionsService } from '@/lib/subscriptions'
import { Database } from '@/lib/database.types'

// Use service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)
// Untyped client for auth.users access
const supabaseUntyped = createClient(supabaseUrl, supabaseServiceKey)

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

    // For testing, use fallback email and name for non-UUID test users
    let userEmail = 'filippoaggio@gmail.com' // Test email for recording
    let userName = 'Filippo'

    // Only try to get user profile if userId is a valid UUID
    if (userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      try {
        const { data: profile } = await supabaseUntyped.auth.admin.getUserById(userId)
        userEmail = profile?.user?.email || userEmail
        userName = profile?.user?.user_metadata?.name || profile?.user?.user_metadata?.full_name || userName
      } catch (error) {
        console.log('Failed to get user profile, using fallback:', error)
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
          name: 'Supabase Pro',
          category: 'Cloud & Hosting',
          amount: 25.00,
          currency: 'USD',
          billing_period: 'monthly',
          renewal_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
          daysUntilRenewal: 3,
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