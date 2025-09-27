'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CookiePolicyPage() {
  const router = useRouter()

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
                      <li>Page views and user interactions</li>
                      <li>Performance monitoring</li>
                      <li>Usage statistics</li>
                    </ul>
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
              <h2 className="text-2xl font-semibold mb-4">Managing your cookie preferences</h2>
              <p className="text-muted-foreground mb-4">
                You have the right to decide whether to accept or reject cookies. You can:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
                <li>Use our cookie consent banner to manage your preferences</li>
                <li>Configure your browser settings to refuse cookies</li>
                <li>Delete cookies that have already been set</li>
                <li>Contact us if you have questions about our cookie practices</li>
              </ul>
              <p className="text-muted-foreground">
                Please note that if you choose to refuse essential cookies, some parts of our website
                may not function properly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Third-party cookies</h2>
              <p className="text-muted-foreground mb-4">
                We may use third-party services that set their own cookies. These include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Analytics services:</strong> To understand website usage</li>
                <li><strong>Authentication providers:</strong> For secure login (GitHub OAuth)</li>
                <li><strong>Payment processors:</strong> For secure payment processing (Stripe)</li>
              </ul>
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