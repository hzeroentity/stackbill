'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Subscription } from '@/lib/database.types'
import { SubscriptionsService } from '@/lib/subscriptions'

interface SubscriptionListProps {
  subscriptions: Subscription[]
  onEdit?: (subscription: Subscription) => void
  onDelete?: () => void
}

export function SubscriptionList({ subscriptions, onEdit, onDelete }: SubscriptionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (subscription: Subscription) => {
    if (!confirm(`Are you sure you want to delete "${subscription.name}"?`)) {
      return
    }

    setDeletingId(subscription.id)
    
    try {
      const { error } = await SubscriptionsService.delete(subscription.id)
      if (error) {
        throw new Error(error.message)
      }
      onDelete?.()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete subscription')
    } finally {
      setDeletingId(null)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getRenewalStatus = (renewalDate: string) => {
    const today = new Date()
    const renewal = new Date(renewalDate)
    const diffTime = renewal.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { text: 'Overdue', color: 'text-red-600 bg-red-50' }
    } else if (diffDays === 0) {
      return { text: 'Due Today', color: 'text-orange-600 bg-orange-50' }
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`, color: 'text-yellow-600 bg-yellow-50' }
    } else {
      return { text: `Due in ${diffDays} days`, color: 'text-green-600 bg-green-50' }
    }
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-muted-foreground">No subscriptions yet</h3>
            <p className="text-sm text-muted-foreground">Add your first subscription to get started tracking your expenses.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {subscriptions.map((subscription) => {
        const renewalStatus = getRenewalStatus(subscription.renewal_date)
        
        return (
          <Card key={subscription.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-semibold text-lg">{subscription.name}</h3>
                      {subscription.category && (
                        <p className="text-sm text-muted-foreground">{subscription.category}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        {formatCurrency(subscription.amount, subscription.currency)}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        per {subscription.billing_period.replace('ly', '')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${renewalStatus.color}`}>
                        {renewalStatus.text}
                      </span>
                      <p className="text-sm text-muted-foreground mt-1">
                        Renews on {formatDate(subscription.renewal_date)}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit?.(subscription)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(subscription)}
                        disabled={deletingId === subscription.id}
                      >
                        {deletingId === subscription.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {subscription.description && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">{subscription.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}