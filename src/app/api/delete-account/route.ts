import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'
import { userSubscriptionService } from '@/lib/user-subscription-service'
import { sendGoodbyeEmail } from '@/lib/resend'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil'
})

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await request.json()
    
    if (userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`Starting account deletion for user: ${userId}`)

    // Step 1: Get user info for goodbye email
    const userEmail = user.email
    const userName = user.user_metadata?.full_name || user.user_metadata?.name

    // Step 2: Cancel Stripe subscription if exists
    try {
      const userSubscription = await userSubscriptionService.getUserSubscription(userId)
      
      if (userSubscription?.stripe_subscription_id) {
        console.log(`Cancelling Stripe subscription: ${userSubscription.stripe_subscription_id}`)
        await stripe.subscriptions.cancel(userSubscription.stripe_subscription_id)
        console.log('Stripe subscription cancelled successfully')
      }
    } catch (stripeError) {
      console.error('Error cancelling Stripe subscription:', stripeError)
      // Continue with deletion even if Stripe cancellation fails
    }

    // Step 3: Delete user data from database
    // Delete in the correct order to avoid foreign key constraints
    
    // Delete subscription-project relationships
    const { error: subProjectsError } = await supabase
      .from('subscription_projects')
      .delete()
      .eq('user_id', userId)
    
    if (subProjectsError) {
      console.error('Error deleting subscription-projects:', subProjectsError)
    }

    // Delete subscriptions
    const { error: subscriptionsError } = await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', userId)
    
    if (subscriptionsError) {
      console.error('Error deleting subscriptions:', subscriptionsError)
    }

    // Delete projects
    const { error: projectsError } = await supabase
      .from('projects')
      .delete()
      .eq('user_id', userId)
    
    if (projectsError) {
      console.error('Error deleting projects:', projectsError)
    }

    // Delete user subscription
    const { error: userSubError } = await supabase
      .from('user_subscriptions')
      .delete()
      .eq('user_id', userId)
    
    if (userSubError) {
      console.error('Error deleting user subscription:', userSubError)
    }

    // Delete email preferences
    const { error: emailPrefError } = await supabase
      .from('email_preferences')
      .delete()
      .eq('user_id', userId)
    
    if (emailPrefError) {
      console.error('Error deleting email preferences:', emailPrefError)
    }

    // Step 4: Delete the auth user (this will also cascade delete related data)
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId)
    
    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError)
      return NextResponse.json({ 
        error: 'Failed to delete user account' 
      }, { status: 500 })
    }

    console.log(`Successfully deleted user account: ${userId}`)

    // Step 5: Send goodbye email (do this last in case it fails)
    if (userEmail) {
      try {
        await sendGoodbyeEmail(userEmail, userName)
        console.log('Goodbye email sent successfully')
      } catch (emailError) {
        console.error('Error sending goodbye email:', emailError)
        // Don't fail the deletion if email fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    })

  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}