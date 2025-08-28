import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-server'
import { userSubscriptionService } from '@/lib/user-subscription-service'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  console.log('=== WEBHOOK RECEIVED ===')
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log('Webhook verified successfully, event type:', event.type)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Processing checkout.session.completed:', session.id)
        try {
          await handleCheckoutSessionCompleted(session)
        } catch (error) {
          console.error('Error handling checkout.session.completed:', error)
          throw error
        }
        break

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(updatedSubscription)
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(deletedSubscription)
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(failedInvoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
        // Remove unreachable code that causes TypeScript error
        break
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' }, 
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed - Session metadata:', session.metadata)
  console.log('Checkout session completed - Customer ID:', session.customer)
  console.log('Checkout session completed - Subscription ID:', session.subscription)
  
  const userId = session.metadata?.userId
  if (!userId || !session.subscription) {
    console.error('Missing userId or subscription in session metadata', {
      userId,
      subscription: session.subscription,
      metadata: session.metadata
    })
    return
  }

  console.log(`Processing upgrade for user ${userId}`)

  try {
    // Retrieve the subscription to get period information
    const subscriptionResponse = await stripe.subscriptions.retrieve(session.subscription as string)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription = subscriptionResponse as any // Stripe types don't include period fields
    console.log('Retrieved subscription:', subscription.id, 'status:', subscription.status)
    console.log('Subscription period start:', subscription.current_period_start)
    console.log('Subscription period end:', subscription.current_period_end)
    
    // Handle potential null/undefined values for subscription periods
    const periodStart = subscription.current_period_start 
      ? new Date(subscription.current_period_start * 1000).toISOString()
      : new Date().toISOString()
    
    const periodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Default to 30 days from now
    
    console.log('Processed period start:', periodStart)
    console.log('Processed period end:', periodEnd)
    
    await userSubscriptionService.upgradeUserToPro(
      userId,
      session.customer as string,
      subscription.id,
      periodStart,
      periodEnd
    )

    console.log(`User ${userId} upgraded to Pro successfully`)
  } catch (error) {
    console.error(`Error upgrading user ${userId} to Pro:`, error)
    throw error
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer as string)
  
  if ('metadata' in customer && customer.metadata?.userId) {
    const userId = customer.metadata.userId
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sub = subscription as any // Stripe types don't include all fields
    
    await userSubscriptionService.updateUserSubscription(userId, {
      status: sub.status === 'active' ? 'active' : 
             sub.status === 'past_due' ? 'past_due' :
             sub.status === 'canceled' ? 'canceled' : 'incomplete',
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString()
    })

    console.log(`Updated subscription for user ${userId}`)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer as string)
  
  if ('metadata' in customer && customer.metadata?.userId) {
    const userId = customer.metadata.userId
    
    await userSubscriptionService.cancelUserSubscription(userId)
    console.log(`Canceled subscription for user ${userId}`)
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Update subscription status to active
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inv = invoice as any // Stripe types don't include all fields
  if (inv.subscription) {
    const subscription = await stripe.subscriptions.retrieve(inv.subscription as string)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customer = await stripe.customers.retrieve((subscription as any).customer as string)
    
    if ('metadata' in customer && customer.metadata?.userId) {
      const userId = customer.metadata.userId
      
      await userSubscriptionService.updateUserSubscription(userId, {
        status: 'active'
      })
      
      console.log(`Payment succeeded for user ${userId}`)
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Update subscription status to past_due
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inv = invoice as any // Stripe types don't include all fields
  if (inv.subscription) {
    const subscription = await stripe.subscriptions.retrieve(inv.subscription as string)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customer = await stripe.customers.retrieve((subscription as any).customer as string)
    
    if ('metadata' in customer && customer.metadata?.userId) {
      const userId = customer.metadata.userId
      
      await userSubscriptionService.updateUserSubscription(userId, {
        status: 'past_due'
      })
      
      console.log(`Payment failed for user ${userId}`)
    }
  }
}