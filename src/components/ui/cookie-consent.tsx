"use client"

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import Link from 'next/link'

type CookieConsent = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

export function CookieConsentBanner() {
  const { t } = useLanguage()
  const { theme } = useTheme()
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [consent, setConsent] = useState<CookieConsent>({
    necessary: true,
    analytics: false,
    marketing: false
  })

  const isDark = theme === 'dark'

  useEffect(() => {
    setMounted(true)
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem('stackbill-cookie-consent')
    if (!savedConsent) {
      setShowBanner(true)
    }
  }, [])

  const saveConsent = (consentData: CookieConsent) => {
    localStorage.setItem('stackbill-cookie-consent', JSON.stringify({
      ...consentData,
      timestamp: Date.now()
    }))
    setShowBanner(false)
    setShowPreferences(false)

    // Enable/disable tracking based on consent
    if (consentData.analytics) {
      console.log('Analytics enabled')
      // Add analytics tracking code here
    }
    if (consentData.marketing) {
      console.log('Marketing enabled')
      // Add marketing tracking code here
    }
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
  if (!mounted || !showBanner) return null

  if (showPreferences) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <CardContent className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                {t('cookies.preferences.title') || 'Cookie Preferences'}
              </h2>
              <p className="text-muted-foreground text-sm">
                {t('cookies.preferences.description') || 'Choose which cookies you want to allow. You can change these settings at any time.'}
              </p>
            </div>

            <div className="space-y-4">
              {/* Necessary Cookies */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium">
                    {t('cookies.necessary.title') || 'Necessary Cookies'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('cookies.necessary.description') || 'These cookies are essential for the website to function properly.'}
                  </p>
                </div>
                <Switch checked={true} disabled />
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium">
                    {t('cookies.analytics.title') || 'Analytics Cookies'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('cookies.analytics.description') || 'Help us understand how you use our website to improve your experience.'}
                  </p>
                </div>
                <Switch
                  checked={consent.analytics}
                  onCheckedChange={(checked) => setConsent(prev => ({ ...prev, analytics: checked }))}
                />
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium">
                    {t('cookies.marketing.title') || 'Marketing Cookies'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('cookies.marketing.description') || 'Used to show you relevant advertisements based on your interests.'}
                  </p>
                </div>
                <Switch
                  checked={consent.marketing}
                  onCheckedChange={(checked) => setConsent(prev => ({ ...prev, marketing: checked }))}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button onClick={savePreferences} className="flex-1">
                {t('cookies.savePreferences') || 'Save Preferences'}
              </Button>
              <Button variant="outline" onClick={() => setShowPreferences(false)} className="flex-1">
                {t('common.cancel') || 'Cancel'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`
      fixed bottom-0 left-0 right-0 z-50 p-4 transition-all duration-300
      ${isDark
        ? 'bg-gray-900/95 border-gray-700'
        : 'bg-white/95 border-gray-200'
      }
      border-t backdrop-blur-sm shadow-lg
    `}>
      <div className={`
        max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
        ${isDark ? 'text-gray-100' : 'text-gray-900'}
      `}>
        <div className="flex-1 text-sm leading-relaxed">
          <span className="font-medium">
            {t('cookies.title') || 'We use cookies'}
          </span>
          <span className="block sm:inline sm:ml-2">
            {t('cookies.description') || 'We use essential cookies to make our site work and analytics cookies to understand how you use our site.'}
            {' '}
            <Link
              href="/cookie-policy"
              className={`underline hover:no-underline ${
                isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              {t('cookies.learnMore') || 'Learn more'}
            </Link>
          </span>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreferences(true)}
            className="text-xs"
          >
            {t('cookies.preferencesButton') || 'Cookie Preferences'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={declineAll}
            className="text-xs"
          >
            {t('cookies.decline') || 'Decline'}
          </Button>
          <Button
            size="sm"
            onClick={acceptAll}
            className="text-xs bg-blue-600 hover:bg-blue-700"
          >
            {t('cookies.accept') || 'Accept All'}
          </Button>
        </div>
      </div>
    </div>
  )
}