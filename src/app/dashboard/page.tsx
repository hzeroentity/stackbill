'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { SubscriptionForm } from '@/components/subscriptions/subscription-form'
import { SubscriptionsService } from '@/lib/subscriptions'
import { Subscription } from '@/lib/database.types'
import { getRenewalStatus } from '@/lib/renewal-status'

export default function DashboardPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null)

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
      alert(err instanceof Error ? err.message : 'Failed to delete subscription')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false)
    setSubscriptionToDelete(null)
  }

  const monthlyTotal = subscriptions.length > 0 ? SubscriptionsService.calculateMonthlyTotal(subscriptions) : 0
  const yearlyTotal = subscriptions.length > 0 ? SubscriptionsService.calculateYearlyTotal(subscriptions) : 0
  
  // Sort subscriptions by due date (most imminent first)
  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    return new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime()
  })
  
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

  const formatCurrency = (amount: number, currency?: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount)
  }

  const shouldShowRenewalStatus = (renewalDate: string) => {
    const today = new Date()
    const renewal = new Date(renewalDate)
    const diffTime = renewal.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    // Show status if overdue, due today, or within 7 days
    return diffDays <= 7
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Subscriptions</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Add Subscription</Button>
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
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-red-600">Error: {error}</p>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No subscriptions yet. Add your first subscription to get started!</p>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Add Your First Subscription</Button>
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
          ) : (
            <div className="space-y-3">
              {sortedSubscriptions.map((subscription) => {
                const renewalStatus = getRenewalStatus(subscription.renewal_date)
                return (
                  <div key={subscription.id} className="p-3 bg-muted/50 rounded-lg">
                    {/* Desktop Layout */}
                    <div className="hidden sm:flex items-center justify-between">
                      {/* Left side - Name, Category and Status */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{subscription.name}</p>
                              {shouldShowRenewalStatus(subscription.renewal_date) && (
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
                            <DropdownMenuItem onClick={() => handleEdit(subscription)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(subscription)}
                              className="text-red-600"
                              disabled={deletingId === subscription.id}
                            >
                              Delete
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
                            <p className="font-medium truncate">{subscription.name}</p>
                            {shouldShowRenewalStatus(subscription.renewal_date) && (
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
                            <DropdownMenuItem onClick={() => handleEdit(subscription)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(subscription)}
                              className="text-red-600"
                              disabled={deletingId === subscription.id}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div>
                          <span className="font-semibold">{formatCurrency(subscription.amount, subscription.currency)}</span>
                          <span className="text-muted-foreground capitalize ml-1">
                            {subscription.billing_period}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
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
    </div>
  )
}