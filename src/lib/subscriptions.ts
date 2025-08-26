import { supabase } from './supabase'
import { Subscription, SubscriptionInsert, SubscriptionUpdate } from './database.types'

export class SubscriptionsService {
  static async getAll(): Promise<{ data: Subscription[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('is_active', true)
        .order('renewal_date', { ascending: true })
      
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  static async getById(id: string): Promise<{ data: Subscription | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', id)
        .single()
      
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  static async create(subscription: Omit<SubscriptionInsert, 'user_id'>): Promise<{ data: Subscription | null; error: any }> {
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
      return { data: null, error }
    }
  }

  static async update(id: string, updates: SubscriptionUpdate): Promise<{ data: Subscription | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  static async delete(id: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
      
      return { error }
    } catch (error) {
      return { error }
    }
  }

  static async softDelete(id: string): Promise<{ data: Subscription | null; error: any }> {
    return this.update(id, { is_active: false })
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
}