"use client"

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Shield, BarChart3, Target, Cookie } from 'lucide-react'
import Link from 'next/link'

type CookieConsent = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

export function CookieConsentBanner() {
  const { t } = useLanguage()
  const [showModal, setShowModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [consent, setConsent] = useState<CookieConsent>({
    necessary: true,
    analytics: false,
    marketing: false
  })

  useEffect(() => {
    setMounted(true)
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem('stackbill-cookie-consent')
    if (!savedConsent) {
      setShowModal(true)
    }
  }, [])

  const saveConsent = (consentData: CookieConsent) => {
    localStorage.setItem('stackbill-cookie-consent', JSON.stringify({
      ...consentData,
      timestamp: Date.now()
    }))
    setShowModal(false)

    // Enable/disable tracking based on consent
    if (consentData.analytics) {
      // Enable Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted'
        })
        console.log('Google Analytics enabled')
      }
    } else {
      // Disable Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied'
        })
        console.log('Google Analytics disabled')
      }
    }

    if (consentData.marketing) {
      console.log('Marketing enabled')
      // Add marketing tracking code here when needed
    }

    // Trigger custom event for analytics consent change
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', {
      detail: consentData
    }))
  }

  const acceptAll = () => {
    const allConsent = { necessary: true, analytics: true, marketing: true }
    setConsent(allConsent)
    saveConsent(allConsent)
  }

  const declineAll = () => {
    const minimalConsent = { necessary: true, analytics: false, marketing: false }
    setConsent(minimalConsent)
    saveConsent(minimalConsent)
  }

  const savePreferences = () => {
    saveConsent(consent)
  }

  // Don't render until mounted to avoid hydration issues
  if (!mounted || !showModal) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.preventDefault()} // Prevent backdrop click
    >
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Cookie className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-xl">
                Cookie Preferences
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Choose which cookies you want to allow. You can change these settings at any time.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-6">
            {/* Necessary Cookies */}
            <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mt-1">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-base">
                    {t('cookies.necessary.title')}
                  </h3>
                  <Switch checked={true} disabled className="ml-4" />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('cookies.necessary.description')}
                </p>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mt-1">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-base">
                    {t('cookies.analytics.title')}
                  </h3>
                  <Switch
                    checked={consent.analytics}
                    onCheckedChange={(checked) => setConsent(prev => ({ ...prev, analytics: checked }))}
                    className="ml-4"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('cookies.analytics.description')}
                </p>
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg mt-1">
                <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-base">
                    {t('cookies.marketing.title')}
                  </h3>
                  <Switch
                    checked={consent.marketing}
                    onCheckedChange={(checked) => setConsent(prev => ({ ...prev, marketing: checked }))}
                    className="ml-4"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('cookies.marketing.description')}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-4 text-center">
              By continuing to use our website, you agree to our{' '}
              <Link href="/cookie-policy" className="underline hover:no-underline">
                Cookie Policy
              </Link>
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={declineAll}
                className="flex-1"
              >
                {t('cookies.decline')}
              </Button>
              <Button
                onClick={savePreferences}
                className="flex-1"
              >
                {t('cookies.savePreferences')}
              </Button>
              <Button
                onClick={acceptAll}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {t('cookies.accept')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}