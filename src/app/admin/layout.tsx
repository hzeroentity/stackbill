'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent } from '@/components/ui/card'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isInitialized } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)
  const [adminError, setAdminError] = useState<string | null>(null)

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isInitialized || !user?.id) {
        setChecking(false)
        return
      }

      try {
        // Check admin status via API call
        const response = await fetch('/api/admin/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        })

        const data = await response.json()

        if (response.ok && data.isAdmin) {
          setIsAdmin(true)
          setAdminError(null)
        } else {
          setIsAdmin(false)
          setAdminError(data.error || 'Access denied - Admin privileges required')
        }
      } catch (error) {
        console.error('Admin verification error:', error)
        setIsAdmin(false)
        setAdminError('Failed to verify admin status')
      }

      setChecking(false)
    }

    checkAdminStatus()
  }, [user, isInitialized])

  if (!isInitialized || checking) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Verifying admin access...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Authentication Required
              </h2>
              <p className="text-red-600 dark:text-red-400">
                You must be logged in to access the admin dashboard.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Access Denied
              </h2>
              <p className="text-red-600 dark:text-red-400">
                {adminError || "You don't have permission to access the admin dashboard."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}