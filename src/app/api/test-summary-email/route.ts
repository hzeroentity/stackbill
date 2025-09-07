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
    let userEmail = profile?.email || 'test@example.com' // Hardcoded for testing
    let userName = profile?.raw_user_meta_data?.name || profile?.raw_user_meta_data?.full_name
    
    // Only try auth lookup if userId looks like a UUID and email isn't hardcoded
    if (!userEmail || (userEmail === 'test@example.com' && userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i))) {
      try {
        const { data: authUser } = await supabase.auth.admin.getUserById(userId)
        if (authUser.user?.email) {
          userEmail = authUser.user.email
          userName = authUser.user?.user_metadata?.name || authUser.user?.user_metadata?.full_name
        }
      } catch (error) {
        // Ignore UUID validation errors for test data
        console.log('Skipping auth lookup for test userId:', userId)
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

    // Use fallback name if not already set
    if (!userName) {
      userName = userEmail.split('@')[0]
    }

    // Force mock data for test users or if no subscriptions
    if (!subscriptions || subscriptions.length === 0 || userId === 'test123') {
      // Create mock summary data for testing
      const mockSummaryData = {
        monthlyTotal: 127.45,
        yearlyTotal: 1529.40,
        currency: 'USD' as const,
        subscriptionCount: 8,
        categoryBreakdown: {
          'Developer Tools': 45.00,
          'Media & Content': 25.98,
          'AI Tools & LLMs': 20.00,
          'Cloud & Hosting': 19.99,
          'Productivity': 16.48
        },
        topSubscriptions: [
          { name: 'GitHub Copilot', monthlyAmount: 20.00, currency: 'USD' },
          { name: 'Vercel Pro', monthlyAmount: 20.00, currency: 'USD' },
          { name: 'ChatGPT Plus', monthlyAmount: 20.00, currency: 'USD' },
          { name: 'Netflix', monthlyAmount: 15.99, currency: 'USD' },
          { name: 'Spotify Premium', monthlyAmount: 9.99, currency: 'USD' }
        ],
        month: currentMonth,
        year: currentYear
      }

      // Send test monthly summary email
      const emailResult = await sendMonthlySummaryEmail(
        userEmail,
        mockSummaryData,
        userName
      )

      return NextResponse.json({
        message: 'Test monthly summary email sent with mock data',
        success: emailResult.success,
        userPlan: subscription?.plan_type || 'free',
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
            name: sub.name,
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
      summaryData,
      userName
    )

    return NextResponse.json({
      message: 'Test monthly summary email sent',
      success: emailResult.success,
      userPlan: subscription?.plan_type || 'free',
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