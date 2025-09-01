import { PlanType } from './database.types'
import { PLAN_LIMITS } from './plan-limits'

export interface Plan {
  id: PlanType
  name: string
  description: string
  price: number
  priceId: string // Stripe price ID
  features: string[]
  subscriptionLimit: number
  projectLimit: number
  popular?: boolean
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    priceId: '', // No Stripe price ID for free plan
    subscriptionLimit: PLAN_LIMITS.free.subscriptions,
    projectLimit: PLAN_LIMITS.free.projects,
    features: [
      `Track up to ${PLAN_LIMITS.free.subscriptions} subscriptions`,
      `Organize into up to ${PLAN_LIMITS.free.projects} projects`,
      'Monthly & yearly spending overview',
      'Basic renewal tracking',
      'Manual subscription entry'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Advanced tracking for serious users',
    price: 4,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '',
    subscriptionLimit: PLAN_LIMITS.pro.subscriptions,
    projectLimit: PLAN_LIMITS.pro.projects,
    popular: true,
    features: [
      `Track up to ${PLAN_LIMITS.pro.subscriptions} subscriptions`,
      `Organize into up to ${PLAN_LIMITS.pro.projects} projects`,
      'Multi-project subscription assignment',
      'Email reminders for expiring subscriptions',
      'Advanced analytics & insights',
      'Category-based spending breakdown',
      'Priority support'
    ]
  }
]

export const getPlan = (planType: PlanType): Plan => {
  const plan = PLANS.find(p => p.id === planType)
  if (!plan) {
    throw new Error(`Plan not found: ${planType}`)
  }
  return plan
}

export const getSubscriptionLimit = (planType: PlanType): number => {
  return PLAN_LIMITS[planType].subscriptions
}

export const getProjectLimit = (planType: PlanType): number => {
  return PLAN_LIMITS[planType].projects
}

export const canAddSubscription = (
  currentCount: number, 
  planType: PlanType
): boolean => {
  return currentCount < getSubscriptionLimit(planType)
}

export const canAddProject = (
  currentCount: number, 
  planType: PlanType
): boolean => {
  return currentCount < getProjectLimit(planType)
}