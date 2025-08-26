'use client'

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

// Debounce utility for sessionStorage backup
const debounce = <T extends unknown[]>(func: (...args: T) => void, wait: number) => {
  let timeout: NodeJS.Timeout
  return (...args: T) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  // Memoize supabase client to prevent recreation
  const supabase = useMemo(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])
  
  // Prevent auth state flickering by debouncing user updates
  const [stableUser, setStableUser] = useState<User | null>(null)
  
  useEffect(() => {
    // Only update stable user if there's a real change
    if (user?.id !== stableUser?.id) {
      setStableUser(user)
    }
  }, [user, stableUser])
  
  // Debounced sessionStorage backup for form data preservation
  const debouncedBackup = useCallback(
    (essentialData: Record<string, unknown>) => {
      if (typeof window === 'undefined') return
      
      try {
        sessionStorage.setItem('stackbill-backup', JSON.stringify({
          ...essentialData,
          timestamp: Date.now()
        }))
      } catch (error) {
        console.warn('Backup failed:', error)
      }
    },
    []
  )
  
  const debouncedBackupHandler = useCallback(
    debounce(debouncedBackup, 500),
    [debouncedBackup]
  )

  // Consolidated visibility change handler
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleVisibilityChange = () => {
      const now = Date.now()
      
      if (document.hidden) {
        // Tab hidden - preserve essential state only
        console.debug('Tab hidden, preserving state')
        debouncedBackupHandler({
          userId: user?.id,
          userEmail: user?.email,
          // Only essential fields, not entire state
        })
      } else {
        // Tab visible - avoid processing for 2 seconds
        console.debug('Tab visible again')
        ;(window as Window & { lastVisibilityChange?: number }).lastVisibilityChange = now
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user, debouncedBackupHandler])
  
  useEffect(() => {
    // Get initial session with tab visibility check
    const getInitialSession = async () => {
      // Skip auth processing when tab is hidden
      if (typeof window !== 'undefined' && document.hidden) {
        console.log('Skipping auth processing while tab is hidden')
        return
      }
      
      // Add cooldown period after tab becomes visible
      if (typeof window !== 'undefined' && !document.hidden) {
        const windowWithTimestamp = window as Window & { lastVisibilityChange?: number }
        const lastVisibilityChange = windowWithTimestamp.lastVisibilityChange || 0
        const now = Date.now()
        const cooldownPeriod = 2000 // 2 seconds
        
        if (now - lastVisibilityChange < cooldownPeriod) {
          console.log('Skipping auth processing during visibility cooldown')
          return
        }
      }
      
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }
    
    getInitialSession()
    
    // Listen for auth changes with tab visibility protection
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔍 Auth event received:', event, 'Session:', !!session?.user, 'Tab hidden:', document.hidden)
        
        // Skip auth processing when tab is hidden
        if (typeof window !== 'undefined' && document.hidden) {
          console.log('Skipping auth state change while tab is hidden')
          return
        }
        
        // Skip auth processing during visibility cooldown (recently became visible)
        if (typeof window !== 'undefined') {
          const windowWithTimestamp = window as Window & { lastVisibilityChange?: number }
          const lastVisibilityChange = windowWithTimestamp.lastVisibilityChange || 0
          const now = Date.now()
          const cooldownPeriod = 3000 // 3 seconds
          
          if (now - lastVisibilityChange < cooldownPeriod && lastVisibilityChange > 0) {
            console.log('🔍 Skipping auth event during visibility cooldown:', event)
            return
          }
        }
        
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Only redirect on legitimate sign in events (not during tab switches or token refresh)
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('🔍 Redirecting to dashboard from SIGNED_IN event')
          router.push('/dashboard')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user: stableUser, // Use stable user instead of flickering user
    loading,
    signOut
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}