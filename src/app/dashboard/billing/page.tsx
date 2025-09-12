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
            <p>{t('billing.loadingBilling')}</p>
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
              <CardTitle>{t('billing.currentSubscription')}</CardTitle>
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
                   userSubscription.status === 'past_due' ? t('billing.pastDue') : t('billing.canceled')}
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
                      {t('billing.billingHistory')}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t('billing.downgradeNotice')}
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
                    {t('billing.limitedTime')}
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
                        {t('billing.earlyAccessOffer')}
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
                          : t('billing.upgradeToProCta')
                    }
                  </Button>
                )}
                
                {/* Show downgrade message for Pro users looking at Free plan */}
                {currentPlan === 'pro' && plan.id === 'free' && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      {t('billing.downgradeButtonNotice')}
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
              {t('billing.comingSoon')}
            </div>
          </div>
          
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">{t('billing.teamPlan')}</CardTitle>
            <CardDescription>{t('billing.teamPlanDescription')}</CardDescription>
            <div className="text-center py-4">
              <div className="text-4xl font-bold">
                $10
                <span className="text-lg font-normal text-muted-foreground">/month</span>
              </div>
              <p className="text-purple-700 dark:text-purple-300 text-sm font-medium mt-2">
                {t('billing.teamPlanSubtitle')}
              </p>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <ul className="space-y-3 mb-6">
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-sm">{t('billing.allProFeaturesIncluded')}</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-sm">{t('billing.upToTeamMembers')}</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-sm">{t('billing.unlimitedSubscriptions')}</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-sm">{t('billing.unlimitedProjects')}</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-sm">{t('billing.teamCollaboration')}</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-sm">{t('billing.advancedAnalytics')}</span>
              </li>
              <li className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-sm">{t('billing.prioritySupport')}</span>
              </li>
            </ul>

            <Button 
              className="w-full"
              variant="outline"
              onClick={() => window.open('mailto:hello@stackbill.dev?subject=Teams Plan Interest&body=Hi! I\'m interested in being notified when the Teams plan becomes available.', '_blank')}
            >
              {t('billing.notifyWhenAvailable')}
            </Button>
          </CardContent>
        </Card>
        </div>
        
        {/* Billing Reassurance */}
        <div className="mt-12 text-center max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-6">{t('billing.flexibleBilling')}</h3>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              {t('billing.cancelAnytime')}
            </p>
            <p>
              {t('billing.instantUpgrades')}
            </p>
            <p>
              {t('billing.proratedBilling')}
            </p>
            <p>
              {t('billing.securePayments')}
            </p>
          </div>
          <div className="mt-6">
            <p className="text-xs text-muted-foreground">
              {t('billing.billingQuestions')}{' '}
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
            <AlertDialogTitle>{t('billing.downgradePlanTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('billing.downgradeConfirmation')}
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
            <AlertDialogTitle>{t('billing.cannotDowngradeTitle')}</AlertDialogTitle>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>{t('billing.exceedsFreeLimits')}</p>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg space-y-1 text-sm">
                {userStats && (
                  <>
                    <div className="flex justify-between">
                      <span>{t('billing.activeSubscriptionsLimit')}</span>
                      <span className={userStats.activeSubscriptions > PLAN_LIMITS.free.subscriptions ? 'text-red-600 font-medium' : ''}>
                        {userStats.activeSubscriptions}/{PLAN_LIMITS.free.subscriptions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('billing.projectsLimit')}</span>
                      <span className={userStats.projects > PLAN_LIMITS.free.projects ? 'text-red-600 font-medium' : ''}>
                        {userStats.projects}/{PLAN_LIMITS.free.projects}
                      </span>
                    </div>
                  </>
                )}
              </div>
              <p>
                {t('billing.deleteToDowngrade')}
              </p>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col space-y-2 sm:flex-col sm:space-x-0">
            <AlertDialogAction 
              onClick={() => setIsLimitExceededModalOpen(false)}
              className="w-full"
            >
              {t('billing.gotIt')}
            </AlertDialogAction>
            <Button
              variant="destructive"
              onClick={() => {
                setIsLimitExceededModalOpen(false)
                setIsForceDowngradeModalOpen(true)
              }}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {t('billing.forceDowngradeAnyway')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Force Downgrade Confirmation Dialog */}
      <AlertDialog open={isForceDowngradeModalOpen} onOpenChange={setIsForceDowngradeModalOpen}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">{t('billing.forceDowngradeWarning')}</AlertDialogTitle>
            <div className="text-sm text-muted-foreground space-y-4">
              <p className="font-medium text-amber-700 dark:text-amber-400">
                {t('billing.permanentDataDeletion')}
              </p>
              
              {userStats && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-medium text-red-800 dark:text-red-400">{t('billing.followingWillBeDeleted')}</p>
                  {userStats.activeSubscriptions > PLAN_LIMITS.free.subscriptions && (
                    <div className="flex justify-between items-center">
                      <span>{t('billing.mostRecentSubscriptions')}</span>
                      <span className="font-bold text-red-600">
                        {userStats.activeSubscriptions - PLAN_LIMITS.free.subscriptions} {t('billing.deleted')}
                      </span>
                    </div>
                  )}
                  {userStats.projects > PLAN_LIMITS.free.projects && (
                    <div className="flex justify-between items-center">
                      <span>{t('billing.mostRecentProjects')}</span>
                      <span className="font-bold text-red-600">
                        {userStats.projects - PLAN_LIMITS.free.projects} {t('billing.deleted')}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-sm text-muted-foreground">
                <strong>{t('billing.whatWillHappen')}</strong>
                <br />{t('billing.dataWillBeRemoved')}
              </p>
              
              <p className="text-sm font-medium text-red-600">
                {t('billing.absolutelySurePrompt')}
              </p>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setIsForceDowngradeModalOpen(false)}
              disabled={downgrading}
            >
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleForceDowngrade}
              disabled={downgrading}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              {downgrading ? t('dashboard.processing') : t('billing.yesDeleteAndDowngrade')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}