'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PrivacyPolicyPage() {
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
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
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
              <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
              <p className="text-muted-foreground mb-4">
                StackBill (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains
                how we collect, use, disclose, and safeguard your information when you use our subscription tracking
                service at stackbill.dev.
              </p>
              <p className="text-muted-foreground">
                <strong>Contact Information:</strong><br />
                Miral Media<br />
                P.IVA: IT04901620262<br />
                Email: hello@stackbill.dev
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>

              <div className="space-y-6">
                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-medium mb-2">Account Information</h3>
                    <p className="text-muted-foreground mb-3">
                      When you create an account, we collect:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Email address</li>
                      <li>Name (if provided)</li>
                      <li>GitHub profile information (if using GitHub OAuth)</li>
                      <li>Payment information (processed securely by Stripe)</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-medium mb-2">Subscription Data</h3>
                    <p className="text-muted-foreground mb-3">
                      To provide our service, we store:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Subscription names and descriptions</li>
                      <li>Costs and billing frequencies</li>
                      <li>Renewal dates and categories</li>
                      <li>Project organizations</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-medium mb-2">Usage Information</h3>
                    <p className="text-muted-foreground mb-3">
                      We may collect analytics data to improve our service:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Google Analytics data (only with your consent)</li>
                      <li>Pages visited and features used</li>
                      <li>Browser and device information</li>
                      <li>IP address (anonymized) and general location</li>
                      <li>Session duration and interaction patterns</li>
                      <li>Button clicks and user interactions</li>
                    </ul>
                    <div className="mt-3 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-md">
                      <p className="text-sm text-orange-800 dark:text-orange-300">
                        <strong>Google Analytics:</strong> We use Google Analytics to understand how you use our website.
                        This service collects information anonymously and reports website trends without identifying
                        individual visitors. You can opt-out by declining analytics cookies or using the{' '}
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
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
              <p className="text-muted-foreground mb-4">We use your information to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Provide and maintain our subscription tracking service</li>
                <li>Process payments and manage billing (via Stripe)</li>
                <li>Send renewal reminders and monthly summaries (Pro plan)</li>
                <li>Improve our service and user experience</li>
                <li>Provide customer support when requested</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your data only in these circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Service Providers:</strong> Stripe for payment processing, Supabase for database hosting, Google Analytics for website analytics (with consent), Resend for email delivery</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
                <li><strong>Consent:</strong> When you explicitly authorize us to share your information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
              <p className="text-muted-foreground mb-4">We implement industry-standard security measures:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Data encryption in transit and at rest</li>
                <li>Secure authentication with GitHub OAuth</li>
                <li>Regular security audits and monitoring</li>
                <li>PCI-compliant payment processing via Stripe</li>
                <li>Access controls and audit logging</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
              <p className="text-muted-foreground mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct your information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your subscription data</li>
                <li><strong>Objection:</strong> Opt out of marketing communications</li>
                <li><strong>Restriction:</strong> Limit how we process your data</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                To exercise these rights, please contact us at hello@stackbill.dev or use the account settings in our application.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your personal data only as long as necessary to provide our services and comply with legal obligations.
                When you delete your account, we remove your personal data within 30 days, except where retention is required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">International Data Transfers</h2>
              <p className="text-muted-foreground">
                Your data may be processed in countries outside your residence. We ensure appropriate safeguards are in place
                to protect your data according to this privacy policy and applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this privacy policy from time to time. We will notify you of any significant changes
                by email or through our service. Your continued use of StackBill after changes constitutes acceptance
                of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about this privacy policy or our data practices, please contact us:
              </p>
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>Email:</strong> hello@stackbill.dev</p>
                    <p><strong>Website:</strong> <Link href="/" className="text-primary hover:underline">stackbill.dev</Link></p>
                    <p><strong>Company:</strong> Miral Media</p>
                    <p><strong>P.IVA:</strong> IT04901620262</p>
                    <p><strong>Response Time:</strong> We respond to privacy inquiries within 30 days</p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}