import { supabaseAdmin } from './supabase-admin'
import type { UserSubscription, UserSubscriptionInsert, UserSubscriptionUpdate, PlanType } from './database.types'
import { getPlan } from './plans'

export class UserSubscriptionService {

  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await (supabaseAdmin
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('user_subscriptions') as any)
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error
    }

    return data || null
  }

  async createUserSubscription(subscription: UserSubscriptionInsert): Promise<UserSubscription> {
    const { data, error } = await (supabaseAdmin
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('user_subscriptions') as any)
      .insert(subscription)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  async updateUserSubscription(userId: string, updates: UserSubscriptionUpdate): Promise<UserSubscription> {
    // First ensure the user has a subscription record
    await this.ensureUserSubscription(userId)
    
    const updateData = { ...updates, updated_at: new Date().toISOString() }
    const { data, error } = await (supabaseAdmin
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('user_subscriptions') as any)
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  async ensureUserSubscription(userId: string): Promise<UserSubscription> {
    let userSub = await this.getUserSubscription(userId)
    
    if (!userSub) {
      // Create a free subscription for new users
      userSub = await this.createUserSubscription({
        user_id: userId,
        plan_type: 'free',
        status: 'active'
      })
    }

    return userSub
  }

  async getUserPlan(userId: string): Promise<PlanType> {
    const userSub = await this.ensureUserSubscription(userId)
    return userSub.plan_type as PlanType
  }

  async canUserAddSubscription(userId: string, currentSubscriptionCount: number): Promise<boolean> {
    const planType = await this.getUserPlan(userId)
    const plan = getPlan(planType)
    
    return plan.subscriptionLimit !== null && currentSubscriptionCount < plan.subscriptionLimit
  }

  async upgradeUserToPro(
    userId: string, 
    stripeCustomerId: string,
    stripeSubscriptionId: string,
    currentPeriodStart: string,
    currentPeriodEnd: string
  ): Promise<UserSubscription> {
    
    // Use upsert with onConflict to handle both existing and new user subscriptions
    const { data, error } = await (supabaseAdmin
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('user_subscriptions') as any)
      .upsert({
        user_id: userId,
        plan_type: 'pro',
        status: 'active',
        stripe_customer_id: stripeCustomerId,
        stripe_subscription_id: stripeSubscriptionId,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  async cancelUserSubscription(userId: string): Promise<UserSubscription> {
    return await this.updateUserSubscription(userId, {
      plan_type: 'free',
      status: 'canceled',
      canceled_at: new Date().toISOString()
    })
  }
}

export const userSubscriptionService = new UserSubscriptionService()