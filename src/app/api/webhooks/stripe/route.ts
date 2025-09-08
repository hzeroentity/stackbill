import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-server'
import { userSubscriptionService } from '@/lib/user-subscription-service'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
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
  
  const userId = session.metadata?.userId
  if (!userId || !session.subscription) {
    console.error('Missing userId or subscription in session metadata', {
      userId,
      subscription: session.subscription,
      metadata: session.metadata
    })
    return
  }


  try {
    // Retrieve the subscription to get period information
    const subscriptionResponse = await stripe.subscriptions.retrieve(session.subscription as string)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription = subscriptionResponse as any // Stripe types don't include period fields
    
    // Handle potential null/undefined values for subscription periods
    const periodStart = subscription.current_period_start 
      ? new Date(subscription.current_period_start * 1000).toISOString()
      : new Date().toISOString()
    
    const periodEnd = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Default to 30 days from now
    
    
    await userSubscriptionService.upgradeUserToPro(
      userId,
      session.customer as string,
      subscription.id,
      periodStart,
      periodEnd
    )

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

  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer as string)
  
  if ('metadata' in customer && customer.metadata?.userId) {
    const userId = customer.metadata.userId
    
    await userSubscriptionService.cancelUserSubscription(userId)
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
      
    }
  }
}