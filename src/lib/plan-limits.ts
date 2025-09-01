import { PlanType } from './database.types'

export interface PlanLimits {
  subscriptions: number
  projects: number
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    subscriptions: 3,
    projects: 2
  },
  pro: {
    subscriptions: 30,
    projects: 10
  }
}

export function getPlanLimits(planType: PlanType): PlanLimits {
  return PLAN_LIMITS[planType]
}

export function canAddProject(currentProjectCount: number, planType: PlanType): boolean {
  const limits = getPlanLimits(planType)
  return currentProjectCount < limits.projects
}

export function canAddSubscription(currentSubscriptionCount: number, planType: PlanType): boolean {
  const limits = getPlanLimits(planType)
  return currentSubscriptionCount < limits.subscriptions
}