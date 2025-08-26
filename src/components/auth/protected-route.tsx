'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user: stableUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only redirect when we're certain there's no user (avoid flicker redirects)
    if (!loading && !stableUser) {
      router.push('/login')
    }
  }, [stableUser, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!stableUser) {
    return null
  }

  return <>{children}</>
}