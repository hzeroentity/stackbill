'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/language-context'
import Link from 'next/link'

type CookieConsent = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

export default function CookiePolicyPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [consent, setConsent] = useState<CookieConsent>({
    necessary: true,
    analytics: false,
    marketing: false
  })
  const [hasExistingConsent, setHasExistingConsent] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load existing consent if available
    const savedConsent = localStorage.getItem('stackbill-cookie-consent')
    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent)
        setConsent({
          necessary: true, // Always true
          analytics: parsed.analytics || false,
          marketing: parsed.marketing || false
        })
        setHasExistingConsent(true)
      } catch (error) {
        console.error('Error parsing saved consent:', error)
      }
    }
  }, [])

  const saveConsent = (consentData: CookieConsent) => {
    localStorage.setItem('stackbill-cookie-consent', JSON.stringify({
      ...consentData,
      timestamp: Date.now()
    }))
    setHasExistingConsent(true)

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

  const handleSavePreferences = () => {
    saveConsent(consent)
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Cookie Policy</CardTitle>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">What are cookies?</h2>
              <p className="text-muted-foreground">
                Cookies are small text files that are stored on your computer or mobile device when you visit a website.
                They help websites remember information about your visit, which can make your next visit easier and
                the site more useful to you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">How we use cookies</h2>
              <p className="text-muted-foreground mb-6">
                StackBill uses cookies to enhance your experience and provide essential functionality.
                We categorize our cookies as follows:
              </p>

              <div className="space-y-6">
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-medium mb-2">Necessary Cookies</h3>
                    <p className="text-muted-foreground mb-3">
                      These cookies are necessary for the website to function properly. They enable core functionality
                      such as security, network management, and accessibility.
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Authentication and login status</li>
                      <li>Session management</li>
                      <li>Security features</li>
                      <li>Theme preferences (dark/light mode)</li>
                      <li>Language preferences</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-medium mb-2">Analytics Cookies</h3>
                    <p className="text-muted-foreground mb-3">
                      These cookies help us understand how visitors use our website, so we can improve
                      our services and user experience.
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Google Analytics - tracks page views, user interactions, and website performance</li>
                      <li>User behavior patterns to improve our service</li>
                      <li>Performance monitoring and error tracking</li>
                      <li>Conversion tracking for business metrics</li>
                    </ul>
                    <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        <strong>Google Analytics:</strong> We use Google Analytics to collect information about how you use our website.
                        This includes your IP address (anonymized), browser type, operating system, referring website, and pages visited.
                        This data is used to improve our website and services. You can opt-out of Google Analytics tracking by
                        disabling analytics cookies or using the{' '}
                        <a
                          href="https://tools.google.com/dlpage/gaoptout"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:no-underline"
                        >
                          Google Analytics Opt-out Browser Add-on
                        </a>.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-medium mb-2">Marketing Cookies</h3>
                    <p className="text-muted-foreground mb-3">
                      These cookies enable enhanced functionality and personalization.
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Remember your preferences</li>
                      <li>Improve user experience</li>
                      <li>Customize content based on your usage</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Manage Your Cookie Preferences</h2>
              <p className="text-muted-foreground mb-6">
                You can control which cookies we use by adjusting your preferences below. Changes will be saved automatically.
              </p>

              {mounted && (
                <Card className="border-2 border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-xl">Your Current Cookie Settings</CardTitle>
                    {hasExistingConsent && (
                      <p className="text-sm text-muted-foreground">
                        ✓ Your preferences have been saved
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Necessary Cookies */}
                    <div className="flex items-start justify-between gap-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex-1">
                        <h3 className="font-medium text-green-800 dark:text-green-400">
                          {t('cookies.necessary.title') || 'Necessary Cookies'}
                        </h3>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          {t('cookies.necessary.description') || 'These cookies are essential for the website to function properly.'}
                        </p>
                      </div>
                      <Switch checked={true} disabled className="mt-1" />
                    </div>

                    {/* Analytics Cookies */}
                    <div className="flex items-start justify-between gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex-1">
                        <h3 className="font-medium text-blue-800 dark:text-blue-400">
                          {t('cookies.analytics.title') || 'Analytics Cookies'}
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          {t('cookies.analytics.description') || 'Help us understand how you use our website to improve your experience.'}
                        </p>
                      </div>
                      <Switch
                        checked={consent.analytics}
                        onCheckedChange={(checked) => setConsent(prev => ({ ...prev, analytics: checked }))}
                        className="mt-1"
                      />
                    </div>

                    {/* Marketing Cookies */}
                    <div className="flex items-start justify-between gap-4 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex-1">
                        <h3 className="font-medium text-orange-800 dark:text-orange-400">
                          {t('cookies.marketing.title') || 'Marketing Cookies'}
                        </h3>
                        <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                          {t('cookies.marketing.description') || 'Used to show you relevant advertisements based on your interests.'}
                        </p>
                      </div>
                      <Switch
                        checked={consent.marketing}
                        onCheckedChange={(checked) => setConsent(prev => ({ ...prev, marketing: checked }))}
                        className="mt-1"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                      <Button onClick={handleSavePreferences} className="flex-1">
                        {t('cookies.savePreferences') || 'Save Preferences'}
                      </Button>
                      <Button variant="outline" onClick={acceptAll} className="flex-1">
                        {t('cookies.accept') || 'Accept All'}
                      </Button>
                      <Button variant="outline" onClick={declineAll} className="flex-1">
                        {t('cookies.decline') || 'Decline Optional'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Other Ways to Manage Cookies</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>Configure your browser settings to refuse cookies</li>
                  <li>Delete cookies that have already been set</li>
                  <li>Use browser extensions to manage cookie preferences</li>
                  <li>Contact us if you have questions about our cookie practices</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Please note that if you choose to refuse essential cookies, some parts of our website
                  may not function properly.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Third-party cookies</h2>
              <p className="text-muted-foreground mb-4">
                We may use third-party services that set their own cookies. These include:
              </p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Google Analytics</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li><strong>Purpose:</strong> Website analytics and performance tracking</li>
                    <li><strong>Data collected:</strong> Page views, user interactions, anonymized IP addresses</li>
                    <li><strong>Privacy policy:</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Privacy Policy</a></li>
                    <li><strong>Opt-out:</strong> <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics Opt-out</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">GitHub OAuth</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li><strong>Purpose:</strong> Secure authentication and login</li>
                    <li><strong>Data collected:</strong> Basic profile information (name, email)</li>
                    <li><strong>Privacy policy:</strong> <a href="https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GitHub Privacy Statement</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Stripe</h4>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li><strong>Purpose:</strong> Secure payment processing</li>
                    <li><strong>Data collected:</strong> Payment information, billing details</li>
                    <li><strong>Privacy policy:</strong> <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Stripe Privacy Policy</a></li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Updates to this policy</h2>
              <p className="text-muted-foreground">
                We may update this Cookie Policy from time to time to reflect changes in our practices
                or for other operational, legal, or regulatory reasons. We encourage you to review this
                policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact us</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    <strong>Email:</strong> hello@stackbill.dev<br />
                    <strong>Website:</strong> <Link href="/" className="text-primary hover:underline">stackbill.dev</Link>
                  </p>
                </CardContent>
              </Card>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}