import { PlanType } from './database.types'

export interface Plan {
  id: PlanType
  name: string
  description: string
  price: number
  priceId: string // Stripe price ID
  features: string[]
  subscriptionLimit: number | null // null means unlimited
  popular?: boolean
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    priceId: '', // No Stripe price ID for free plan
    subscriptionLimit: 3,
    features: [
      'Track up to 3 subscriptions',
      'Monthly & yearly spending overview',
      'Basic renewal tracking',
      'Manual subscription entry'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Unlimited tracking for power users',
    price: 4,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '',
    subscriptionLimit: 30, // "unlimited" but with ceiling
    popular: true,
    features: [
      'Track up to 30 subscriptions',
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

export const getSubscriptionLimit = (planType: PlanType): number | null => {
  return getPlan(planType).subscriptionLimit
}

export const canAddSubscription = (
  currentCount: number, 
  planType: PlanType
): boolean => {
  const limit = getSubscriptionLimit(planType)
  return limit !== null && currentCount < limit
}