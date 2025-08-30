'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SubscriptionsService } from '@/lib/subscriptions'
import { BillingPeriod, Subscription, SubscriptionInsert, SubscriptionCategory } from '@/lib/database.types'
import { SUPPORTED_CURRENCIES, getDefaultCurrency } from '@/lib/currency-preferences'

interface SubscriptionFormProps {
  subscription?: Subscription
  onSuccess?: () => void
  onCancel?: () => void
}

export function SubscriptionForm({ subscription, onSuccess, onCancel }: SubscriptionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Predefined categories for better organization
  const categories: SubscriptionCategory[] = [
    'Cloud & Hosting',
    'Analytics & Tracking',
    'AI & Machine Learning',
    'Database & Storage', 
    'Developer Tools',
    'Communication',
    'Design & Creative',
    'Marketing & SEO',
    'Security',
    'Entertainment',
    'Productivity',
    'Other'
  ]
  
  const [formData, setFormData] = useState({
    name: subscription?.name || '',
    amount: subscription?.amount?.toString() || '',
    currency: subscription?.currency || getDefaultCurrency(),
    billing_period: subscription?.billing_period || 'monthly' as BillingPeriod,
    renewal_date: subscription?.renewal_date ? subscription.renewal_date.split('T')[0] : '',
    category: subscription?.category || 'Other',
  })

  // Update currency when not editing and default currency changes
  useEffect(() => {
    if (!subscription) {
      setFormData(prev => ({ 
        ...prev, 
        currency: getDefaultCurrency() 
      }))
    }
  }, [subscription])

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
        category: formData.category,
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
            <Label htmlFor="name">{t('subscriptions.service')}</Label>
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
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.symbol} {currency.value}
                    </SelectItem>
                  ))}
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
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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