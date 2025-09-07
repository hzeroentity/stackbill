import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export interface EmailPreferences {
  id: string
  user_id: string
  monthly_summary_enabled: boolean
  renewal_alerts_enabled: boolean
  renewal_reminder_days: number[]
  last_monthly_summary_sent?: string
  last_renewal_alert_sent?: string
  created_at: string
  updated_at: string
}

export class EmailPreferencesService {
  private static supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

  /**
   * Get user's email preferences, creating default if they don't exist
   */
  static async getUserPreferences(userId: string): Promise<EmailPreferences> {
    const { data: preferences, error } = await this.supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code === 'PGRST116') {
      // No preferences exist, create default ones
      return this.createDefaultPreferences(userId)
    }

    if (error) {
      throw new Error(`Failed to get email preferences: ${error.message}`)
    }

    return preferences
  }

  /**
   * Create default email preferences for a user
   */
  static async createDefaultPreferences(userId: string): Promise<EmailPreferences> {
    const defaultPrefs = {
      user_id: userId,
      monthly_summary_enabled: true,
      renewal_alerts_enabled: true,
      renewal_reminder_days: [7, 3, 1] // 7 days, 3 days, 1 day before renewal
    }

    const { data, error } = await this.supabase
      .from('email_preferences')
      .insert([defaultPrefs])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create email preferences: ${error.message}`)
    }

    return data
  }

  /**
   * Update user's email preferences
   */
  static async updatePreferences(
    userId: string, 
    updates: Partial<Pick<EmailPreferences, 'monthly_summary_enabled' | 'renewal_alerts_enabled' | 'renewal_reminder_days'>>
  ): Promise<EmailPreferences> {
    const { data, error } = await this.supabase
      .from('email_preferences')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update email preferences: ${error.message}`)
    }

    return data
  }

  /**
   * Update the last sent timestamps (for anti-spam tracking)
   */
  static async updateLastSent(
    userId: string, 
    type: 'monthly_summary' | 'renewal_alert'
  ): Promise<void> {
    const field = type === 'monthly_summary' ? 'last_monthly_summary_sent' : 'last_renewal_alert_sent'
    
    const { error } = await this.supabase
      .from('email_preferences')
      .update({ [field]: new Date().toISOString() })
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to update last sent timestamp: ${error.message}`)
    }
  }

  /**
   * Check if user should receive email based on preferences and anti-spam logic
   */
  static async shouldSendEmail(
    userId: string, 
    type: 'monthly_summary' | 'renewal_alert'
  ): Promise<boolean> {
    try {
      const preferences = await this.getUserPreferences(userId)
      
      // Check if email type is enabled
      if (type === 'monthly_summary' && !preferences.monthly_summary_enabled) {
        return false
      }
      
      if (type === 'renewal_alert' && !preferences.renewal_alerts_enabled) {
        return false
      }

      // Anti-spam logic: don't send if already sent recently
      if (type === 'monthly_summary' && preferences.last_monthly_summary_sent) {
        const lastSent = new Date(preferences.last_monthly_summary_sent)
        const daysSinceLastSent = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60 * 24)
        
        // Only send monthly summaries once per month
        if (daysSinceLastSent < 28) {
          return false
        }
      }

      if (type === 'renewal_alert' && preferences.last_renewal_alert_sent) {
        const lastSent = new Date(preferences.last_renewal_alert_sent)
        const hoursSinceLastSent = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60)
        
        // Only send renewal alerts once per day max
        if (hoursSinceLastSent < 24) {
          return false
        }
      }

      return true
    } catch (error) {
      console.error('Error checking email send permission:', error)
      return false
    }
  }

  /**
   * Get all users with email preferences enabled for a specific type
   */
  static async getUsersWithEmailsEnabled(type: 'monthly_summary' | 'renewal_alert'): Promise<string[]> {
    const field = type === 'monthly_summary' ? 'monthly_summary_enabled' : 'renewal_alerts_enabled'
    
    const { data, error } = await this.supabase
      .from('email_preferences')
      .select('user_id')
      .eq(field, true)

    if (error) {
      throw new Error(`Failed to get users with emails enabled: ${error.message}`)
    }

    return data.map(pref => pref.user_id)
  }
}