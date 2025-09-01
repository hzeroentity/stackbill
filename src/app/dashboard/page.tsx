'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { Badge } from "@/components/ui/badge"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { SubscriptionForm } from '@/components/subscriptions/subscription-form'
import { SubscriptionsService } from '@/lib/subscriptions'
import { Subscription, UserSubscription } from '@/lib/database.types'
import { getRenewalStatus } from '@/lib/renewal-status'
import { canAddSubscription } from '@/lib/plans'
import { getStripe } from '@/lib/stripe'
import { useAuth } from '@/contexts/auth-context'
import { getDefaultCurrency } from '@/lib/currency-preferences'
import { useLanguage } from '@/contexts/language-context'
import { ProjectSwitcher } from '@/components/projects/project-switcher'
import { ProjectsService, ALL_PROJECTS_ID, GENERAL_PROJECT_ID } from '@/lib/projects'

export default function DashboardPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [allSubscriptions, setAllSubscriptions] = useState<Subscription[]>([]) // Store all subscriptions for filtering
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Project state
  const [selectedProject, setSelectedProject] = useState(ALL_PROJECTS_ID)
  const [subscriptionCounts, setSubscriptionCounts] = useState<Record<string, number>>({})
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null)
  const [upgrading, setUpgrading] = useState(false)
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  // Currency conversion state
  const [monthlyTotal, setMonthlyTotal] = useState(0)
  const [yearlyTotal, setYearlyTotal] = useState(0)
  const [spendingByCategory, setSpendingByCategory] = useState<Record<string, number>>({})
  const [averagePerService, setAveragePerService] = useState(0)
  const [mostExpensive, setMostExpensive] = useState(0)
  const [leastExpensive, setLeastExpensive] = useState(0)
  const [mostExpensiveId, setMostExpensiveId] = useState<string | null>(null)
  const [leastExpensiveId, setLeastExpensiveId] = useState<string | null>(null)
  const [conversionsLoading, setConversionsLoading] = useState(false)
  const { user } = useAuth()
  const { t } = useLanguage()
  
  // Use stable user ID to prevent unnecessary re-renders
  const userId = user?.id

  // Filter subscriptions based on selected project
  const filterSubscriptionsByProject = useCallback((subs: Subscription[], projectId: string): Subscription[] => {
    if (projectId === ALL_PROJECTS_ID) {
      return subs // Show all subscriptions
    }
    
    if (projectId === GENERAL_PROJECT_ID) {
      return subs.filter(sub => sub.project_id === null) // Show only general subscriptions
    }
    
    // Show subscriptions for specific project + general ones
    return subs.filter(sub => sub.project_id === projectId || sub.project_id === null)
  }, [])

  // Handle project selection change
  const handleProjectChange = useCallback((projectId: string) => {
    setSelectedProject(projectId)
    // The useEffect will handle filtering automatically
  }, [])

  const calculateConvertedTotals = useCallback(async (subs: Subscription[]) => {
    setConversionsLoading(true)
    try {
      const [monthly, yearly, categorySpending] = await Promise.all([
        SubscriptionsService.calculateMonthlyTotalWithConversion(subs),
        SubscriptionsService.calculateYearlyTotalWithConversion(subs),
        SubscriptionsService.calculateCategorySpendingWithConversion(subs)
      ])
      
      // Calculate converted amounts for each subscription
      const convertedAmounts = await Promise.all(
        subs.map(sub => SubscriptionsService.convertSubscriptionMonthlyAmount(sub))
      )
      
      setMonthlyTotal(monthly)
      setYearlyTotal(yearly)
      setSpendingByCategory(categorySpending)
      
      if (convertedAmounts.length > 0) {
        setAveragePerService(monthly / subs.length)
        const maxAmount = Math.max(...convertedAmounts)
        const minAmount = Math.min(...convertedAmounts)
        setMostExpensive(maxAmount)
        setLeastExpensive(minAmount)
        
        // Find subscription IDs for most/least expensive
        const maxIndex = convertedAmounts.indexOf(maxAmount)
        const minIndex = convertedAmounts.indexOf(minAmount)
        setMostExpensiveId(subs[maxIndex]?.id || null)
        setLeastExpensiveId(subs[minIndex]?.id || null)
      } else {
        setAveragePerService(0)
        setMostExpensive(0)
        setLeastExpensive(0)
        setMostExpensiveId(null)
        setLeastExpensiveId(null)
      }
    } catch (error) {
      console.error('Error calculating converted totals:', error)
      // Fallback to non-converted calculations
      const monthly = SubscriptionsService.calculateMonthlyTotal(subs)
      const yearly = SubscriptionsService.calculateYearlyTotal(subs)
      
      setMonthlyTotal(monthly)
      setYearlyTotal(yearly)
      
      const fallbackSpending = subs.reduce((acc, sub) => {
        const category = sub.category || 'Other'
        const monthlyAmount = SubscriptionsService.calculateMonthlyTotal([sub])
        acc[category] = (acc[category] || 0) + monthlyAmount
        return acc
      }, {} as Record<string, number>)
      setSpendingByCategory(fallbackSpending)
      
      // Fallback min/max calculations
      if (subs.length > 0) {
        const amounts = subs.map(s => SubscriptionsService.calculateMonthlyTotal([s]))
        setAveragePerService(monthly / subs.length)
        const maxAmount = Math.max(...amounts)
        const minAmount = Math.min(...amounts)
        setMostExpensive(maxAmount)
        setLeastExpensive(minAmount)
        
        // Find subscription IDs for most/least expensive (fallback)
        const maxIndex = amounts.indexOf(maxAmount)
        const minIndex = amounts.indexOf(minAmount)
        setMostExpensiveId(subs[maxIndex]?.id || null)
        setLeastExpensiveId(subs[minIndex]?.id || null)
      }
    } finally {
      setConversionsLoading(false)
    }
  }, [])

  const fetchSubscriptions = useCallback(async () => {
    if (!userId) {
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // Fetch all subscriptions (including canceled ones)
      const subscriptionResult = await SubscriptionsService.getAllIncludingInactive()
      
      if (subscriptionResult.error) {
        throw new Error(subscriptionResult.error.message)
      }

      // Store all subscriptions for filtering
      setAllSubscriptions(subscriptionResult.data || [])

      // Get subscription counts for project switcher
      if (userSubscription?.plan_type === 'pro') {
        const counts = await ProjectsService.getProjectSubscriptionCounts(userId)
        setSubscriptionCounts(counts)
      }

      const fetchedSubscriptions = subscriptionResult.data || []
      // Don't filter here - let the separate useEffect handle filtering
      setSubscriptions(fetchedSubscriptions)
      
      // Calculate converted totals only for active subscriptions
      const activeSubscriptions = fetchedSubscriptions.filter(sub => sub.is_active)
      if (activeSubscriptions.length > 0) {
        await calculateConvertedTotals(activeSubscriptions)
      }
      
      // Try to fetch user plan data via API
      try {
        const response = await fetch(`/api/user-subscription?userId=${userId}`)
        if (response.ok) {
          const { userSubscription: userSub } = await response.json()
          setUserSubscription(userSub)
        } else if (response.status === 401) {
          // User not authenticated, provide default free subscription
          console.warn('User not authenticated, using default subscription')
          setUserSubscription({
            id: 'temp',
            user_id: userId,
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
      } catch (userSubError) {
        console.warn('User subscription service not available yet:', userSubError)
        // Create a default free plan user subscription
        setUserSubscription({
          id: 'temp',
          user_id: userId,
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [userId, calculateConvertedTotals, userSubscription])

  useEffect(() => {
    if (userId) {
      fetchSubscriptions()
    }
  }, [userId]) // Removed fetchSubscriptions dependency to prevent loop

  // Separate effect for filtering subscriptions when allSubscriptions or selectedProject changes
  useEffect(() => {
    if (allSubscriptions.length > 0) {
      let filteredSubs
      if (selectedProject === ALL_PROJECTS_ID) {
        filteredSubs = allSubscriptions // Show all subscriptions
      } else if (selectedProject === GENERAL_PROJECT_ID) {
        filteredSubs = allSubscriptions.filter(sub => sub.project_id === null) // Show only general subscriptions
      } else {
        // Show ONLY subscriptions for specific project (NOT general ones)
        filteredSubs = allSubscriptions.filter(sub => sub.project_id === selectedProject)
      }
      setSubscriptions(filteredSubs)
    }
  }, [allSubscriptions, selectedProject])

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false)
    fetchSubscriptions()
  }

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false)
    setEditingSubscription(null)
    fetchSubscriptions()
  }

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setIsEditDialogOpen(true)
  }

  const handleDeleteClick = (subscription: Subscription) => {
    setSubscriptionToDelete(subscription)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!subscriptionToDelete) return

    setDeletingId(subscriptionToDelete.id)
    
    try {
      const { error } = await SubscriptionsService.delete(subscriptionToDelete.id)
      if (error) {
        throw new Error(error.message)
      }
      fetchSubscriptions()
      setIsDeleteModalOpen(false)
      setSubscriptionToDelete(null)
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to delete subscription')
      setIsErrorModalOpen(true)
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false)
    setSubscriptionToDelete(null)
  }

  const handleCancel = async (subscription: Subscription) => {
    try {
      const { error } = await SubscriptionsService.softDelete(subscription.id)
      if (error) {
        throw new Error(error.message)
      }
      fetchSubscriptions()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to cancel subscription')
      setIsErrorModalOpen(true)
    }
  }

  const handleReactivate = async (subscription: Subscription) => {
    try {
      const { error } = await SubscriptionsService.reactivate(subscription.id)
      if (error) {
        throw new Error(error.message)
      }
      fetchSubscriptions()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to reactivate subscription')
      setIsErrorModalOpen(true)
    }
  }

  const handleUpgradeToPro = async () => {
    setUpgrading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId: 'pro', userId: user?.id }),
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
      setUpgrading(false)
    }
  }

  const handleAddSubscription = () => {
    const currentPlan = userSubscription?.plan_type || 'free'
    const activeCount = subscriptions.filter(sub => sub.is_active).length
    
    if (!canAddSubscription(activeCount, currentPlan)) {
      // Show upgrade prompt instead of opening add dialog
      setIsUpgradeModalOpen(true)
      return
    }
    
    setIsAddDialogOpen(true)
  }

  const handleUpgradeConfirm = () => {
    setIsUpgradeModalOpen(false)
    handleUpgradeToPro()
  }

  const handleUpgradeCancel = () => {
    setIsUpgradeModalOpen(false)
  }

  const scrollToSubscription = (subscriptionId: string | null) => {
    if (!subscriptionId) return
    
    const element = document.getElementById(`subscription-${subscriptionId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      
      // Add highlight animation
      element.style.transform = 'scale(1.02)'
      element.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)'
      element.style.transition = 'all 0.3s ease'
      
      setTimeout(() => {
        element.style.transform = 'scale(1)'
        element.style.boxShadow = 'none'
      }, 1000)
    }
  }
  
  // Separate active and inactive subscriptions
  const activeSubscriptions = subscriptions.filter(sub => sub.is_active)
  const inactiveSubscriptions = subscriptions.filter(sub => !sub.is_active)
  
  // Sort active subscriptions by due date (most imminent first)
  const sortedActiveSubscriptions = [...activeSubscriptions].sort((a, b) => {
    return new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime()
  })
  
  // Sort inactive subscriptions by name
  const sortedInactiveSubscriptions = [...inactiveSubscriptions].sort((a, b) => {
    return a.name.localeCompare(b.name)
  })
  
  const topCategories = Object.entries(spendingByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const formatCurrency = (amount: number, currency?: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || getDefaultCurrency(),
    }).format(amount)
  }

  const formatCurrencyForDashboard = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: getDefaultCurrency(),
    }).format(amount)
  }

  const shouldShowRenewalStatus = (renewalStatus: { text: string }) => {
    // Show status only if text is not empty
    return renewalStatus.text !== ''
  }


  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold">{t('dashboard.title')}</h1>
          {userSubscription && (
            <Badge 
              variant={userSubscription.plan_type === 'pro' ? 'default' : 'secondary'}
              className={
                userSubscription.plan_type === 'pro' 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }
            >
              {userSubscription.plan_type.toUpperCase()}
            </Badge>
          )}
          {conversionsLoading && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>
              Converting...
            </div>
          )}
        </div>
        
        {/* Project Switcher */}
        <ProjectSwitcher
          selectedProject={selectedProject}
          onProjectChange={handleProjectChange}
          isPro={userSubscription?.plan_type === 'pro'}
          subscriptionCounts={subscriptionCounts}
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-950/20 dark:to-blue-900/20 dark:border dark:border-blue-600/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">{t('dashboard.monthlyTotal')}</CardTitle>
            <Image 
              src="/stackbill-creditcard.svg" 
              alt="Credit Card" 
              width={32} 
              height={32} 
              className="text-blue-600 dark:text-white"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-white">
              <AnimatedCounter 
                value={monthlyTotal} 
                duration={400}
                formatValue={(value) => formatCurrencyForDashboard(value)}
              />
            </div>
            <p className="text-xs text-blue-600 dark:text-white/80 mt-1">
              {t('dashboard.perMonthAverage')}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 dark:from-green-950/20 dark:to-green-900/20 dark:border dark:border-green-600/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">{t('dashboard.annualTotal')}</CardTitle>
            <Image 
              src="/stackbill-moneybag.svg" 
              alt="Money Bag" 
              width={32} 
              height={32} 
              className="text-green-600 dark:text-white"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-white">
              <AnimatedCounter 
                value={yearlyTotal} 
                duration={450}
                formatValue={(value) => formatCurrencyForDashboard(value)}
              />
            </div>
            <p className="text-xs text-green-600 dark:text-white/80 mt-1">
              {t('dashboard.totalYearlyCost')}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 dark:from-purple-950/20 dark:to-purple-900/20 dark:border dark:border-purple-600/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
            <CardTitle className="text-sm font-medium">{t('dashboard.activeServices')}</CardTitle>
            <Image 
              src="/stackbill-lightning.svg" 
              alt="Lightning" 
              width={32} 
              height={32} 
              className="text-purple-600 dark:text-white"
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-white">
              <AnimatedCounter 
                value={activeSubscriptions.length} 
                duration={300}
              />
              {userSubscription?.plan_type === 'free' && (
                <span className="text-lg text-purple-600 dark:text-white/80 ml-1">/ 3</span>
              )}
              {userSubscription?.plan_type === 'pro' && (
                <span className="text-lg text-purple-600 dark:text-white/80 ml-1">/ 30</span>
              )}
            </div>
            <p className="text-xs text-purple-600 dark:text-white/80 mt-1">
              {userSubscription?.plan_type === 'free' 
                ? `${3 - activeSubscriptions.length} ${t('dashboard.remainingFree')}`
                : userSubscription?.plan_type === 'pro'
                  ? `${t('dashboard.onProPlan')}`
                  : 'Subscriptions tracked'
              }
            </p>
            {userSubscription?.plan_type === 'free' && activeSubscriptions.length >= 2 && (
              <Button
                onClick={handleUpgradeToPro}
                disabled={upgrading}
                size="sm"
                className="mt-2 w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
              >
                {upgrading ? t('dashboard.upgrading') : t('dashboard.upgradeToPro')}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Spending by Category */}
      {topCategories.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Top Categories (Monthly)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCategories.map(([category, amount], index) => {
                  const percentage = monthlyTotal > 0 ? (amount / monthlyTotal) * 100 : 0
                  const colors = [
                    'bg-blue-500 dark:bg-blue-400',
                    'bg-green-500 dark:bg-green-400',
                    'bg-purple-500 dark:bg-purple-400',
                    'bg-orange-500 dark:bg-orange-400',
                    'bg-pink-500 dark:bg-pink-400'
                  ]
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${colors[index] || 'bg-gray-500 dark:bg-gray-400'}`}></div>
                        <span className="font-medium">{category}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                          <div 
                            className={`h-2 rounded-full ${colors[index] || 'bg-gray-500 dark:bg-gray-400'}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium min-w-16 text-right">
                          {formatCurrencyForDashboard(amount)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.spendingOverview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg dark:bg-orange-900/30 dark:border dark:border-orange-700/50">
                  <span className="text-sm font-medium dark:text-white">{t('dashboard.averagePerService')}</span>
                  <span className="font-semibold dark:text-white">
                    <AnimatedCounter 
                      value={averagePerService} 
                      duration={350}
                      formatValue={(value) => formatCurrencyForDashboard(value)}
                    />
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg dark:bg-red-900/30 dark:border dark:border-red-700/50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium dark:text-white">{t('dashboard.mostExpensive')}</span>
                    {mostExpensiveId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => scrollToSubscription(mostExpensiveId)}
                        className="h-6 w-6 p-0 hover:bg-red-200 dark:hover:bg-red-800 cursor-pointer"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </Button>
                    )}
                  </div>
                  <span className="font-semibold dark:text-white">
                    <AnimatedCounter 
                      value={mostExpensive}
                      duration={400}
                      formatValue={(value) => formatCurrencyForDashboard(value)}
                    />
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg dark:bg-yellow-900/30 dark:border dark:border-yellow-700/50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium dark:text-white">{t('dashboard.leastExpensive')}</span>
                    {leastExpensiveId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => scrollToSubscription(leastExpensiveId)}
                        className="h-6 w-6 p-0 hover:bg-yellow-200 dark:hover:bg-yellow-800 cursor-pointer"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </Button>
                    )}
                  </div>
                  <span className="font-semibold dark:text-white">
                    <AnimatedCounter 
                      value={leastExpensive}
                      duration={350}
                      formatValue={(value) => formatCurrencyForDashboard(value)}
                    />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('dashboard.activeSubscriptions')}</CardTitle>
          <div className="flex items-center gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    handleAddSubscription()
                  }}
                >
                  {t('dashboard.addSubscription')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Subscription</DialogTitle>
                </DialogHeader>
                <SubscriptionForm 
                  onSuccess={handleAddSuccess}
                  onCancel={() => setIsAddDialogOpen(false)}
                  isPro={userSubscription?.plan_type === 'pro'}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-red-600 dark:text-red-400">Error: {error}</p>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-foreground mb-2">{t('dashboard.startTracking')}</h3>
                <p className="text-muted-foreground mb-1">{t('dashboard.clickAddButton')}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Active Subscriptions */}
              {sortedActiveSubscriptions.map((subscription) => {
                const renewalStatus = getRenewalStatus(subscription.renewal_date, subscription.billing_period)
                return (
                  <div key={subscription.id} id={`subscription-${subscription.id}`} className="p-3 bg-muted/50 rounded-lg">
                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-center justify-between">
                      {/* Left side - Name, Category and Status */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{subscription.name}</p>
                              {shouldShowRenewalStatus(renewalStatus) && (
                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${renewalStatus.color}`}>
                                  <span>{renewalStatus.icon}</span>
                                  <span>{renewalStatus.text}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{subscription.category}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right side - Price, Due Date, and Menu */}
                      <div className="flex items-center gap-4 ml-4">
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(subscription.amount, subscription.currency)}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {subscription.billing_period}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                              <span className="sr-only">Open menu</span>
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {subscription.id !== 'stackbill-pro' && (
                              <>
                                <DropdownMenuItem onClick={() => handleEdit(subscription)} className="cursor-pointer flex items-center gap-2">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  {t('dashboard.edit')}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleCancel(subscription)}
                                  className="text-amber-600 dark:text-amber-400 cursor-pointer flex items-center gap-2"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Cancel
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteClick(subscription)}
                                  className="text-red-600 dark:text-red-400 cursor-pointer flex items-center gap-2"
                                  disabled={deletingId === subscription.id}
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  {t('dashboard.delete')}
                                </DropdownMenuItem>
                              </>
                            )}
                            {subscription.id === 'stackbill-pro' && (
                              <DropdownMenuItem disabled className="text-gray-400 dark:text-gray-500">
                                Pro Plan Service
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Mobile Layout */}
                    <div className="sm:hidden">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium truncate">{subscription.name}</p>
                            {shouldShowRenewalStatus(renewalStatus) && (
                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${renewalStatus.color}`}>
                                <span>{renewalStatus.icon}</span>
                                <span>{renewalStatus.text}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{subscription.category}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                              <span className="sr-only">Open menu</span>
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {subscription.id !== 'stackbill-pro' && (
                              <>
                                <DropdownMenuItem onClick={() => handleEdit(subscription)} className="cursor-pointer flex items-center gap-2">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  {t('dashboard.edit')}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleCancel(subscription)}
                                  className="text-amber-600 dark:text-amber-400 cursor-pointer flex items-center gap-2"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Cancel
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteClick(subscription)}
                                  className="text-red-600 dark:text-red-400 cursor-pointer flex items-center gap-2"
                                  disabled={deletingId === subscription.id}
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  {t('dashboard.delete')}
                                </DropdownMenuItem>
                              </>
                            )}
                            {subscription.id === 'stackbill-pro' && (
                              <DropdownMenuItem disabled className="text-gray-400 dark:text-gray-500">
                                Pro Plan Service
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div>
                          <span className="font-semibold dark:text-white">{formatCurrency(subscription.amount, subscription.currency)}</span>
                          <span className="text-muted-foreground capitalize ml-1">
                            {subscription.billing_period}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {/* Inactive (Canceled) Subscriptions */}
              {sortedInactiveSubscriptions.length > 0 && (
                <>
                  <div className="border-t border-muted-foreground/20 my-6 pt-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Canceled Subscriptions</h3>
                  </div>
                  {sortedInactiveSubscriptions.map((subscription) => (
                    <div key={subscription.id} id={`subscription-${subscription.id}`} className="p-3 bg-muted/30 rounded-lg opacity-60">
                      {/* Desktop Layout */}
                      <div className="hidden sm:flex items-center justify-between">
                        {/* Left side - Name, Category with strikethrough */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate line-through text-muted-foreground">{subscription.name}</p>
                                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
                                  <span>🚫</span>
                                  <span>Canceled</span>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground opacity-75">{subscription.category}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Right side - Price, Menu */}
                        <div className="flex items-center gap-4 ml-4">
                          <div className="text-right opacity-75">
                            <p className="font-semibold line-through text-muted-foreground">{formatCurrency(subscription.amount, subscription.currency)}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {subscription.billing_period}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                                <span className="sr-only">Open menu</span>
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleReactivate(subscription)}
                                className="text-green-600 dark:text-green-400 cursor-pointer"
                              >
                                Reactivate
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(subscription)}
                                className="text-red-600 dark:text-red-400 cursor-pointer"
                                disabled={deletingId === subscription.id}
                              >
                                {t('dashboard.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Mobile Layout */}
                      <div className="sm:hidden">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium truncate line-through text-muted-foreground">{subscription.name}</p>
                              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400">
                                <span>🚫</span>
                                <span>Canceled</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground opacity-75">{subscription.category}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                                <span className="sr-only">Open menu</span>
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleReactivate(subscription)}
                                className="text-green-600 dark:text-green-400 cursor-pointer"
                              >
                                Reactivate
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(subscription)}
                                className="text-red-600 dark:text-red-400 cursor-pointer"
                                disabled={deletingId === subscription.id}
                              >
                                {t('dashboard.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex justify-between items-center text-sm opacity-75">
                          <div>
                            <span className="font-semibold line-through text-muted-foreground">{formatCurrency(subscription.amount, subscription.currency)}</span>
                            <span className="text-muted-foreground capitalize ml-1">
                              {subscription.billing_period}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
          </DialogHeader>
          {editingSubscription && (
            <SubscriptionForm 
              subscription={editingSubscription}
              onSuccess={handleEditSuccess}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setEditingSubscription(null)
              }}
              isPro={userSubscription?.plan_type === 'pro'}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              {subscriptionToDelete ? `Are you sure you want to delete "${subscriptionToDelete.name}"? This action cannot be undone.` : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={subscriptionToDelete ? deletingId === subscriptionToDelete.id : false}
            >
              {subscriptionToDelete && deletingId === subscriptionToDelete.id ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Upgrade Confirmation Dialog */}
      <AlertDialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upgrade to Pro</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ve reached your subscription limit (3 for free plan). Upgrade to Pro ($4/month) to track up to 30 subscriptions with email reminders?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleUpgradeCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUpgradeConfirm} 
              disabled={upgrading}
              className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
            >
              {upgrading ? 'Processing...' : 'Upgrade to Pro'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
    </div>
  )
}