import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Database } from '@/lib/database.types'
import { userSubscriptionService } from '@/lib/user-subscription-service'
import { sendGoodbyeEmail } from '@/lib/resend'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil'
})

export async function DELETE(request: NextRequest) {
  try {
    // Try both auth methods - first with cookies (proper SSR way)
    const cookieStore = await cookies()

    const supabaseSSR = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )

    const { data: { user: sslUser }, error: ssrError } = await supabaseSSR.auth.getUser()

    let user = sslUser
    let authError = ssrError

    // If SSR auth fails, try token-based auth
    if (!user) {
      const authHeader = request.headers.get('Authorization')
      const token = authHeader?.replace('Bearer ', '')

      if (token) {
        const supabaseToken = createClient<Database>(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const { data: { user: tokenUser }, error: tokenError } = await supabaseToken.auth.getUser(token)

        user = tokenUser
        authError = tokenError
      }
    }

    if (authError || !user) {
      console.error('All auth methods failed:', { authError })
      return NextResponse.json({
        error: 'Unauthorized - Authentication failed',
        details: authError?.message
      }, { status: 401 })
    }

    const { userId } = await request.json()

    if (userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Step 1: Get user info for goodbye email
    const userEmail = user.email

    // Step 2: Cancel Stripe subscription if exists
    try {
      const userSubscription = await userSubscriptionService.getUserSubscription(userId)

      if (userSubscription?.stripe_subscription_id) {
        await stripe.subscriptions.cancel(userSubscription.stripe_subscription_id)
      }
    } catch (stripeError) {
      console.error('Error cancelling Stripe subscription:', stripeError)
      // Continue with deletion even if Stripe cancellation fails
    }

    // Step 3: Delete user data from database using service role client
    const serviceSupabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Delete subscription-project relationships
    const { error: subProjectsError } = await serviceSupabase
      .from('subscription_projects')
      .delete()
      .eq('user_id', userId)

    if (subProjectsError) {
      console.error('Error deleting subscription-projects:', subProjectsError)
    }

    // Delete subscriptions
    const { error: subscriptionsError } = await serviceSupabase
      .from('subscriptions')
      .delete()
      .eq('user_id', userId)

    if (subscriptionsError) {
      console.error('Error deleting subscriptions:', subscriptionsError)
    }

    // Delete projects
    const { error: projectsError } = await serviceSupabase
      .from('projects')
      .delete()
      .eq('user_id', userId)

    if (projectsError) {
      console.error('Error deleting projects:', projectsError)
    }

    // Delete user subscription
    const { error: userSubError } = await serviceSupabase
      .from('user_subscriptions')
      .delete()
      .eq('user_id', userId)

    if (userSubError) {
      console.error('Error deleting user subscription:', userSubError)
    }

    // Delete email preferences
    const { error: emailPrefError } = await serviceSupabase
      .from('email_preferences')
      .delete()
      .eq('user_id', userId)

    if (emailPrefError) {
      console.error('Error deleting email preferences:', emailPrefError)
    }

    // Step 4: Delete the auth user (this will also cascade delete related data)
    const { error: deleteUserError } = await serviceSupabase.auth.admin.deleteUser(userId)
    
    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError)
      return NextResponse.json({
        error: 'Failed to delete user account'
      }, { status: 500 })
    }

    // Step 5: Send goodbye email (do this last in case it fails)
    if (userEmail) {
      try {
        await sendGoodbyeEmail(userEmail)
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