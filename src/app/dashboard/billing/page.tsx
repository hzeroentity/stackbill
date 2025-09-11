'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, History } from "lucide-react"
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
import { Tables } from '@/lib/database.types'
import { useLanguage } from '@/contexts/language-context'
import { PLAN_LIMITS } from '@/lib/plan-limits'

export default function BillingPage() {
  const [userSubscription, setUserSubscription] = useState<Tables<'user_subscriptions'> | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [downgrading, setDowngrading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [isDowngradeModalOpen, setIsDowngradeModalOpen] = useState(false)
  const [isLimitExceededModalOpen, setIsLimitExceededModalOpen] = useState(false)
  const [isForceDowngradeModalOpen, setIsForceDowngradeModalOpen] = useState(false)
  const [userStats, setUserStats] = useState<{activeSubscriptions: number, projects: number} | null>(null)
  const { user } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    const loadUserSubscription = async () => {
      try {
        if (user) {
          // Load user subscription
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
          
          // Load user stats for downgrade validation
          try {
            const statsResponse = await fetch(`/api/user-stats?userId=${user.id}`)
            if (statsResponse.ok) {
              const stats = await statsResponse.json()
              setUserStats(stats)
            }
          } catch (statsError) {
            console.warn('Failed to load user stats:', statsError)
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

  const handleDowngradeClick = () => {
    // Check if user exceeds free plan limits
    if (userStats) {
      const freeLimit = PLAN_LIMITS.free
      if (userStats.activeSubscriptions > freeLimit.subscriptions || userStats.projects > freeLimit.projects) {
        setIsLimitExceededModalOpen(true)
        return
      }
    }
    
    // User is within limits, proceed with normal downgrade
    setIsDowngradeModalOpen(true)
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


  const handleForceDowngrade = async () => {
    setDowngrading(true)
    try {
      const response = await fetch('/api/force-downgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user?.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to force downgrade')
      }

      // Refresh user subscription data
      if (user) {
        const refreshResponse = await fetch(`/api/user-subscription?userId=${user.id}`)
        if (refreshResponse.ok) {
          const { userSubscription: userSub } = await refreshResponse.json()
          setUserSubscription(userSub)
        }
        
        // Refresh user stats
        const statsResponse = await fetch(`/api/user-stats?userId=${user.id}`)
        if (statsResponse.ok) {
          const stats = await statsResponse.json()
          setUserStats(stats)
        }
      }

      setIsForceDowngradeModalOpen(false)
      setIsLimitExceededModalOpen(false)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to force downgrade')
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
    <div className="container mx-auto p-4 sm:p-6 pt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold">{t('billing.title')}</h1>
        </div>
      </div>
      <div className="mb-6">
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
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      variant="outline" 
                      className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/20"
                      onClick={handleDowngradeClick}
                      disabled={downgrading}
                    >
                      {downgrading ? t('dashboard.processing') : t('billing.downgrade')}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = '/dashboard/billing/history'}
                    >
                      <History className="h-4 w-4 mr-2" />
                      Billing History
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium dark:bg-green-600">
                    {t('billing.currentPlan')}
                  </div>
                </div>
              )}

              {/* Limited Time Badge for Pro Plan */}
              {plan.id === 'pro' && !isCurrentPlan && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Limited Time
                  </div>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-center py-4">
                  {plan.id === 'pro' ? (
                    <>
                      <div className="text-4xl font-bold">
                        <span className="text-2xl line-through text-slate-400 mr-2">$6</span>${plan.price}
                        <span className="text-lg font-normal text-muted-foreground">/month</span>
                      </div>
                      <p className="text-blue-700 dark:text-blue-300 text-sm font-medium mt-2">
                        🚀 Early Access: Lock in $4/month forever
                      </p>
                    </>
                  ) : (
                    <div className="text-4xl font-bold">
                      ${plan.price}
                      {plan.price > 0 && <span className="text-lg font-normal text-muted-foreground">/month</span>}
                    </div>
                  )}
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

                {/* Only show button if not a downgrade scenario (Pro user looking at Free plan) */}
                {!(currentPlan === 'pro' && plan.id === 'free') && (
                  <Button 
                    className={`w-full ${
                      plan.id === 'pro' && !isCurrentPlan 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg' 
                        : ''
                    }`}
                    variant={isCurrentPlan ? "secondary" : plan.id === 'pro' && !isCurrentPlan ? "default" : "outline"}
                    disabled={isCurrentPlan || upgrading}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {isCurrentPlan 
                      ? t('billing.currentPlan') 
                      : upgrading 
                        ? t('dashboard.processing') 
                        : plan.id === 'free' 
                          ? t('billing.getStartedFree') 
                          : '✨ Upgrade to Pro - Start Saving!'
                    }
                  </Button>
                )}
                
                {/* Show downgrade message for Pro users looking at Free plan */}
                {currentPlan === 'pro' && plan.id === 'free' && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Use the downgrade button above to switch to this plan
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
        
        {/* Teams Plan */}
        <Card className="relative opacity-95">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Coming Soon
            </div>
          </div>
          
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Team</CardTitle>
            <CardDescription>Scale with your team</CardDescription>
            <div className="text-center py-4">
              <div className="text-4xl font-bold">
                $10
                <span className="text-lg font-normal text-muted-foreground">/month</span>
              </div>
              <p className="text-purple-700 dark:text-purple-300 text-sm font-medium mt-2">
                Perfect for growing teams
              </p>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <ul className="space-y-3 mb-6">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-sm">All Pro plan features included</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-sm">Up to 5 team members</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-sm">Unlimited subscriptions</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-sm">Unlimited projects</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-sm">Team collaboration features</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-sm">Advanced analytics & reporting</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-sm">Priority support</span>
              </li>
            </ul>

            <Button 
              className="w-full"
              variant="outline"
              onClick={() => window.open('mailto:hello@stackbill.dev?subject=Teams Plan Interest&body=Hi! I\'m interested in being notified when the Teams plan becomes available.', '_blank')}
            >
              🚀 Notify Me When Available
            </Button>
          </CardContent>
        </Card>
        </div>
        
        {/* Billing Reassurance */}
        <div className="mt-12 text-center max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-6">💳 Flexible Billing</h3>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              ✅ <strong>Cancel anytime</strong> - No long-term commitments or hidden fees
            </p>
            <p>
              ✅ <strong>Instant upgrades</strong> - Access new features immediately after upgrading
            </p>
            <p>
              ✅ <strong>Prorated billing</strong> - Only pay for what you use when switching plans
            </p>
            <p>
              ✅ <strong>Secure payments</strong> - All transactions protected by Stripe's enterprise-grade security
            </p>
          </div>
          <div className="mt-6">
            <p className="text-xs text-muted-foreground">
              Questions about billing? Contact us at{' '}
              <a href="mailto:hello@stackbill.dev" className="text-blue-600 hover:underline">
                hello@stackbill.dev
              </a>
            </p>
          </div>
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

      {/* Limit Exceeded Dialog */}
      <AlertDialog open={isLimitExceededModalOpen} onOpenChange={setIsLimitExceededModalOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Cannot Downgrade to Free Plan</AlertDialogTitle>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>You currently exceed the free plan limits:</p>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg space-y-1 text-sm">
                {userStats && (
                  <>
                    <div className="flex justify-between">
                      <span>Active Subscriptions:</span>
                      <span className={userStats.activeSubscriptions > PLAN_LIMITS.free.subscriptions ? 'text-red-600 font-medium' : ''}>
                        {userStats.activeSubscriptions}/{PLAN_LIMITS.free.subscriptions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Projects:</span>
                      <span className={userStats.projects > PLAN_LIMITS.free.projects ? 'text-red-600 font-medium' : ''}>
                        {userStats.projects}/{PLAN_LIMITS.free.projects}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <p>
                Please delete some subscriptions and/or projects from your Settings page, 
                then try downgrading again.
              </p>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col space-y-2 sm:flex-col sm:space-x-0">
            <AlertDialogAction 
              onClick={() => setIsLimitExceededModalOpen(false)}
              className="w-full"
            >
              Got it
            </AlertDialogAction>
            <Button
              variant="destructive"
              onClick={() => {
                setIsLimitExceededModalOpen(false)
                setIsForceDowngradeModalOpen(true)
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Force Downgrade Anyway
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Force Downgrade Confirmation Dialog */}
      <AlertDialog open={isForceDowngradeModalOpen} onOpenChange={setIsForceDowngradeModalOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">⚠️ Force Downgrade Warning</AlertDialogTitle>
            <div className="text-sm text-muted-foreground space-y-4">
              <p className="font-medium text-amber-700 dark:text-amber-400">
                This will permanently delete your data!
              </p>
              
              {userStats && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-medium text-red-800 dark:text-red-400">The following will be deleted:</p>
                  {userStats.activeSubscriptions > PLAN_LIMITS.free.subscriptions && (
                    <div className="flex justify-between items-center">
                      <span>Most recent subscriptions:</span>
                      <span className="font-bold text-red-600">
                        {userStats.activeSubscriptions - PLAN_LIMITS.free.subscriptions} deleted
                      </span>
                    </div>
                  )}
                  {userStats.projects > PLAN_LIMITS.free.projects && (
                    <div className="flex justify-between items-center">
                      <span>Most recent projects:</span>
                      <span className="font-bold text-red-600">
                        {userStats.projects - PLAN_LIMITS.free.projects} deleted
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-sm text-muted-foreground">
                <strong>What will happen:</strong>
                <br />• Your most recently created subscriptions and projects will be permanently removed
                <br />• You&apos;ll be downgraded to the Free plan immediately  
                <br />• This action cannot be undone
              </p>
              
              <p className="text-sm font-medium text-red-600">
                Are you absolutely sure you want to proceed?
              </p>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setIsForceDowngradeModalOpen(false)}
              disabled={downgrading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleForceDowngrade}
              disabled={downgrading}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              {downgrading ? 'Processing...' : 'Yes, Delete and Downgrade'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}