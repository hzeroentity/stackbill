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

    // Cancel the Stripe subscription if it exists
    if (userSubscription.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(userSubscription.stripe_subscription_id);
      } catch (stripeError) {
        console.error('Error canceling Stripe subscription:', stripeError);
        // Continue with downgrade even if Stripe cancel fails
      }
    }

    // Update user subscription to free plan
    await userSubscriptionService.cancelUserSubscription(userId);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Downgrade error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}