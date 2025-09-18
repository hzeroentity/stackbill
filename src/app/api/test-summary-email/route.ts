import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendMonthlySummaryEmail } from '@/lib/resend'
import { SubscriptionsService } from '@/lib/subscriptions'
import { Currency } from '@/lib/currency-preferences'
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

    // For testing, use fallback email for non-UUID test users
    let userEmail = 'filippoaggio@gmail.com' // Test email for recording

    // Only try to get user profile if userId is a valid UUID
    if (userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      try {
        const { data: profile } = await supabaseUntyped.auth.admin.getUserById(userId)
        userEmail = profile?.user?.email || userEmail
      } catch (error) {
        console.log('Failed to get user profile, using fallback:', error)
      }
    }

    // Get current month and year
    const now = new Date()
    const currentMonth = now.toLocaleString('en-US', { month: 'long' })
    const currentYear = now.getFullYear()

    // Get user's subscriptions (skip for test users)
    let subscriptions = null
    let subsError = null
    
    if (userId !== 'test123' && userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      const result = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('name', { ascending: true })
      
      subscriptions = result.data
      subsError = result.error
      
      if (subsError) {
        console.error('Failed to fetch subscriptions:', subsError)
        return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
      }
    }


    // Force mock data for test users or if no subscriptions
    if (!subscriptions || subscriptions.length === 0 || userId === 'test123') {
      // Create mock summary data for testing with realistic dev subscriptions
      const mockSummaryData = {
        monthlyTotal: 155.94,
        yearlyTotal: 1871.28,
        currency: 'USD' as const,
        subscriptionCount: 9,
        categoryBreakdown: {
          'Cloud & Hosting': 65.00,
          'Developer Tools': 30.00,
          'AI Tools & LLMs': 20.00,
          'Analytics & Monitoring': 15.00,
          'Email & Communication': 10.00,
          'Design & Assets': 15.94
        },
        topSubscriptions: [
          { name: 'Vercel Pro', monthlyAmount: 20.00, currency: 'USD' },
          { name: 'Supabase Pro', monthlyAmount: 25.00, currency: 'USD' },
          { name: 'ChatGPT Plus', monthlyAmount: 20.00, currency: 'USD' },
          { name: 'Vercel Bandwidth', monthlyAmount: 20.00, currency: 'USD' },
          { name: 'PostHog Cloud', monthlyAmount: 15.00, currency: 'USD' },
          { name: 'Resend Pro', monthlyAmount: 10.00, currency: 'USD' },
          { name: 'Figma Professional', monthlyAmount: 15.00, currency: 'USD' },
          { name: 'GitHub Copilot', monthlyAmount: 10.00, currency: 'USD' },
          { name: 'LinearB', monthlyAmount: 19.94, currency: 'USD' }
        ],
        month: currentMonth,
        year: currentYear
      }

      // Send test monthly summary email
      const emailResult = await sendMonthlySummaryEmail(
        userEmail,
        mockSummaryData
      )

      return NextResponse.json({
        message: 'Test monthly summary email sent with mock data',
        success: emailResult.success,
        userPlan: // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (subscription as any)?.plan_type || 'free',
        mockData: mockSummaryData,
        error: emailResult.error || null
      })
    }

    // Get user's preferred currency (fallback to USD for testing)
    const userCurrency: Currency = 'USD' // TODO: Get from user preferences

    // Calculate monthly and yearly totals with currency conversion
    const monthlyTotal = await SubscriptionsService.calculateMonthlyTotalWithConversion(
      subscriptions, 
      userCurrency
    )
    const yearlyTotal = await SubscriptionsService.calculateYearlyTotalWithConversion(
      subscriptions, 
      userCurrency
    )

    // Calculate category breakdown
    const categoryBreakdown = await SubscriptionsService.calculateCategorySpendingWithConversion(
      subscriptions,
      userCurrency
    )

    // Get top subscriptions by monthly amount
    const topSubscriptions = await Promise.all(
      subscriptions
        .slice(0, 10) // Limit to top 10 for performance
        .map(async (sub) => {
          const monthlyAmount = await SubscriptionsService.convertSubscriptionMonthlyAmount(sub, userCurrency)
          return {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name: (sub as any).name,
            monthlyAmount,
            currency: userCurrency
          }
        })
    )
    
    // Sort by monthly amount descending
    topSubscriptions.sort((a, b) => b.monthlyAmount - a.monthlyAmount)

    // Prepare summary data
    const summaryData = {
      monthlyTotal,
      yearlyTotal,
      currency: userCurrency,
      subscriptionCount: subscriptions.length,
      categoryBreakdown,
      topSubscriptions: topSubscriptions.slice(0, 5), // Top 5 for email
      month: currentMonth,
      year: currentYear
    }

    // Send monthly summary email
    const emailResult = await sendMonthlySummaryEmail(
      userEmail,
      summaryData
    )

    return NextResponse.json({
      message: 'Test monthly summary email sent',
      success: emailResult.success,
      userPlan: // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (subscription as any)?.plan_type || 'free',
      summaryData: {
        monthlyTotal: summaryData.monthlyTotal,
        yearlyTotal: summaryData.yearlyTotal,
        currency: summaryData.currency,
        subscriptionCount: summaryData.subscriptionCount,
        topCategories: Object.entries(summaryData.categoryBreakdown)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([name, amount]) => ({ name, amount }))
      },
      error: emailResult.error || null
    })

  } catch (error) {
    console.error('Error in test summary email endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}