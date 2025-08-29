export interface RenewalStatus {
  text: string
  color: string
  icon: string
}

export function getRenewalStatus(renewalDate: string): RenewalStatus {
  const today = new Date()
  const renewal = new Date(renewalDate)
  const diffTime = renewal.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { 
      text: 'Overdue', 
      color: 'text-red-700 bg-red-100 border border-red-200 dark:text-red-200 dark:bg-red-900/30 dark:border-red-700/50',
      icon: '⚠️'
    }
  } else if (diffDays === 0) {
    return { 
      text: 'Due Today', 
      color: 'text-orange-700 bg-orange-100 border border-orange-200 dark:text-orange-200 dark:bg-orange-900/30 dark:border-orange-700/50',
      icon: '🔔'
    }
  } else if (diffDays <= 3) {
    return { 
      text: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`, 
      color: 'text-amber-700 bg-amber-100 border border-amber-200 dark:text-amber-200 dark:bg-amber-900/30 dark:border-amber-700/50',
      icon: '⏰'
    }
  } else if (diffDays <= 7) {
    return { 
      text: `Due in ${diffDays} days`, 
      color: 'text-yellow-700 bg-yellow-100 border border-yellow-200 dark:text-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700/50',
      icon: '📅'
    }
  } else if (diffDays <= 30) {
    return { 
      text: `Due in ${diffDays} days`, 
      color: 'text-green-700 bg-green-100 border border-green-200 dark:text-green-200 dark:bg-green-900/30 dark:border-green-700/50',
      icon: '✅'
    }
  } else {
    return { 
      text: `Due in ${diffDays} days`, 
      color: 'text-blue-700 bg-blue-100 border border-blue-200 dark:text-blue-200 dark:bg-blue-900/30 dark:border-blue-700/50',
      icon: '🗓️'
    }
  }
}