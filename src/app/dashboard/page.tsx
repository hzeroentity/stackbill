'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SubscriptionsService } from '@/lib/subscriptions'
import { Subscription } from '@/lib/database.types'
import { getRenewalStatus } from '@/lib/renewal-status'

export default function DashboardPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const { data, error } = await SubscriptionsService.getAll()
        if (error) {
          throw new Error(error.message)
        }
        setSubscriptions(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subscriptions')
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptions()
  }, [])

  const monthlyTotal = subscriptions.length > 0 ? SubscriptionsService.calculateMonthlyTotal(subscriptions) : 0
  const yearlyTotal = subscriptions.length > 0 ? SubscriptionsService.calculateYearlyTotal(subscriptions) : 0
  const upcomingRenewals = subscriptions.length > 0 ? SubscriptionsService.getUpcomingRenewals(subscriptions, 7) : []
  
  // Calculate spending by category
  const spendingByCategory = subscriptions.reduce((acc, sub) => {
    const category = sub.category || 'Other'
    const monthlyAmount = SubscriptionsService.calculateMonthlyTotal([sub])
    acc[category] = (acc[category] || 0) + monthlyAmount
    return acc
  }, {} as Record<string, number>)
  
  const topCategories = Object.entries(spendingByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
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
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
            <div className="text-blue-600">💳</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(monthlyTotal)}</div>
            <p className="text-xs text-blue-600 mt-1">
              Per month average
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Total</CardTitle>
            <div className="text-green-600">📊</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{formatCurrency(yearlyTotal)}</div>
            <p className="text-xs text-green-600 mt-1">
              Total yearly cost
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <div className="text-purple-600">⚡</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{subscriptions.length}</div>
            <p className="text-xs text-purple-600 mt-1">
              Services tracked
            </p>
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
                    'bg-blue-500',
                    'bg-green-500',
                    'bg-purple-500',
                    'bg-orange-500',
                    'bg-pink-500'
                  ]
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${colors[index] || 'bg-gray-500'}`}></div>
                        <span className="font-medium">{category}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${colors[index] || 'bg-gray-500'}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium min-w-16 text-right">
                          {formatCurrency(amount)}
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
              <CardTitle>Spending Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Average per service</span>
                  <span className="font-semibold">
                    {formatCurrency(subscriptions.length > 0 ? monthlyTotal / subscriptions.length : 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Most expensive</span>
                  <span className="font-semibold">
                    {subscriptions.length > 0 
                      ? formatCurrency(Math.max(...subscriptions.map(s => SubscriptionsService.calculateMonthlyTotal([s]))))
                      : formatCurrency(0)
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium">Least expensive</span>
                  <span className="font-semibold">
                    {subscriptions.length > 0 
                      ? formatCurrency(Math.min(...subscriptions.map(s => SubscriptionsService.calculateMonthlyTotal([s]))))
                      : formatCurrency(0)
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {upcomingRenewals.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upcoming Renewals (Next 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingRenewals.slice(0, 3).map((subscription) => {
                const renewalStatus = getRenewalStatus(subscription.renewal_date)
                return (
                  <div key={subscription.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-card border rounded-lg space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <p className="font-medium">{subscription.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(subscription.amount, subscription.currency)} • {formatDate(subscription.renewal_date)}
                      </p>
                    </div>
                    <div className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold ${renewalStatus.color}`}>
                      <span>{renewalStatus.icon}</span>
                      <span>{renewalStatus.text}</span>
                    </div>
                  </div>
                )
              })}
              {upcomingRenewals.length > 3 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  +{upcomingRenewals.length - 3} more renewals
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Subscriptions</CardTitle>
          <Link href="/dashboard/subscriptions">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-red-600">Error: {error}</p>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No subscriptions yet. Add your first subscription to get started!</p>
              <Link href="/dashboard/subscriptions">
                <Button>Add Your First Subscription</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {subscriptions.slice(0, 5).map((subscription) => (
                <div key={subscription.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-muted/50 rounded-lg space-y-2 sm:space-y-0">
                  <div>
                    <p className="font-medium">{subscription.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Next renewal: {formatDate(subscription.renewal_date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(subscription.amount, subscription.currency)}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {subscription.billing_period}
                    </p>
                  </div>
                </div>
              ))}
              {subscriptions.length > 5 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  +{subscriptions.length - 5} more subscriptions
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}