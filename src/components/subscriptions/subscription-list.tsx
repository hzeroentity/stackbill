'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { Subscription } from '@/lib/database.types'
import { SubscriptionsService } from '@/lib/subscriptions'
import { getRenewalStatus } from '@/lib/renewal-status'

interface SubscriptionListProps {
  subscriptions: Subscription[]
  onEdit?: (subscription: Subscription) => void
  onDelete?: () => void
}

export function SubscriptionList({ subscriptions, onEdit, onDelete }: SubscriptionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)

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
      onDelete?.()
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

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
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
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  {/* Mobile: Stack vertically, Desktop: Side by side */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{subscription.name}</h3>
                      {subscription.category && (
                        <p className="text-sm text-muted-foreground">{subscription.category}</p>
                      )}
                    </div>
                    <div className="sm:text-right">
                      <p className="font-semibold text-lg">
                        {formatCurrency(subscription.amount, subscription.currency)}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        per {subscription.billing_period.replace('ly', '')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div>
                      <div className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold ${renewalStatus.color}`}>
                        <span>{renewalStatus.icon}</span>
                        <span>{renewalStatus.text}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Renews on {formatDate(subscription.renewal_date)}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit?.(subscription)}
                        className="flex-1 sm:flex-none"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(subscription)}
                        disabled={deletingId === subscription.id}
                        className="flex-1 sm:flex-none"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

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