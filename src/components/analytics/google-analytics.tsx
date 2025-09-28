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

    // Configure Google Analytics
    gtag('config', measurementId, {
      // Respect user privacy settings
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    })
  }, [measurementId])

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
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