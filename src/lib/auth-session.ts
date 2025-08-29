/**
 * Modern Session Management System
 * Provides synchronous authentication state with background refresh
 * Zero-delay navigation for modern web app experience
 */

import { User } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface SessionState {
  user: User | null
  isAuthenticated: boolean
  isInitialized: boolean
  lastVerified: number
}

interface SessionListeners {
  onAuthChange: (user: User | null) => void
  onSessionExpired: () => void
}

class SessionManager {
  private state: SessionState = {
    user: null,
    isAuthenticated: false,
    isInitialized: false,
    lastVerified: 0
  }

  private listeners: SessionListeners[] = []
  private refreshInterval: NodeJS.Timeout | null = null
  private readonly STORAGE_KEY = 'stackbill_session'
  private readonly VERIFY_INTERVAL = 5 * 60 * 1000 // 5 minutes
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000 // 24 hours

  /**
   * Initialize session management - call this once at app startup
   */
  async initialize(): Promise<void> {
    // Try to restore from localStorage first for instant auth state
    this.restoreFromStorage()

    try {
      // Verify current session in background
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        this.clearSession()
      } else {
        this.setSession(session.user)
      }
    } catch (error) {
      console.error('Session initialization error:', error)
      this.clearSession()
    }

    this.state.isInitialized = true
    this.startBackgroundRefresh()
    this.setupAuthListener()
  }

  /**
   * Get current authentication state (synchronous)
   */
  getAuthState(): { user: User | null; isAuthenticated: boolean; isInitialized: boolean } {
    return {
      user: this.state.user,
      isAuthenticated: this.state.isAuthenticated,
      isInitialized: this.state.isInitialized
    }
  }

  /**
   * Check if user is authenticated (synchronous)
   */
  isAuthenticated(): boolean {
    return this.state.isAuthenticated
  }

  /**
   * Check if session manager is initialized
   */
  isInitialized(): boolean {
    return this.state.isInitialized
  }

  /**
   * Get current user (synchronous)
   */
  getCurrentUser(): User | null {
    return this.state.user
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    await supabase.auth.signOut()
    this.clearSession()
    this.notifyListeners(null)
  }

  /**
   * Add authentication state listener
   */
  addListener(listener: SessionListeners): () => void {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * Restore session from localStorage
   */
  private restoreFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return

      const { user, timestamp } = JSON.parse(stored)
      const now = Date.now()
      
      // Check if stored session is still valid (within 24 hours)
      if (now - timestamp < this.SESSION_TIMEOUT && user) {
        this.state.user = user
        this.state.isAuthenticated = true
        this.state.lastVerified = timestamp
      } else {
        // Clear expired session
        localStorage.removeItem(this.STORAGE_KEY)
      }
    } catch {
      // Invalid stored data, clear it
      localStorage.removeItem(this.STORAGE_KEY)
    }
  }

  /**
   * Persist session to localStorage
   */
  private persistToStorage(): void {
    try {
      if (this.state.user) {
        const sessionData = {
          user: this.state.user,
          timestamp: Date.now()
        }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessionData))
      } else {
        localStorage.removeItem(this.STORAGE_KEY)
      }
    } catch (error) {
      // Ignore localStorage errors (storage full, private browsing)
      console.warn('Failed to persist session:', error)
    }
  }

  /**
   * Set authenticated session
   */
  private setSession(user: User): void {
    this.state.user = user
    this.state.isAuthenticated = true
    this.state.lastVerified = Date.now()
    this.persistToStorage()
  }

  /**
   * Clear session state
   */
  private clearSession(): void {
    this.state.user = null
    this.state.isAuthenticated = false
    this.state.lastVerified = 0
    this.persistToStorage()
  }

  /**
   * Setup Supabase auth state change listener
   */
  private setupAuthListener(): void {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        this.setSession(session.user)
        this.notifyListeners(session.user)
      } else if (event === 'SIGNED_OUT') {
        this.clearSession()
        this.notifyListeners(null)
      } else if (event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          this.setSession(session.user)
        } else {
          this.clearSession()
          this.notifyListeners(null)
        }
      }
    })
  }

  /**
   * Start background session verification
   */
  private startBackgroundRefresh(): void {
    // Clear existing interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }

    this.refreshInterval = setInterval(async () => {
      // Only verify if we think we're authenticated
      if (!this.state.isAuthenticated) return

      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          console.log('Background verification: Session expired')
          this.clearSession()
          this.notifySessionExpired()
        } else if (session.user) {
          // Update user data if changed
          this.setSession(session.user)
        }
      } catch (error) {
        console.error('Background session verification failed:', error)
      }
    }, this.VERIFY_INTERVAL)
  }

  /**
   * Notify all listeners of auth state change
   */
  private notifyListeners(user: User | null): void {
    this.listeners.forEach(listener => {
      try {
        listener.onAuthChange(user)
      } catch (error) {
        console.error('Auth listener error:', error)
      }
    })
  }

  /**
   * Notify listeners that session expired
   */
  private notifySessionExpired(): void {
    this.listeners.forEach(listener => {
      try {
        listener.onSessionExpired()
      } catch (error) {
        console.error('Session expired listener error:', error)
      }
    })
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    }
    this.listeners = []
  }
}

// Export singleton instance
export const sessionManager = new SessionManager()

// Export types for external use
export type { SessionListeners }