import { NextRequest, NextResponse } from 'next/server';
import { userSubscriptionService } from '@/lib/user-subscription-service';
import { stripe } from '@/lib/stripe-server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get the user's current subscription
    const userSubscription = await userSubscriptionService.getUserSubscription(userId);
    
    if (!userSubscription || userSubscription.plan_type !== 'pro') {
      return NextResponse.json({ error: 'User is not on Pro plan' }, { status: 400 });
    }

    // Cancel the Stripe subscription at period end (customer keeps access until then)
    if (userSubscription.stripe_subscription_id) {
      try {
        const canceledSubscription = await stripe.subscriptions.update(
          userSubscription.stripe_subscription_id,
          {
            cancel_at_period_end: true
          }
        );
        
        // Update database to reflect cancellation pending at period end
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = canceledSubscription as any // Stripe types don't include all fields
        await userSubscriptionService.updateUserSubscription(userId, {
          status: 'canceled',
          canceled_at: new Date().toISOString(),
          // Keep current period end so user retains access
          current_period_end: new Date(sub.current_period_end * 1000).toISOString()
        });
        
      } catch (stripeError) {
        console.error('Error canceling Stripe subscription:', stripeError);
        throw stripeError; // Don't continue if Stripe cancel fails
      }
    } else {
      // No Stripe subscription, just update database
      await userSubscriptionService.cancelUserSubscription(userId);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Downgrade error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}