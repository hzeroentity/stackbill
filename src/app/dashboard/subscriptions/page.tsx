'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { SubscriptionForm } from '@/components/subscriptions/subscription-form'
import { SubscriptionList } from '@/components/subscriptions/subscription-list'
import { SubscriptionsService } from '@/lib/subscriptions'
import { Subscription } from '@/lib/database.types'

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscriptions = async () => {
    setLoading(true)
    setError(null)
    
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

  useEffect(() => {
    fetchSubscriptions()
  }, [])

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

  const handleDelete = () => {
    fetchSubscriptions()
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading subscriptions...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchSubscriptions}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Manage Subscriptions</h1>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Subscription</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subscription</DialogTitle>
            </DialogHeader>
            <SubscriptionForm 
              onSuccess={handleAddSuccess}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <SubscriptionList 
        subscriptions={subscriptions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

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
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}