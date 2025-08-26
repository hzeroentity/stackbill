'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PLANS, getPlan } from '@/lib/plans'
import { getStripe } from '@/lib/stripe'
import { useAuth } from '@/contexts/auth-context'
import { UserSubscription } from '@/lib/database.types'

export default function BillingPage() {
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [downgrading, setDowngrading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [isDowngradeModalOpen, setIsDowngradeModalOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const loadUserSubscription = async () => {
      try {
        if (user) {
          const response = await fetch(`/api/user-subscription?userId=${user.id}`)
          if (response.ok) {
            const { userSubscription: userSub } = await response.json()
            setUserSubscription(userSub)
          } else if (response.status === 401) {
            // User not authenticated, provide default free subscription
            console.warn('User not authenticated, using default subscription')
            setUserSubscription({
              id: 'temp',
              user_id: user.id,
              stripe_customer_id: null,
              stripe_subscription_id: null,
              plan_type: 'free',
              status: 'active',
              current_period_start: null,
              current_period_end: null,
              canceled_at: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          } else {
            throw new Error('Failed to fetch user subscription')
          }
        }
      } catch (error) {
        console.error('Error loading user subscription:', error)
        // Provide default free subscription as fallback
        if (user) {
          setUserSubscription({
            id: 'temp',
            user_id: user.id,
            stripe_customer_id: null,
            stripe_subscription_id: null,
            plan_type: 'free',
            status: 'active',
            current_period_start: null,
            current_period_end: null,
            canceled_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        }
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadUserSubscription()
    }
  }, [user])

  const handleUpgrade = async (planId: 'free' | 'pro') => {
    if (planId === 'free') return

    setUpgrading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId, userId: user?.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Failed to load Stripe')
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (error) {
        throw new Error(error.message || 'Failed to redirect to checkout')
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to upgrade')
      setIsErrorModalOpen(true)
    } finally {
      setUpgrading(false)
    }
  }

  const handleDowngrade = async () => {
    setDowngrading(true)
    try {
      const response = await fetch('/api/downgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to downgrade')
      }

      // Refresh user subscription data
      if (user) {
        const refreshResponse = await fetch(`/api/user-subscription?userId=${user.id}`)
        if (refreshResponse.ok) {
          const { userSubscription: userSub } = await refreshResponse.json()
          setUserSubscription(userSub)
        }
      }

      setIsDowngradeModalOpen(false)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to downgrade')
      setIsErrorModalOpen(true)
    } finally {
      setDowngrading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading billing information...</p>
          </div>
        </div>
      </div>
    )
  }

  const currentPlan = userSubscription?.plan_type || 'free'

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Track your subscriptions with our simple pricing. Start free and upgrade when you need more.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {PLANS.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id
          const isPopular = plan.popular

          return (
            <Card 
              key={plan.id} 
              className={`relative ${
                isPopular 
                  ? 'border-purple-500 shadow-lg shadow-purple-500/20 scale-105 bg-gradient-to-br from-purple-50 to-purple-100/50' 
                  : 'border-border'
              } ${
                isCurrentPlan 
                  ? 'ring-2 ring-green-500 bg-green-50/50' 
                  : ''
              }`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}

              {isCurrentPlan && (
                <div className="absolute -top-4 right-4">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-center py-4">
                  <div className="text-4xl font-bold">
                    ${plan.price}
                    <span className="text-lg font-normal text-muted-foreground">/month</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${isPopular && !isCurrentPlan ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}`}
                  variant={isCurrentPlan ? "secondary" : isPopular ? "default" : "outline"}
                  disabled={isCurrentPlan || upgrading}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {isCurrentPlan 
                    ? 'Current Plan' 
                    : upgrading 
                      ? 'Processing...' 
                      : plan.id === 'free' 
                        ? 'Get Started Free' 
                        : 'Upgrade to Pro'
                  }
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Current Subscription Details */}
      {userSubscription && userSubscription.plan_type === 'pro' && (
        <div className="mt-12 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription>Manage your Pro subscription</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Plan</span>
                <span className="text-purple-600 font-semibold">Pro - ${getPlan('pro').price}/month</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  userSubscription.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : userSubscription.status === 'past_due'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                  {userSubscription.status === 'active' ? 'Active' : 
                   userSubscription.status === 'past_due' ? 'Past Due' : 'Canceled'}
                </span>
              </div>
              {userSubscription.current_period_end && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Next billing date</span>
                  <span>{new Date(userSubscription.current_period_end).toLocaleDateString()}</span>
                </div>
              )}
              <div className="pt-4 border-t">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setIsDowngradeModalOpen(true)}
                    disabled={downgrading}
                  >
                    {downgrading ? 'Processing...' : 'Downgrade to Free'}
                  </Button>
                  <p className="text-sm text-muted-foreground flex-1">
                    Downgrade to the free plan anytime. You'll keep access until the end of your billing period.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* FAQ Section */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I upgrade or downgrade at any time?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes! You can upgrade from Free to Pro at any time. If you need to downgrade or cancel, 
                please contact our support team and we&apos;ll help you manage your subscription.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What happens if I hit the free plan limit?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                The free plan allows you to track up to 3 subscriptions. Once you reach this limit, 
                you&apos;ll be prompted to upgrade to Pro for unlimited subscription tracking.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Is my payment information secure?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Absolutely! We use Stripe for payment processing, which is trusted by millions of 
                businesses worldwide. We never store your payment information on our servers.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Dialog */}
      <AlertDialog open={isErrorModalOpen} onOpenChange={setIsErrorModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsErrorModalOpen(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Downgrade Confirmation Dialog */}
      <AlertDialog open={isDowngradeModalOpen} onOpenChange={setIsDowngradeModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Downgrade to Free Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to downgrade to the free plan? You'll lose access to Pro features, including unlimited subscription tracking. 
              <br /><br />
              Your subscription will be canceled immediately, but you'll keep Pro access until your next billing date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setIsDowngradeModalOpen(false)}
              disabled={downgrading}
            >
              Keep Pro
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDowngrade}
              disabled={downgrading}
              className="bg-red-600 hover:bg-red-700"
            >
              {downgrading ? 'Processing...' : 'Downgrade to Free'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}