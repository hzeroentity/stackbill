'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from '@/lib/supabase'
import { getStripe } from '@/lib/stripe'

export default function TestPage() {
  const [supabaseStatus, setSupabaseStatus] = useState<string>('Not tested')
  const [stripeStatus, setStripeStatus] = useState<string>('Not tested')

  const testSupabase = async () => {
    try {
      const { data, error } = await supabase.from('subscriptions').select('count')
      if (error) {
        setSupabaseStatus(`Connected ✅ (Expected error: ${error.message})`)
      } else {
        setSupabaseStatus('Connected ✅')
      }
    } catch (err) {
      setSupabaseStatus(`Error ❌: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const testStripe = async () => {
    try {
      const stripe = await getStripe()
      if (stripe) {
        setStripeStatus('Connected ✅')
      } else {
        setStripeStatus('Error ❌: Failed to load Stripe')
      }
    } catch (err) {
      setStripeStatus(`Error ❌: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Connection Tests</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Supabase Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Status: <span className="font-mono">{supabaseStatus}</span></p>
            <Button onClick={testSupabase}>Test Supabase</Button>
            <p className="text-sm text-muted-foreground">
              This will test the connection to your Supabase instance. 
              Expected to show an error since we haven't created the database table yet.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stripe Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Status: <span className="font-mono">{stripeStatus}</span></p>
            <Button onClick={testStripe}>Test Stripe</Button>
            <p className="text-sm text-muted-foreground">
              This will test if Stripe.js loads correctly with your publishable key.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm">
            <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
            <p>Supabase Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
            <p>Stripe Publishable Key: {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}