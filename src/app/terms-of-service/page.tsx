'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TermsOfServicePage() {
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
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
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
              <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
              <p className="text-muted-foreground mb-4">
                These Terms of Service ("Terms") constitute a legally binding agreement between you and Miral Media
                (P.IVA: IT04901620262) regarding your use of the StackBill subscription tracking service ("Service").
              </p>
              <p className="text-muted-foreground">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any
                part of these terms, then you may not access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
              <p className="text-muted-foreground mb-4">
                StackBill is a subscription tracking service that helps you:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Track and organize your recurring subscriptions</li>
                <li>Monitor expenses across multiple projects</li>
                <li>Receive renewal reminders and summaries (Pro plan)</li>
                <li>Manage subscription data and analyze spending patterns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Account Registration</h2>
              <p className="text-muted-foreground mb-4">
                To use StackBill, you must:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your account information</li>
                <li>Keep your login credentials secure and confidential</li>
                <li>Be responsible for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Subscription Plans and Billing</h2>

              <div className="space-y-6">
                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-medium mb-2">Free Plan</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Up to 5 subscriptions</li>
                      <li>Up to 2 projects</li>
                      <li>Basic tracking features</li>
                      <li>No billing or payment required</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-medium mb-2">Pro Plan ($4/month)</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Up to 30 subscriptions</li>
                      <li>Up to 10 projects</li>
                      <li>Email renewal reminders</li>
                      <li>Monthly summary emails</li>
                      <li>Priority support</li>
                    </ul>
                    <p className="text-muted-foreground mt-3">
                      Pro plan billing is processed monthly through Stripe. You may cancel at any time.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Payment Terms</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>All payments are processed securely through Stripe</li>
                <li>Charges are billed monthly in advance for Pro subscriptions</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>Price changes will be communicated 30 days in advance</li>
                <li>Failed payments may result in service suspension</li>
                <li>You can cancel your subscription at any time from your account settings</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Acceptable Use</h2>
              <p className="text-muted-foreground mb-4">You agree not to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Use the service for any unlawful purpose or to solicit unlawful activity</li>
                <li>Attempt to gain unauthorized access to our systems or other users&apos; accounts</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Upload malicious code, viruses, or harmful content</li>
                <li>Violate any applicable local, state, national, or international law</li>
                <li>Impersonate another person or entity</li>
                <li>Share your account credentials with others</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data and Privacy</h2>
              <p className="text-muted-foreground mb-4">
                Your privacy is important to us. Our collection and use of personal information is governed by our
                <Link href="/privacy-policy" className="text-primary hover:underline ml-1">Privacy Policy</Link>.
                By using StackBill, you consent to our data practices as described in that policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
              <p className="text-muted-foreground mb-4">
                StackBill and its original content, features, and functionality are owned by us and are protected
                by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="text-muted-foreground">
                You retain ownership of your subscription data. We do not claim ownership over any content you submit to the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Service Availability</h2>
              <p className="text-muted-foreground mb-4">
                We strive to maintain high service availability, but we do not guarantee:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>Uninterrupted or error-free service operation</li>
                <li>That the service will meet your specific requirements</li>
                <li>That defects will be corrected immediately</li>
                <li>That the service is free from viruses or harmful components</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground">
                To the maximum extent permitted by law, StackBill shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages, including without limitation, loss of profits, data, use,
                or other intangible losses, resulting from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Termination</h2>
              <p className="text-muted-foreground mb-4">
                We may terminate or suspend your account and access to the service at our sole discretion, without
                prior notice, for conduct that we believe violates these Terms or is harmful to other users,
                us, or third parties.
              </p>
              <p className="text-muted-foreground">
                You may terminate your account at any time through your account settings. Upon termination,
                your data will be deleted according to our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be interpreted and governed by the laws of Italy, without regard to its conflict
                of law provisions. Any disputes arising from these Terms or your use of the Service shall be subject
                to the exclusive jurisdiction of the courts of Italy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will notify users of any material
                changes via email or through the service. Your continued use of StackBill after changes
                constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>Email:</strong> hello@stackbill.dev</p>
                    <p><strong>Website:</strong> <Link href="/" className="text-primary hover:underline">stackbill.dev</Link></p>
                    <p><strong>Company:</strong> Miral Media</p>
                    <p><strong>P.IVA:</strong> IT04901620262</p>
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