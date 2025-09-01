import { supabase } from './supabase'
import { Subscription, SubscriptionInsert, SubscriptionUpdate, SubscriptionWithProjects, Project } from './database.types'
import { ExchangeRateService } from './exchange-rates'
import { Currency, getDefaultCurrency } from './currency-preferences'

export class SubscriptionsService {
  static async getAll(): Promise<{ data: Subscription[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('is_active', true)
        .order('renewal_date', { ascending: true })
      
      return { data, error }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error occurred') }
    }
  }

  static async getAllIncludingInactive(): Promise<{ data: Subscription[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .order('is_active', { ascending: false })
        .order('renewal_date', { ascending: true })
      
      return { data, error }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error occurred') }
    }
  }

  // Get all subscriptions with their project relationships
  static async getAllWithProjects(): Promise<{ data: SubscriptionWithProjects[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_projects (
            projects (*)
          )
        `)
        .eq('is_active', true)
        .order('renewal_date', { ascending: true })
      
      if (error) {
        return { data: null, error }
      }

      // Transform the data to match SubscriptionWithProjects type
      const subscriptionsWithProjects: SubscriptionWithProjects[] = (data || []).map(sub => ({
        ...sub,
        projects: sub.subscription_projects?.map((sp: { projects: Project }) => sp.projects).filter(Boolean) || []
      }))
      
      return { data: subscriptionsWithProjects, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error occurred') }
    }
  }

  static async getAllWithProjectsIncludingInactive(): Promise<{ data: SubscriptionWithProjects[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_projects (
            projects (*)
          )
        `)
        .order('is_active', { ascending: false })
        .order('renewal_date', { ascending: true })
      
      if (error) {
        return { data: null, error }
      }

      // Transform the data to match SubscriptionWithProjects type
      const subscriptionsWithProjects: SubscriptionWithProjects[] = (data || []).map(sub => ({
        ...sub,
        projects: sub.subscription_projects?.map((sp: { projects: Project }) => sp.projects).filter(Boolean) || []
      }))
      
      return { data: subscriptionsWithProjects, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error occurred') }
    }
  }

  static async getById(id: string): Promise<{ data: Subscription | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', id)
        .single()
      
      return { data, error }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error occurred') }
    }
  }

  static async create(subscription: Omit<SubscriptionInsert, 'user_id'>): Promise<{ data: Subscription | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { data: null, error: new Error('User not authenticated') }
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          ...subscription,
          user_id: user.id
        })
        .select()
        .single()
      
      return { data, error }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error occurred') }
    }
  }

  static async update(id: string, updates: SubscriptionUpdate): Promise<{ data: Subscription | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      return { data, error }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error : new Error('Unknown error occurred') }
    }
  }

  static async delete(id: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
      
      return { error: error ? new Error(error.message || 'Failed to delete subscription') : null }
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Unknown error occurred') }
    }
  }

  static async softDelete(id: string): Promise<{ data: Subscription | null; error: Error | null }> {
    return this.update(id, { is_active: false })
  }

  static async reactivate(id: string): Promise<{ data: Subscription | null; error: Error | null }> {
    return this.update(id, { is_active: true })
  }

  // Helper methods for calculating totals
  static calculateMonthlyTotal(subscriptions: Subscription[]): number {
    return subscriptions.reduce((total, sub) => {
      if (!sub.is_active) return total
      
      switch (sub.billing_period) {
        case 'monthly':
          return total + sub.amount
        case 'yearly':
          return total + (sub.amount / 12)
        case 'quarterly':
          return total + (sub.amount / 3)
        case 'weekly':
          return total + (sub.amount * 4.33) // Average weeks per month
        default:
          return total
      }
    }, 0)
  }

  static calculateYearlyTotal(subscriptions: Subscription[]): number {
    return subscriptions.reduce((total, sub) => {
      if (!sub.is_active) return total
      
      switch (sub.billing_period) {
        case 'monthly':
          return total + (sub.amount * 12)
        case 'yearly':
          return total + sub.amount
        case 'quarterly':
          return total + (sub.amount * 4)
        case 'weekly':
          return total + (sub.amount * 52)
        default:
          return total
      }
    }, 0)
  }

  static getUpcomingRenewals(subscriptions: Subscription[], days: number = 7): Subscription[] {
    const today = new Date()
    const futureDate = new Date()
    futureDate.setDate(today.getDate() + days)

    return subscriptions.filter(sub => {
      if (!sub.is_active) return false
      const renewalDate = new Date(sub.renewal_date)
      return renewalDate >= today && renewalDate <= futureDate
    }).sort((a, b) => new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime())
  }

  // Currency-aware calculation methods
  static async calculateMonthlyTotalWithConversion(
    subscriptions: Subscription[], 
    targetCurrency?: Currency
  ): Promise<number> {
    const target = targetCurrency || getDefaultCurrency()
    let total = 0

    // Group subscriptions by currency for efficient API calls
    const byCurrency = subscriptions
      .filter(sub => sub.is_active)
      .reduce((groups, sub) => {
        const currency = sub.currency as Currency
        if (!groups[currency]) groups[currency] = []
        groups[currency].push(sub)
        return groups
      }, {} as Record<Currency, Subscription[]>)

    // Convert each currency group
    for (const [currency, subs] of Object.entries(byCurrency)) {
      const currencyTotal = this.calculateMonthlyTotal(subs)
      
      if (currency === target) {
        total += currencyTotal
      } else {
        try {
          const convertedAmount = await ExchangeRateService.convertAmount(
            currencyTotal,
            currency as Currency,
            target
          )
          total += convertedAmount
        } catch (error) {
          console.error(`Failed to convert ${currency} to ${target}:`, error)
          // Fallback: add unconverted amount
          total += currencyTotal
        }
      }
    }

    return total
  }

  static async calculateYearlyTotalWithConversion(
    subscriptions: Subscription[], 
    targetCurrency?: Currency
  ): Promise<number> {
    const target = targetCurrency || getDefaultCurrency()
    let total = 0

    // Group subscriptions by currency for efficient API calls
    const byCurrency = subscriptions
      .filter(sub => sub.is_active)
      .reduce((groups, sub) => {
        const currency = sub.currency as Currency
        if (!groups[currency]) groups[currency] = []
        groups[currency].push(sub)
        return groups
      }, {} as Record<Currency, Subscription[]>)

    // Convert each currency group
    for (const [currency, subs] of Object.entries(byCurrency)) {
      const currencyTotal = this.calculateYearlyTotal(subs)
      
      if (currency === target) {
        total += currencyTotal
      } else {
        try {
          const convertedAmount = await ExchangeRateService.convertAmount(
            currencyTotal,
            currency as Currency,
            target
          )
          total += convertedAmount
        } catch (error) {
          console.error(`Failed to convert ${currency} to ${target}:`, error)
          // Fallback: add unconverted amount
          total += currencyTotal
        }
      }
    }

    return total
  }

  static async calculateCategorySpendingWithConversion(
    subscriptions: Subscription[], 
    targetCurrency?: Currency
  ): Promise<Record<string, number>> {
    const target = targetCurrency || getDefaultCurrency()
    const spendingByCategory: Record<string, number> = {}

    // Group by category first, then by currency within each category
    const byCategory = subscriptions
      .filter(sub => sub.is_active)
      .reduce((groups, sub) => {
        const category = sub.category || 'Other'
        if (!groups[category]) groups[category] = {} as Record<Currency, Subscription[]>
        
        const currency = sub.currency as Currency
        if (!groups[category][currency]) groups[category][currency] = []
        groups[category][currency].push(sub)
        return groups
      }, {} as Record<string, Record<Currency, Subscription[]>>)

    // Convert each category's spending
    for (const [category, currencyGroups] of Object.entries(byCategory)) {
      let categoryTotal = 0

      for (const [currency, subs] of Object.entries(currencyGroups)) {
        const currencyTotal = this.calculateMonthlyTotal(subs)
        
        if (currency === target) {
          categoryTotal += currencyTotal
        } else {
          try {
            const convertedAmount = await ExchangeRateService.convertAmount(
              currencyTotal,
              currency as Currency,
              target
            )
            categoryTotal += convertedAmount
          } catch (error) {
            console.error(`Failed to convert ${currency} to ${target} for category ${category}:`, error)
            // Fallback: add unconverted amount
            categoryTotal += currencyTotal
          }
        }
      }

      spendingByCategory[category] = categoryTotal
    }

    return spendingByCategory
  }

  // Helper to convert a single subscription's monthly cost
  static async convertSubscriptionMonthlyAmount(
    subscription: Subscription,
    targetCurrency?: Currency
  ): Promise<number> {
    const target = targetCurrency || getDefaultCurrency()
    const monthlyAmount = this.calculateMonthlyTotal([subscription])
    
    if (subscription.currency === target) {
      return monthlyAmount
    }

    try {
      return await ExchangeRateService.convertAmount(
        monthlyAmount,
        subscription.currency as Currency,
        target
      )
    } catch (error) {
      console.error(`Failed to convert subscription amount from ${subscription.currency} to ${target}:`, error)
      return monthlyAmount // Fallback to original amount
    }
  }
}