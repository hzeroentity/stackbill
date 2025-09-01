export interface RenewalStatus {
  text: string
  color: string
  icon: string
}

function getNextRenewalDate(renewalDate: Date, billingPeriod: 'monthly' | 'yearly', today: Date): Date {
  const renewalDay = renewalDate.getDate()
  const renewalMonth = renewalDate.getMonth()
  
  if (billingPeriod === 'yearly') {
    // For yearly subscriptions, find next occurrence of the same month and day
    const currentYear = today.getFullYear()
    let nextRenewal = new Date(currentYear, renewalMonth, renewalDay)
    
    // If the renewal date this year has passed, move to next year
    if (nextRenewal <= today) {
      nextRenewal = new Date(currentYear + 1, renewalMonth, renewalDay)
    }
    
    return nextRenewal
  } else {
    // For monthly subscriptions, find next occurrence of the same day
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    // Try this month first
    let nextRenewal = new Date(currentYear, currentMonth, renewalDay)
    
    // If the renewal date this month has passed, move to next month
    if (nextRenewal <= today) {
      nextRenewal = new Date(currentYear, currentMonth + 1, renewalDay)
    }
    
    // Handle edge case where renewal day doesn't exist in the next month (e.g., Feb 31st)
    if (nextRenewal.getDate() !== renewalDay) {
      // Move to the last day of that month
      nextRenewal = new Date(currentYear, currentMonth + 2, 0)
    }
    
    return nextRenewal
  }
}

export function getRenewalStatus(renewalDate: string, billingPeriod: 'monthly' | 'yearly' = 'monthly'): RenewalStatus {
  const today = new Date()
  const renewalDateObj = new Date(renewalDate)
  
  // Calculate next renewal date based on billing period
  const nextRenewalDate = getNextRenewalDate(renewalDateObj, billingPeriod, today)
  const diffTime = nextRenewalDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
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