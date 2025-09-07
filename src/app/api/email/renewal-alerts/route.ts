import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendRenewalAlertEmail } from '@/lib/resend'
import { SubscriptionsService } from '@/lib/subscriptions'
import { EmailPreferencesService } from '@/lib/email-preferences'

interface UserData {
  user_id: string
  profiles: {
    email: string
    raw_user_meta_data?: {
      name?: string
      full_name?: string
    }
  }[]
}

export async function POST() {
  try {
    // Get all Pro users who have active subscriptions
    const { data: proUsers, error: usersError } = await supabase
      .from('user_subscriptions')
      .select(`
        user_id,
        profiles!inner(email, raw_user_meta_data)
      `)
      .eq('plan_type', 'pro')
      .eq('status', 'active')
    
    if (usersError) {
      console.error('Failed to fetch pro users:', usersError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    if (!proUsers || proUsers.length === 0) {
      return NextResponse.json({ message: 'No Pro users found' }, { status: 200 })
    }

    let emailsSent = 0
    const results: { userId: string; email: string; success: boolean; error?: string }[] = []

    // Process each Pro user
    for (const user of proUsers) {
      try {
        // Check if user should receive renewal alert emails
        const shouldSend = await EmailPreferencesService.shouldSendEmail(user.user_id, 'renewal_alert')
        if (!shouldSend) {
          results.push({
            userId: user.user_id,
            email: (user as UserData).profiles?.[0]?.email || 'unknown@email.com',
            success: true,
            error: 'Skipped - user preferences or anti-spam protection'
          })
          continue
        }

        // Get user's email preferences to know their preferred reminder days
        const emailPrefs = await EmailPreferencesService.getUserPreferences(user.user_id)
        const reminderDays = emailPrefs.renewal_reminder_days || [7, 3, 1]

        // Get user's subscriptions
        const { data: subscriptions, error: subsError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.user_id)
          .eq('is_active', true)
          .order('renewal_date', { ascending: true })

        if (subsError) {
          console.error(`Failed to fetch subscriptions for user ${user.user_id}:`, subsError)
          results.push({
            userId: user.user_id,
            email: (user as UserData).profiles?.[0]?.email || 'unknown@email.com',
            success: false,
            error: 'Failed to fetch subscriptions'
          })
          continue
        }

        if (!subscriptions || subscriptions.length === 0) {
          results.push({
            userId: user.user_id,
            email: (user as UserData).profiles?.[0]?.email || 'unknown@email.com',
            success: true,
            error: 'No subscriptions found'
          })
          continue
        }

        // Find upcoming renewals based on user's preferred reminder days (use the maximum)
        const maxReminderDays = Math.max(...reminderDays, 7) // At least 7 days
        const upcomingRenewals = SubscriptionsService.getUpcomingRenewals(subscriptions, maxReminderDays)

        if (upcomingRenewals.length === 0) {
          results.push({
            userId: user.user_id,
            email: (user as UserData).profiles?.[0]?.email || 'unknown@email.com',
            success: true,
            error: 'No upcoming renewals'
          })
          continue
        }

        // Calculate days until renewal for each subscription and filter by user's preferred reminder days
        const today = new Date()
        const renewalsWithDays = upcomingRenewals
          .map(sub => {
            const renewalDate = new Date(sub.renewal_date)
            const diffTime = renewalDate.getTime() - today.getTime()
            const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
            return {
              ...sub,
              daysUntilRenewal: diffDays
            }
          })
          .filter(sub => {
            // Only send emails for renewals that match the user's preferred reminder days
            return reminderDays.includes(sub.daysUntilRenewal)
          })

        if (renewalsWithDays.length === 0) {
          results.push({
            userId: user.user_id,
            email: (user as UserData).profiles?.[0]?.email || 'unknown@email.com',
            success: true,
            error: 'No renewals matching user preferred reminder days'
          })
          continue
        }

        // Extract user name from metadata
        const userName = (user as UserData).profiles?.[0]?.raw_user_meta_data?.name || 
                        (user as UserData).profiles?.[0]?.raw_user_meta_data?.full_name ||
                        (user as UserData).profiles?.[0]?.email || 'unknown@email.com'?.split('@')[0]

        // Send renewal alert email
        const emailResult = await sendRenewalAlertEmail(
          (user as UserData).profiles?.[0]?.email || 'unknown@email.com',
          renewalsWithDays,
          userName
        )

        if (emailResult.success) {
          emailsSent++
          
          // Update last sent timestamp for anti-spam tracking
          await EmailPreferencesService.updateLastSent(user.user_id, 'renewal_alert')
          
          results.push({
            userId: user.user_id,
            email: (user as UserData).profiles?.[0]?.email || 'unknown@email.com',
            success: true
          })
        } else {
          results.push({
            userId: user.user_id,
            email: (user as UserData).profiles?.[0]?.email || 'unknown@email.com',
            success: false,
            error: emailResult.error?.toString() || 'Unknown error'
          })
        }

      } catch (error) {
        console.error(`Error processing user ${user.user_id}:`, error)
        results.push({
          userId: user.user_id,
          email: (user as UserData).profiles?.[0]?.email || 'unknown@email.com',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      message: `Renewal alerts processing completed`,
      emailsSent,
      totalUsers: proUsers.length,
      results
    })

  } catch (error) {
    console.error('Error in renewal alerts endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}