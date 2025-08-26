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
        await handleCheckoutSessionCompleted(session)
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
    console.error('Missing userId or subscription in session metadata')
    return
  }

  // Retrieve the subscription to get period information
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
  
  await userSubscriptionService.upgradeUserToPro(
    userId,
    session.customer as string,
    subscription.id,
    new Date(subscription.current_period_start * 1000).toISOString(),
    new Date(subscription.current_period_end * 1000).toISOString()
  )

  console.log(`User ${userId} upgraded to Pro successfully`)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer as string)
  
  if ('metadata' in customer && customer.metadata?.userId) {
    const userId = customer.metadata.userId
    
    await userSubscriptionService.updateUserSubscription(userId, {
      status: subscription.status === 'active' ? 'active' : 
             subscription.status === 'past_due' ? 'past_due' :
             subscription.status === 'canceled' ? 'canceled' : 'incomplete',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
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
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
    const customer = await stripe.customers.retrieve(subscription.customer as string)
    
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
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
    const customer = await stripe.customers.retrieve(subscription.customer as string)
    
    if ('metadata' in customer && customer.metadata?.userId) {
      const userId = customer.metadata.userId
      
      await userSubscriptionService.updateUserSubscription(userId, {
        status: 'past_due'
      })
      
      console.log(`Payment failed for user ${userId}`)
    }
  }
}