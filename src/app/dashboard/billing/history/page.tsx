'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Receipt, Calendar, CreditCard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface BillingEvent {
  id: string
  date: string
  type: 'upgrade' | 'payment' | 'downgrade' | 'cancellation'
  amount?: number
  currency?: string
  status: 'completed' | 'failed' | 'pending'
  description: string
  stripe_invoice_url?: string
}

export default function BillingHistoryPage() {
  const router = useRouter()
  const [billingHistory, setBillingHistory] = useState<BillingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [, setUser] = useState<{ id: string; email?: string } | null>(null)

  useEffect(() => {
    async function loadBillingHistory() {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push('/auth')
        return
      }

      setUser({ id: user.id, email: user.email })

      try {
        // Get user subscription to build history
        const { data: userSub, error: subError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (subError && subError.code !== 'PGRST116') {
          console.error('Error fetching subscription:', subError)
        }

        // Build billing history from available data
        const history: BillingEvent[] = []

        if (userSub) {
          // Add plan status changes
          if (userSub.plan_type === 'pro') {
            history.push({
              id: 'current-pro',
              date: userSub.current_period_start || userSub.created_at,
              type: 'upgrade',
              description: 'Upgraded to Pro Plan',
              status: 'completed',
              amount: 4.00, // Default Pro amount
              currency: 'EUR'
            })
          }

          if (userSub.canceled_at) {
            history.push({
              id: 'cancellation',
              date: userSub.canceled_at,
              type: 'cancellation',
              description: 'Pro Plan Cancelled',
              status: 'completed'
            })
          }
        }

        // Sort by date (most recent first)
        history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setBillingHistory(history)
      } catch (error) {
        console.error('Error loading billing history:', error)
      } finally {
        setLoading(false)
      }
    }

    loadBillingHistory()
  }, [router])

  const getStatusBadge = (status: BillingEvent['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getTypeIcon = (type: BillingEvent['type']) => {
    switch (type) {
      case 'upgrade':
        return <CreditCard className="h-4 w-4 text-green-600" />
      case 'payment':
        return <Receipt className="h-4 w-4 text-blue-600" />
      case 'downgrade':
      case 'cancellation':
        return <Calendar className="h-4 w-4 text-orange-600" />
      default:
        return <Receipt className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" onClick={() => router.back()} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Billing History</h1>
            <p className="text-muted-foreground">
              View your payment history and account changes
            </p>
          </div>
        </div>
      </div>

      {billingHistory.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Billing History</h3>
            <p className="text-muted-foreground mb-4">
              You haven&apos;t made any payments or plan changes yet.
            </p>
            <Button onClick={() => router.push('/dashboard/billing')}>
              View Current Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {billingHistory.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    {getTypeIcon(event.type)}
                    <div>
                      <h3 className="font-medium">{event.description}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>{new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                        {event.amount && (
                          <span className="font-medium text-foreground">
                            {event.currency} {event.amount.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(event.status)}
                    {event.stripe_invoice_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(event.stripe_invoice_url, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="border-t my-8" />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
          <CardDescription>
            Questions about your billing or need a receipt?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => window.open('mailto:hello@stackbill.dev')}>
              Contact Support
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard/billing')}>
              Manage Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}