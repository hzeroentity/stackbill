'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SubscriptionsService } from '@/lib/subscriptions'
import { BillingPeriod, Subscription, SubscriptionInsert } from '@/lib/database.types'

interface SubscriptionFormProps {
  subscription?: Subscription
  onSuccess?: () => void
  onCancel?: () => void
}

export function SubscriptionForm({ subscription, onSuccess, onCancel }: SubscriptionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: subscription?.name || '',
    amount: subscription?.amount?.toString() || '',
    currency: subscription?.currency || 'USD',
    billing_period: subscription?.billing_period || 'monthly' as BillingPeriod,
    renewal_date: subscription?.renewal_date ? subscription.renewal_date.split('T')[0] : '',
    description: subscription?.description || '',
    category: subscription?.category || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Validate renewal date is today or in the future
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const renewalDate = new Date(formData.renewal_date)
      
      if (renewalDate < today) {
        throw new Error('Renewal date must be today or in the future')
      }

      const subscriptionData: Omit<SubscriptionInsert, 'user_id'> = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        billing_period: formData.billing_period,
        renewal_date: formData.renewal_date,
        description: formData.description || null,
        category: formData.category || null,
      }

      let result
      if (subscription) {
        result = await SubscriptionsService.update(subscription.id, subscriptionData)
      } else {
        result = await SubscriptionsService.create(subscriptionData)
      }

      if (result.error) {
        throw new Error(result.error.message)
      }

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>
          {subscription ? 'Edit Subscription' : 'Add New Subscription'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              placeholder="e.g., Vercel, Supabase, PostHog, etc."
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="billing_period">Billing Period</Label>
            <Select 
              value={formData.billing_period} 
              onValueChange={(value) => handleInputChange('billing_period', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="renewal_date">Next Renewal Date</Label>
            <Input
              id="renewal_date"
              type="date"
              value={formData.renewal_date}
              onChange={(e) => handleInputChange('renewal_date', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Input
              id="category"
              placeholder="e.g., Hosting, Analytics, Database, etc."
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Any additional notes about this subscription"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : subscription ? 'Update' : 'Add'} Subscription
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="sm:w-auto">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}