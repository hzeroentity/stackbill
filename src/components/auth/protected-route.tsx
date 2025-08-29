'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect after initialization is complete and user is not authenticated
    if (isInitialized && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, isInitialized, router])

  // Show loading only during the initial authentication check (first app load)
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // If authenticated, render immediately - zero delays for navigation
  if (isAuthenticated) {
    return <>{children}</>
  }

  // Not authenticated and initialized - redirect is happening, show nothing to avoid flash
  return null
}