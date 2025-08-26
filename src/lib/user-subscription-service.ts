import { supabaseAdmin } from './supabase-admin'
import type { UserSubscription, UserSubscriptionInsert, UserSubscriptionUpdate, PlanType } from './database.types'
import { getPlan } from './plans'

export class UserSubscriptionService {

  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error
    }

    return data || null
  }

  async createUserSubscription(subscription: UserSubscriptionInsert): Promise<UserSubscription> {
    const { data, error } = await supabaseAdmin
      .from('user_subscriptions')
      .insert(subscription)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  async updateUserSubscription(userId: string, updates: UserSubscriptionUpdate): Promise<UserSubscription> {
    const { data, error } = await supabaseAdmin
      .from('user_subscriptions')
      .update(updates)
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
    return userSub.plan_type
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
    return await this.updateUserSubscription(userId, {
      plan_type: 'pro',
      status: 'active',
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd
    })
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