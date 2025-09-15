'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Settings } from "lucide-react"
import { EmailCollectionModal } from "@/components/modals/email-collection-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getTranslatedPlans } from '@/lib/plans'
import { getStripe } from '@/lib/stripe'
import { useAuth } from '@/contexts/auth-context'
import { Tables } from '@/lib/database.types'
import { useLanguage } from '@/contexts/language-context'

export default function BillingPage() {
  const [userSubscription, setUserSubscription] = useState<Tables<'user_subscriptions'> | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [isTeamNotifyModalOpen, setIsTeamNotifyModalOpen] = useState(false)
  const [openingPortal, setOpeningPortal] = useState(false)
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
          } else {
            // Default free subscription
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
        }
      } catch (error) {
        console.error('Error loading user subscription:', error)
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

  const handleBillingPortal = async () => {
    if (!user?.id || openingPortal) return
    
    setOpeningPortal(true)
    try {
      const response = await fetch('/api/billing-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal')
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.url

    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to open billing portal')
      setIsErrorModalOpen(true)
      setOpeningPortal(false)
    }
  }

  const handleEmailSuccess = (message: string) => {
    setErrorMessage(message)
    setIsErrorModalOpen(true)
  }

  const handleEmailError = (message: string) => {
    setErrorMessage(message)
    setIsErrorModalOpen(true)
  }

  const currentPlan = userSubscription?.plan_type || 'free'

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">{t('billing.loadingBilling')}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('billing.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('billing.choosePlan')}
        </p>
      </div>

      {/* Current Plan Status */}
      {currentPlan === 'pro' && (
        <Card className="mb-8 bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">
                  {t('billing.currentPlan')}: {t('billing.proPlan')}
                </h3>
                <p className="text-sm text-green-600 dark:text-green-300">
                  {userSubscription?.stripe_customer_id 
                    ? "Manage your subscription, payment methods, and billing history."
                    : "Your Pro plan is active."}
                </p>
              </div>
              {userSubscription?.stripe_customer_id ? (
                <Button 
                  variant="outline" 
                  onClick={handleBillingPortal}
                  disabled={openingPortal}
                  className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/20"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {openingPortal ? t('dashboard.processing') : t('billing.manageBilling')}
                </Button>
              ) : (
                <div className="text-sm text-green-600 dark:text-green-300">
                  Active
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">{t('billing.choosePlan')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getTranslatedPlans(t).map((plan) => {
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
                <div className="py-4">
                  <span className="text-4xl font-bold">
                    {plan.id === 'free' ? t('billing.getStartedFree') : `€${plan.price}`}
                  </span>
                  {plan.id !== 'free' && (
                    <span className="text-muted-foreground">{t('billing.perMonth')}</span>
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
            <div className="py-4">
              <span className="text-4xl font-bold">€12</span>
              <span className="text-muted-foreground">{t('billing.perMonth')}</span>
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
                <span className="text-sm">{t('billing.prioritySupport')}</span>
              </li>
            </ul>

            <Button 
              className="w-full"
              variant="outline"
              onClick={() => setIsTeamNotifyModalOpen(true)}
            >
              {t('billing.notifyWhenAvailable')}
            </Button>
          </CardContent>
        </Card>
        </div>
        
        {/* Billing Reassurance */}
        <div className="mt-12 text-center max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-6">{t('billing.flexibleBilling')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="flex items-start space-x-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{t('billing.cancelAnytime')}</span>
            </div>
            <div className="flex items-start space-x-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{t('billing.instantUpgrades')}</span>
            </div>
            <div className="flex items-start space-x-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{t('billing.proratedBilling')}</span>
            </div>
            <div className="flex items-start space-x-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{t('billing.securePayments')}</span>
            </div>
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

      {/* Error Modal */}
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

      {/* Team Plan Email Notification Dialog */}
      <EmailCollectionModal
        open={isTeamNotifyModalOpen}
        onOpenChange={setIsTeamNotifyModalOpen}
        title="Get Notified"
        description={t('billing.enterEmailForNotification')}
        source="team-plan"
        onSuccess={handleEmailSuccess}
        onError={handleEmailError}
      />
    </div>
  )
}