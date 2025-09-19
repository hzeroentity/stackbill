
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