"use client"

import { useEffect, useState } from 'react'
import { GoogleAnalytics } from './google-analytics'

export function AnalyticsProvider() {
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check if analytics cookies are already consented
    const checkConsent = () => {
      const savedConsent = localStorage.getItem('stackbill-cookie-consent')
      if (savedConsent) {
        const consent = JSON.parse(savedConsent)
        setAnalyticsEnabled(consent.analytics === true)
      }
    }

    // Check initial consent
    checkConsent()

    // Listen for consent changes
    const handleConsentChange = (event: CustomEvent) => {
      setAnalyticsEnabled(event.detail.analytics === true)
    }

    window.addEventListener('cookieConsentChanged', handleConsentChange as EventListener)

    return () => {
      window.removeEventListener('cookieConsentChanged', handleConsentChange as EventListener)
    }
  }, [])

  if (!mounted || !analyticsEnabled) return null

  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  if (!measurementId) {
    console.warn('Google Analytics Measurement ID not found')
    return null
  }

  return <GoogleAnalytics measurementId={measurementId} />
}