import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'
import { PLAN_LIMITS } from '@/lib/plan-limits'
import { sendCancellationEmail } from '@/lib/resend'

//

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil'
})

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get current user subscription to cancel Stripe subscription
    const { data: userSubscription, error: userSubError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (userSubError && userSubError.code !== 'PGRST116') {
      console.error('Error fetching user subscription:', userSubError)
      return NextResponse.json({ error: 'Failed to fetch user subscription' }, { status: 500 })
    }

    // Cancel Stripe subscription if it exists
    if (userSubscription?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(userSubscription.stripe_subscription_id)
      } catch (stripeError) {
        console.error('Error canceling Stripe subscription:', stripeError)
        // Continue with downgrade even if Stripe cancellation fails
      }
    }

    // Get excess subscriptions (most recent first, then delete excess)
    const freeSubLimit = PLAN_LIMITS.free.subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false }) // Most recent first
      .limit(100) // Safety limit

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError)
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    // Delete excess subscriptions
    if (subscriptions && subscriptions.length > freeSubLimit) {
      const excessSubs = subscriptions.slice(freeSubLimit) // Keep first N, delete rest
      const excessSubIds = excessSubs.map(sub => sub.id)
      
      const { error: deleteSubsError } = await supabase
        .from('subscriptions')
        .delete()
        .in('id', excessSubIds)

      if (deleteSubsError) {
        console.error('Error deleting excess subscriptions:', deleteSubsError)
        return NextResponse.json({ error: 'Failed to delete excess subscriptions' }, { status: 500 })
      }
    }

    // Get excess projects (most recent first, then delete excess)
    const freeProjectLimit = PLAN_LIMITS.free.projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) // Most recent first
      .limit(100) // Safety limit

    if (projectsError) {
      console.error('Error fetching projects:', projectsError)
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    // Delete excess projects
    if (projects && projects.length > freeProjectLimit) {
      const excessProjects = projects.slice(freeProjectLimit) // Keep first N, delete rest
      const excessProjectIds = excessProjects.map(project => project.id)
      
      const { error: deleteProjectsError } = await supabase
        .from('projects')
        .delete()
        .in('id', excessProjectIds)

      if (deleteProjectsError) {
        console.error('Error deleting excess projects:', deleteProjectsError)
        return NextResponse.json({ error: 'Failed to delete excess projects' }, { status: 500 })
      }

      // Delete any orphaned subscriptions (subscriptions with no project relationships left)
      try {
        // First, get all subscription IDs that still have project relationships
        const { data: linkedSubs, error: linkedError } = await supabase
          .from('subscription_projects')
          .select('subscription_id')

        if (!linkedError && linkedSubs) {
          const linkedSubIds = linkedSubs.map(sp => sp.subscription_id)

          // Then get all user's subscriptions that are NOT in the linked list
          const { data: allUserSubs, error: allSubsError } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('user_id', userId)

          if (!allSubsError && allUserSubs) {
            const orphanedSubIds = allUserSubs.filter(sub => !linkedSubIds.includes(sub.id)).map(sub => sub.id)

            // Delete orphaned subscriptions if any exist
            if (orphanedSubIds.length > 0) {
              const { error: deleteError } = await supabase
                .from('subscriptions')
                .delete()
                .in('id', orphanedSubIds)

              if (deleteError) {
                console.error('Error deleting orphaned subscriptions:', deleteError)
              }
            }
          }
        }
      } catch (error) {
        console.error('Error in orphaned subscription cleanup:', error)
        // Don't fail the entire operation for this
      }
    }

    // Update user subscription to free plan
    let updateError = null
    if (userSubscription) {
      // Update existing subscription
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          stripe_subscription_id: null,
          plan_type: 'free',
          status: 'active',
          current_period_start: null,
          current_period_end: null,
          canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
      updateError = error
    } else {
      // Insert new subscription record
      const { error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          stripe_customer_id: null,
          stripe_subscription_id: null,
          plan_type: 'free',
          status: 'active',
          current_period_start: null,
          current_period_end: null,
          canceled_at: new Date().toISOString()
        })
      updateError = error
    }

    if (updateError) {
      console.error('Error updating user subscription:', updateError)
      console.error('User subscription data:', userSubscription)
      console.error('Attempted upsert data:', {
        user_id: userId,
        stripe_customer_id: userSubscription?.stripe_customer_id || null,
        stripe_subscription_id: null,
        plan_type: 'free',
        status: 'active',
        current_period_start: null,
        current_period_end: null,
        canceled_at: new Date().toISOString(),
        created_at: userSubscription?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
    }

    // Send cancellation confirmation email
    try {
      // Get user email to send cancellation confirmation
      const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserById(userId)
      
      if (!getUserError && user?.email) {
        await sendCancellationEmail(user.email)
      }
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError)
      // Don't fail the downgrade if email fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Force downgrade completed successfully',
      deletedSubscriptions: Math.max(0, (subscriptions?.length || 0) - freeSubLimit),
      deletedProjects: Math.max(0, (projects?.length || 0) - freeProjectLimit)
    })

  } catch (error) {
    console.error('Force downgrade API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}