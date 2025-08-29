'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { sessionManager, type SessionListeners } from '@/lib/auth-session'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isInitialized: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize with session manager state (synchronous)
  const initialState = sessionManager.getAuthState()
  const [user, setUser] = useState<User | null>(initialState.user)
  const [isAuthenticated, setIsAuthenticated] = useState(initialState.isAuthenticated)
  const [isInitialized, setIsInitialized] = useState(initialState.isInitialized)
  const router = useRouter()
  
  useEffect(() => {
    // Initialize session manager (happens once per app lifecycle)
    if (!sessionManager.isInitialized()) {
      sessionManager.initialize().then(() => {
        const state = sessionManager.getAuthState()
        setUser(state.user)
        setIsAuthenticated(state.isAuthenticated)
        setIsInitialized(true)
      })
    }

    // Listen for auth state changes
    const listeners: SessionListeners = {
      onAuthChange: (newUser) => {
        setUser(newUser)
        setIsAuthenticated(!!newUser)
      },
      onSessionExpired: () => {
        setUser(null)
        setIsAuthenticated(false)
        router.push('/login')
      }
    }

    const unsubscribe = sessionManager.addListener(listeners)
    return unsubscribe
  }, [router])

  const signOut = async () => {
    await sessionManager.signOut()
    router.push('/login')
  }

  const value = {
    user,
    isAuthenticated,
    isInitialized,
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