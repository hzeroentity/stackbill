export interface TutorialStep {
  id: string
  title: string
  description: string
  imagePath?: string
  icon?: string
  buttonText?: string
}

export interface TutorialData {
  steps: TutorialStep[]
  dismissKey: string
}

export const TUTORIAL_CONFIG: TutorialData = {
  dismissKey: 'stackbill_tutorial_dismissed',
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to StackBill!',
      description: 'Track all your subscriptions and never miss a renewal. Let&apos;s get you started in just a few steps.',
      icon: '👋',
      buttonText: 'Get Started'
    },
    {
      id: 'projects',
      title: 'Organize with Projects',
      description: 'Group your subscriptions by projects or clients. Switch between them using the project selector at the top.',
      icon: '📁',
      buttonText: 'Got it'
    },
    {
      id: 'subscriptions',
      title: 'Add Your First Subscription',
      description: 'Click the "Add Subscription" button to start tracking your services. Include costs, billing cycles, and renewal dates.',
      icon: '💳',
      buttonText: 'Understood'
    },
    {
      id: 'dashboard',
      title: 'Monitor Your Spending',
      description: 'Your dashboard shows monthly/yearly totals, spending by category, and upcoming renewals. All amounts are converted to your preferred currency.',
      icon: '📊',
      buttonText: 'Perfect'
    },
    {
      id: 'ready',
      title: 'You&apos;re All Set!',
      description: 'Start by adding your subscriptions, organize them into projects, and take control of your recurring expenses.',
      icon: '🚀',
      buttonText: 'Start Tracking'
    }
  ]
}

export class TutorialPreferences {
  private static readonly STORAGE_KEY = 'stackbill_tutorial_dismissed'

  static isDismissed(): boolean {
    if (typeof window === 'undefined') return false
    try {
      return localStorage.getItem(this.STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  }

  static dismiss(): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(this.STORAGE_KEY, 'true')
    } catch {
      // Ignore localStorage errors
    }
  }

  static reset(): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch {
      // Ignore localStorage errors
    }
  }
}