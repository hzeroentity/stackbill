"use client"

import { useEffect } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

interface GoogleAnalyticsProps {
  measurementId: string
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  useEffect(() => {
    // Initialize dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || []

    // Initialize gtag function
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args)
    }

    // Make gtag available globally
    window.gtag = gtag

    // Initialize with current timestamp
    gtag('js', new Date())

    // Set default consent mode (analytics granted by default, ads denied)
    gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted'
    })

    // Configure Google Analytics
    gtag('config', measurementId, {
      // Respect user privacy settings
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    })

    // Check if user has already consented
    const checkInitialConsent = () => {
      const savedConsent = localStorage.getItem('stackbill-cookie-consent')
      if (savedConsent) {
        const consent = JSON.parse(savedConsent)
        if (consent.analytics === true) {
          gtag('consent', 'update', {
            analytics_storage: 'granted'
          })
        }
      }
    }

    // Check consent after a small delay to ensure localStorage is available
    setTimeout(checkInitialConsent, 100)
  }, [measurementId])

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="beforeInteractive"
      />
    </>
  )
}

// Utility functions for tracking events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      page_location: url,
      page_title: title,
    })
  }
}

// Common tracking functions for StackBill
export const trackSignUp = (method: string) => {
  trackEvent('sign_up', 'auth', method)
}

export const trackSubscriptionAdd = (service: string) => {
  trackEvent('add_subscription', 'subscription', service)
}

export const trackUpgrade = (plan: string) => {
  trackEvent('upgrade', 'billing', plan)
}

export const trackProjectCreate = () => {
  trackEvent('create_project', 'project')
}