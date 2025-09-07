'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

type ConfirmationStatus = 'loading' | 'success' | 'already_confirmed' | 'error' | 'invalid_link'

const statusConfig = {
  loading: {
    icon: Loader2,
    title: 'Confirming your email...',
    description: 'Please wait while we verify your account.',
    color: 'text-blue-600'
  },
  success: {
    icon: CheckCircle,
    title: 'Email confirmed successfully!',
    description: 'Your account is now active. You can sign in to start tracking your subscriptions.',
    color: 'text-green-600'
  },
  already_confirmed: {
    icon: CheckCircle,
    title: 'Email already confirmed',
    description: 'Your account is already active. You can sign in to access your dashboard.',
    color: 'text-green-600'
  },
  error: {
    icon: XCircle,
    title: 'Confirmation failed',
    description: 'We couldn\'t confirm your email. The link may be expired or invalid.',
    color: 'text-red-600'
  },
  invalid_link: {
    icon: XCircle,
    title: 'Invalid confirmation link',
    description: 'This confirmation link is invalid or has expired. Please request a new one.',
    color: 'text-red-600'
  }
}

export default function ConfirmEmailPage() {
  const [status, setStatus] = useState<ConfirmationStatus>('loading')
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  useEffect(() => {
    const confirmEmail = async () => {
      if (!token) {
        setStatus('invalid_link')
        return
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`)
        const data = await response.json()

        if (data.success) {
          setStatus('success')
        } else if (data.error === 'already_confirmed') {
          setStatus('already_confirmed')
        } else {
          setStatus('error')
        }
      } catch (error) {
        console.error('Confirmation error:', error)
        setStatus('error')
      }
    }

    confirmEmail()
  }, [token])

  const handleSignIn = () => {
    router.push('/login')
  }

  const handleResendLink = () => {
    router.push('/signup?resend=true')
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <Icon className={`w-16 h-16 ${config.color} ${status === 'loading' ? 'animate-spin' : ''}`} />
            </div>
            <CardTitle className="text-xl">{config.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground">
              {config.description}
            </p>

            <div className="space-y-3">
              {(status === 'success' || status === 'already_confirmed') && (
                <Button onClick={handleSignIn} className="w-full">
                  Sign In to StackBill
                </Button>
              )}

              {(status === 'error' || status === 'invalid_link') && (
                <>
                  <Button onClick={handleResendLink} className="w-full">
                    Request New Confirmation Link
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleSignIn} 
                    className="w-full"
                  >
                    Back to Sign In
                  </Button>
                </>
              )}

              {status === 'loading' && (
                <Button disabled className="w-full">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </Button>
              )}
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Having trouble? Contact us at{' '}
                <a 
                  href="mailto:hello@stackbill.dev" 
                  className="text-primary hover:underline"
                >
                  hello@stackbill.dev
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}