import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendMonthlySummaryEmail } from '@/lib/resend'
import { SubscriptionsService } from '@/lib/subscriptions'
import { Currency } from '@/lib/currency-preferences'
import { EmailPreferencesService } from '@/lib/email-preferences'
//

export async function POST() {
  try {
    // Get current month and year
    const now = new Date()
    const currentMonth = now.toLocaleString('en-US', { month: 'long' })
    const currentYear = now.getFullYear()

    // Get all Pro users who have active subscriptions
    const { data: proUserSubscriptions, error: usersError } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('plan_type', 'pro')
      .eq('status', 'active')
    
    if (usersError) {
      console.error('Failed to fetch pro users:', usersError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    if (!proUserSubscriptions || proUserSubscriptions.length === 0) {
      return NextResponse.json({ message: 'No Pro users found' }, { status: 200 })
    }

    let emailsSent = 0
    const results: { userId: string; email: string; success: boolean; error?: string }[] = []

    // Process each Pro user
    for (const userSub of proUserSubscriptions) {
      try {
        // Get user details from auth
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userSub.user_id)
        if (userError || !userData.user) {
          results.push({
            userId: userSub.user_id,
            email: 'unknown@email.com',
            success: false,
            error: 'Failed to fetch user details'
          })
          continue
        }

        const user = userData.user

        // Check if user should receive monthly summary emails
        const shouldSend = await EmailPreferencesService.shouldSendEmail(userSub.user_id, 'monthly_summary')
        if (!shouldSend) {
          results.push({
            userId: userSub.user_id,
            email: user.email || 'unknown@email.com',
            success: true,
            error: 'Skipped - user preferences or anti-spam protection'
          })
          continue
        }

        // Get user's subscriptions
        const { data: subscriptions, error: subsError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userSub.user_id)
          .eq('is_active', true)
          .order('name', { ascending: true })

        if (subsError) {
          console.error(`Failed to fetch subscriptions for user ${userSub.user_id}:`, subsError)
          results.push({
            userId: userSub.user_id,
            email: user.email || 'unknown@email.com',
            success: false,
            error: 'Failed to fetch subscriptions'
          })
          continue
        }

        if (!subscriptions || subscriptions.length === 0) {
          results.push({
            userId: userSub.user_id,
            email: user.email || 'unknown@email.com',
            success: true,
            error: 'No subscriptions found'
          })
          continue
        }

        // Get user's preferred currency (fallback to USD)
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
          user.email || 'unknown@email.com',
          summaryData
        )

        if (emailResult.success) {
          emailsSent++
          
          // Update last sent timestamp for anti-spam tracking
          await EmailPreferencesService.updateLastSent(userSub.user_id, 'monthly_summary')
          
          results.push({
            userId: userSub.user_id,
            email: user.email || 'unknown@email.com',
            success: true
          })
        } else {
          results.push({
            userId: userSub.user_id,
            email: user.email || 'unknown@email.com',
            success: false,
            error: emailResult.error?.toString() || 'Unknown error'
          })
        }

      } catch (error) {
        console.error(`Error processing user ${userSub.user_id}:`, error)
        results.push({
          userId: userSub.user_id,
          email: 'unknown@email.com',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      message: `Monthly summary emails processing completed for ${currentMonth} ${currentYear}`,
      emailsSent,
      totalUsers: proUserSubscriptions.length,
      results
    })

  } catch (error) {
    console.error('Error in monthly summary endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}