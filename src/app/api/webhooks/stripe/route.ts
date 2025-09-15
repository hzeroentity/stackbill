import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-server'
import { userSubscriptionService } from '@/lib/user-subscription-service'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    
    console.log('Webhook received:', {
      hasSignature: !!signature,
      bodyLength: body.length,
      webhookSecretConfigured: !!webhookSecret
    })

    if (!signature) {
      console.error('No stripe-signature header provided')
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log('Webhook event constructed successfully:', event.type)
    } catch (err) {
      console.error('Webhook signature verification failed:', {
        error: err,
        signature: signature?.substring(0, 20) + '...',
        webhookSecretLength: webhookSecret?.length
      })
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
        try {
          await handleSubscriptionUpdated(updatedSubscription)
          console.log('Successfully handled subscription.updated for:', updatedSubscription.id)
        } catch (error) {
          console.error('Error handling subscription.updated:', error)
          throw error
        }
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        try {
          await handleSubscriptionDeleted(deletedSubscription)
          console.log('Successfully handled subscription.deleted for:', deletedSubscription.id)
        } catch (error) {
          console.error('Error handling subscription.deleted:', error)
          throw error
        }
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
  try {
    console.log('Webhook - handleSubscriptionUpdated called for subscription:', subscription.id)
    
    const customer = await stripe.customers.retrieve(subscription.customer as string)
    
    if (!('metadata' in customer) || !customer.metadata?.userId) {
      console.log('Customer has no userId metadata, skipping subscription update')
      return
    }
    
    const userId = customer.metadata.userId
    console.log('Webhook - Processing subscription update for userId:', userId)
    
    // Check if user exists in our database
    try {
      const existingSubscription = await userSubscriptionService.getUserSubscription(userId)
      if (!existingSubscription) {
        console.error('Webhook - User subscription not found in database for userId:', userId)
        // Create a basic subscription record if it doesn't exist
        await userSubscriptionService.ensureUserSubscription(userId)
      }
    } catch (userCheckError) {
      console.error('Webhook - Error checking user subscription:', userCheckError)
      return
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sub = subscription as any // Stripe types don't include all fields
    
    console.log('Updating subscription for user:', userId, 'status:', sub.status, 'cancel_at_period_end:', sub.cancel_at_period_end)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      status: sub.status === 'active' ? 'active' : 
             sub.status === 'past_due' ? 'past_due' :
             sub.status === 'canceled' ? 'canceled' : 'incomplete'
    }
    
    // Safely handle period dates
    if (sub.current_period_start && typeof sub.current_period_start === 'number') {
      try {
        updateData.current_period_start = new Date(sub.current_period_start * 1000).toISOString()
      } catch (error) {
        console.warn('Invalid current_period_start in webhook:', sub.current_period_start)
      }
    }
    
    if (sub.current_period_end && typeof sub.current_period_end === 'number') {
      try {
        updateData.current_period_end = new Date(sub.current_period_end * 1000).toISOString()
      } catch (error) {
        console.warn('Invalid current_period_end in webhook:', sub.current_period_end)
      }
    }
    
    // If subscription is being set to cancel at period end, mark as canceled but keep Pro access
    if (sub.cancel_at_period_end && sub.status === 'active') {
      updateData.status = 'canceled'
      // Add canceled_at timestamp if it exists
      if (sub.canceled_at && typeof sub.canceled_at === 'number') {
        try {
          updateData.canceled_at = new Date(sub.canceled_at * 1000).toISOString()
        } catch (error) {
          console.warn('Invalid canceled_at in webhook:', sub.canceled_at)
        }
      }
    }
    
    console.log('Webhook - Updating user subscription with data:', updateData)
    
    try {
      const result = await userSubscriptionService.updateUserSubscription(userId, updateData)
      console.log('Webhook - Successfully updated user subscription:', result.id)
    } catch (updateError) {
      console.error('Webhook - Database update failed:', updateError)
      console.error('Webhook - Update data that failed:', updateData)
      throw updateError
    }
    
  } catch (error) {
    console.error('Error in handleSubscriptionUpdated:', error)
    throw error
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const customer = await stripe.customers.retrieve(subscription.customer as string)
    
    if (!('metadata' in customer) || !customer.metadata?.userId) {
      console.log('Customer has no userId metadata, skipping subscription deletion')
      return
    }
    
    const userId = customer.metadata.userId
    console.log('Deleting subscription for user:', userId)
    
    // Actually set plan_type to free when subscription is truly deleted
    await userSubscriptionService.updateUserSubscription(userId, {
      plan_type: 'free',
      status: 'canceled',
      canceled_at: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error in handleSubscriptionDeleted:', error)
    throw error
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