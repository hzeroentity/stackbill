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
    // For auto-renewing subscriptions, past dates mean they already renewed
    return { 
      text: 'Renewed', 
      color: 'text-green-700 bg-green-100 border border-green-200 dark:text-green-200 dark:bg-green-900/30 dark:border-green-700/50',
      icon: '✅'
    }
  } else if (diffDays === 0) {
    return { 
      text: 'Renews Today', 
      color: 'text-red-700 bg-red-100 border border-red-200 dark:text-red-200 dark:bg-red-900/30 dark:border-red-700/50',
      icon: '🔴'
    }
  } else if (diffDays === 1) {
    return { 
      text: 'Renews Tomorrow', 
      color: 'text-orange-700 bg-orange-100 border border-orange-200 dark:text-orange-200 dark:bg-orange-900/30 dark:border-orange-700/50',
      icon: '🟠'
    }
  } else if (diffDays <= 3) {
    return { 
      text: `Renews in ${diffDays} days`, 
      color: 'text-yellow-700 bg-yellow-100 border border-yellow-200 dark:text-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700/50',
      icon: '🟡'
    }
  } else if (diffDays <= 7) {
    return { 
      text: `Renews in ${diffDays} days`, 
      color: 'text-blue-700 bg-blue-100 border border-blue-200 dark:text-blue-200 dark:bg-blue-900/30 dark:border-blue-700/50',
      icon: '📅'
    }
  } else {
    // For subscriptions renewing more than 7 days away, don't show status
    return { 
      text: '', 
      color: '',
      icon: ''
    }
  }
}