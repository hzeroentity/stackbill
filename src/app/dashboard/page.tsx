'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SubscriptionsService } from '@/lib/subscriptions'
import { Subscription } from '@/lib/database.types'

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
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(monthlyTotal)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Annual Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(yearlyTotal)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{subscriptions.length}</p>
          </CardContent>
        </Card>
      </div>

      {upcomingRenewals.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upcoming Renewals (Next 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingRenewals.slice(0, 3).map((subscription) => (
                <div key={subscription.id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="font-medium">{subscription.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(subscription.amount, subscription.currency)} • {formatDate(subscription.renewal_date)}
                    </p>
                  </div>
                </div>
              ))}
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
                <div key={subscription.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
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