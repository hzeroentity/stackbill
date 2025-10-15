import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-server'
import { getPlan } from '@/lib/plans'
import { userSubscriptionService } from '@/lib/user-subscription-service'

export async function POST(request: NextRequest) {
  try {
    const { planId, userId } = await request.json()

    if (!planId || planId === 'free') {
      console.error('Checkout API - Invalid plan:', planId)
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    if (!userId) {
      console.error('Checkout API - Missing userId')
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Get plan details
    const plan = getPlan(planId)

    if (!plan.priceId) {
      console.error('Checkout API - Missing price ID for plan:', planId)
      return NextResponse.json({
        error: 'Plan not available - missing price ID configuration'
      }, { status: 400 })
    }

    // Check if user already has an active subscription
    let existingSubscription = null
    try {
      existingSubscription = await userSubscriptionService.getUserSubscription(userId)
      if (existingSubscription?.plan_type === 'pro' && existingSubscription.status === 'active') {
        return NextResponse.json({ error: 'User already has an active subscription' }, { status: 400 })
      }
    } catch (error) {
      console.error('Checkout API - Error checking user subscription:', error)
      // Continue anyway for now
    }

    // Create or retrieve Stripe customer
    let customer
    if (existingSubscription?.stripe_customer_id) {
      try {
        customer = await stripe.customers.retrieve(existingSubscription.stripe_customer_id)
      } catch (customerError) {
        console.warn('Checkout API - Customer not found, creating new one:', customerError instanceof Error ? customerError.message : String(customerError))
        customer = await stripe.customers.create({
          metadata: {
            userId: userId
          }
        })
      }
    } else {
      customer = await stripe.customers.create({
        metadata: {
          userId: userId
        }
      })
    }

    // Create Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.nextUrl.origin}/dashboard?success=true`,
      cancel_url: `${request.nextUrl.origin}/dashboard?canceled=true`,
      metadata: {
        userId: userId,
        planId: plan.id
      }
    })

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url
    })

  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}