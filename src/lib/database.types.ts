export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type BillingPeriod = 'monthly' | 'yearly' | 'weekly' | 'quarterly'
export type PlanType = 'free' | 'pro'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'incomplete'

export type SubscriptionCategory = 
  | 'Cloud & Hosting'
  | 'Analytics & Tracking'
  | 'AI & Machine Learning'
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
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          color?: string
          created_at?: string
          updated_at?: string
        }
      }
      subscription_projects: {
        Row: {
          subscription_id: string
          project_id: string
          created_at: string
        }
        Insert: {
          subscription_id: string
          project_id: string
          created_at?: string
        }
        Update: {
          subscription_id?: string
          project_id?: string
          created_at?: string
        }
      }
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
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan_type: PlanType
          status: SubscriptionStatus
          current_period_start: string | null
          current_period_end: string | null
          canceled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan_type?: PlanType
          status?: SubscriptionStatus
          current_period_start?: string | null
          current_period_end?: string | null
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan_type?: PlanType
          status?: SubscriptionStatus
          current_period_start?: string | null
          current_period_end?: string | null
          canceled_at?: string | null
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

// Convenience types for projects
export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

// Convenience types for subscription-project relationships
export type SubscriptionProject = Database['public']['Tables']['subscription_projects']['Row']
export type SubscriptionProjectInsert = Database['public']['Tables']['subscription_projects']['Insert']
export type SubscriptionProjectUpdate = Database['public']['Tables']['subscription_projects']['Update']

// Convenience types for user subscriptions
export type UserSubscription = Database['public']['Tables']['user_subscriptions']['Row']
export type UserSubscriptionInsert = Database['public']['Tables']['user_subscriptions']['Insert']
export type UserSubscriptionUpdate = Database['public']['Tables']['user_subscriptions']['Update']

// Extended types for subscriptions with projects
export type SubscriptionWithProjects = Subscription & {
  projects: Project[]
}