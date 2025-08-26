export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type BillingPeriod = 'monthly' | 'yearly' | 'weekly' | 'quarterly'

export type SubscriptionCategory = 
  | 'Cloud & Hosting'
  | 'Analytics & Tracking'
  | 'Database & Storage'
  | 'Developer Tools'
  | 'Communication'
  | 'Design & Creative'
  | 'Marketing & SEO'
  | 'Security'
  | 'Entertainment'
  | 'Productivity'
  | 'Other'

export interface Database {
  public: {
    Tables: {
      subscriptions: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          currency: string
          billing_period: BillingPeriod
          renewal_date: string
          category: SubscriptionCategory
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          currency?: string
          billing_period: BillingPeriod
          renewal_date: string
          category: SubscriptionCategory
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          currency?: string
          billing_period?: BillingPeriod
          renewal_date?: string
          category?: SubscriptionCategory
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types for subscriptions
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']