"use client"

import { useEffect, useState } from 'react'
import { GoogleAnalytics } from './google-analytics'

export function AnalyticsProvider() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Listen for consent changes and update GA consent
    const handleConsentChange = (event: CustomEvent) => {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: event.detail.analytics ? 'granted' : 'denied'
        })
      }
    }

    window.addEventListener('cookieConsentChanged', handleConsentChange as EventListener)

    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange as EventListener)
    }
  }, [])

  if (!mounted) return null

  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  if (!measurementId) {
    console.warn('Google Analytics Measurement ID not found')
    return null
  }

  // Always load GA script - consent is managed via consent mode
  return <GoogleAnalytics measurementId={measurementId} />
}