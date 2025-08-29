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
import { useLanguage } from '@/contexts/language-context'

export default function BillingPage() {
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [downgrading, setDowngrading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [isDowngradeModalOpen, setIsDowngradeModalOpen] = useState(false)
  const { user } = useAuth()
  const { t } = useLanguage()

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
      <div className="pt-8 mb-12">
        <h1 className="text-3xl font-bold mb-4">{t('billing.title')}</h1>
        <p className="text-muted-foreground">
          {t('billing.manageBilling')}
        </p>
      </div>

      {/* Current Subscription Details */}
      {userSubscription && userSubscription.plan_type === 'pro' && (
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>{t('billing.manageBilling')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">{t('billing.plan')}</span>
                <span className="text-purple-600 font-semibold">Pro - ${getPlan('pro').price}/month</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">{t('billing.status')}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  userSubscription.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : userSubscription.status === 'past_due'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {userSubscription.status === 'active' ? t('billing.active') : 
                   userSubscription.status === 'past_due' ? 'Past Due' : 'Canceled'}
                </span>
              </div>
              {userSubscription.current_period_end && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">{t('billing.nextBilling')}</span>
                  <span>{new Date(userSubscription.current_period_end).toLocaleDateString()}</span>
                </div>
              )}
              <div className="pt-4 border-t">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    variant="outline" 
                    className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/20"
                    onClick={() => setIsDowngradeModalOpen(true)}
                    disabled={downgrading}
                  >
                    {downgrading ? t('dashboard.processing') : t('billing.downgrade')}
                  </Button>
                  <p className="text-sm text-muted-foreground flex-1">
                    Downgrade to the free plan anytime. You&apos;ll keep access until the end of your billing period.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">{t('billing.choosePlan')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PLANS.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id

          return (
            <Card 
              key={plan.id} 
              className={`relative ${
                isCurrentPlan 
                  ? 'ring-2 ring-green-500 bg-green-50/50 dark:ring-green-400 dark:bg-green-950/20' 
                  : 'border-border'
              }`}
            >
              {isCurrentPlan && (
                <div className="absolute -top-4 right-4">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium dark:bg-green-600">
                    {t('billing.currentPlan')}
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
                  className="w-full"
                  variant={isCurrentPlan ? "secondary" : "outline"}
                  disabled={isCurrentPlan || upgrading}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {isCurrentPlan 
                    ? t('billing.currentPlan') 
                    : upgrading 
                      ? t('dashboard.processing') 
                      : plan.id === 'free' 
                        ? t('billing.getStartedFree') 
                        : t('billing.upgradeToPro')
                  }
                </Button>
              </CardContent>
            </Card>
          )
        })}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-24">
        <h2 className="text-2xl font-bold text-center mb-8">{t('billing.faq.title')}</h2>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('billing.faq.q1')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('billing.faq.a1')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('billing.faq.q2')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('billing.faq.a2')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('billing.faq.q3')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('billing.faq.a3')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Dialog */}
      <AlertDialog open={isErrorModalOpen} onOpenChange={setIsErrorModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dashboard.error')}</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsErrorModalOpen(false)}>
              {t('billing.ok')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Downgrade Confirmation Dialog */}
      <AlertDialog open={isDowngradeModalOpen} onOpenChange={setIsDowngradeModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('billing.downgrade')} Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to downgrade to the free plan? You&apos;ll lose access to Pro features, including unlimited subscription tracking. 
              <br /><br />
              Your subscription will be canceled immediately, but you&apos;ll keep Pro access until your next billing date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setIsDowngradeModalOpen(false)}
              disabled={downgrading}
            >
              {t('billing.keepPro')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDowngrade}
              disabled={downgrading}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              {downgrading ? t('dashboard.processing') : t('billing.downgrade')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}