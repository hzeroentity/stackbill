import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-server'
import { userSubscriptionService } from '@/lib/user-subscription-service'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      console.error('Billing portal API - Missing userId')
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Get user subscription to get Stripe customer ID
    const userSubscription = await userSubscriptionService.getUserSubscription(userId)

    if (!userSubscription?.stripe_customer_id) {
      console.error('Billing portal API - No stripe_customer_id found:', userSubscription)
      return NextResponse.json({ error: 'No billing account found' }, { status: 400 })
    }

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userSubscription.stripe_customer_id,
      return_url: `${request.nextUrl.origin}/dashboard/billing`,
    })

    return NextResponse.json({
      url: portalSession.url
    })

  } catch (error) {
    console.error('Billing portal error:', error)
    return NextResponse.json(
      { error: `Failed to create billing portal session: ${error instanceof Error ? error.message : 'Unknown error'}` }, 
      { status: 500 }
    )
  }
}