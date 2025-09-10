'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, MessageCircle, Clock, CheckCircle } from "lucide-react"

export default function SupportPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="pt-8 mb-12">
        <h1 className="text-3xl font-bold mb-4">Support</h1>
        <p className="text-muted-foreground">
          Get help with your StackBill account and find answers to common questions
        </p>
      </div>

      {/* Contact Support Section */}
      <div className="mb-12">
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <CardTitle>Contact Support</CardTitle>
            </div>
            <CardDescription>
              Need personalized help? Our team is here to assist you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">Get help via email</p>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  24h response
                </Badge>
              </div>
              <div className="pt-2">
                <Button 
                  onClick={() => window.open('mailto:hello@stackbill.dev?subject=StackBill Support Request')}
                  className="w-full sm:w-auto"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  hello@stackbill.dev
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Include your account email and describe your issue for faster assistance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-8">
          <MessageCircle className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                What&apos;s included in the Pro plan?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">
                The Pro plan includes everything you need to manage your SaaS subscriptions professionally:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                <li>• Track up to 30 subscriptions (vs 5 on free)</li>
                <li>• Organize across 10 projects (vs 2 on free)</li>
                <li>• Email renewal alerts (7, 3, and 1 day warnings)</li>
                <li>• Monthly spending summary emails</li>
                <li>• Complete billing history</li>
                <li>• Priority support</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                How does billing work?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                StackBill Pro is billed monthly at €4/month via Stripe. Your subscription automatically renews each month 
                until you cancel. You can downgrade anytime and keep Pro access until your current billing period ends. 
                All billing is secure and PCI-compliant through Stripe.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                Can I cancel or downgrade anytime?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes! You can cancel your Pro subscription anytime with no penalty. When you downgrade, your subscription 
                is immediately canceled but you keep Pro access until the end of your current billing period. After that, 
                you&apos;ll be moved to the free plan automatically.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                What happens to my data if I downgrade?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">
                If you have more subscriptions or projects than the free plan allows when you downgrade:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                <li>• We&apos;ll keep your most recent subscriptions and projects</li>
                <li>• Older excess data will be automatically deleted</li>
                <li>• You&apos;ll receive a confirmation email with details</li>
                <li>• All data removal is permanent and cannot be undone</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                How do email notifications work?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Pro users receive automatic email notifications to help manage their subscriptions. You&apos;ll get renewal 
                alerts 7, 3, and 1 days before subscriptions renew, plus monthly summary emails with spending insights. 
                All emails include unsubscribe options and you can customize preferences in your settings.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                Is my payment information secure?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Absolutely. All payments are processed through Stripe, one of the world&apos;s most trusted payment processors. 
                We never store your credit card information on our servers. Stripe is PCI DSS Level 1 certified and used 
                by millions of businesses worldwide, including Twitter, Lyft, and Shopify.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                Can I delete my account completely?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes, you can permanently delete your StackBill account anytime from your settings page. This will 
                immediately cancel any active subscription, delete all your data from our servers, and send you a 
                farewell email. Account deletion is permanent and cannot be undone.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                Do you offer refunds?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Since StackBill Pro is a low-cost monthly service, we generally don&apos;t offer refunds. However, 
                if you&apos;re experiencing technical issues or have concerns about your billing, please contact our 
                support team at hello@stackbill.dev and we&apos;ll work with you to find a solution.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                How do I organize subscriptions with projects?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">
                Projects help you organize subscriptions by team, client, or purpose:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                <li>• Create projects in Settings &gt; Project Management</li>
                <li>• Assign subscriptions to projects when adding them</li>
                <li>• Switch between projects using the dropdown in the dashboard</li>
                <li>• Use the &quot;General&quot; project for personal or unorganized subscriptions</li>
                <li>• Free users get 2 projects, Pro users get 10 projects</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                What currencies does StackBill support?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">
                StackBill supports 10 major currencies with live conversion rates:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                <li>• USD (US Dollar), EUR (Euro), GBP (British Pound)</li>
                <li>• CAD (Canadian Dollar), AUD (Australian Dollar)</li>
                <li>• JPY (Japanese Yen), CHF (Swiss Franc)</li>
                <li>• SEK (Swedish Krona), NOK (Norwegian Krone), DKK (Danish Krone)</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                All amounts are automatically converted to your preferred display currency using live exchange rates.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Still Need Help Section */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>Still need help?</CardTitle>
          <CardDescription>
            Can&apos;t find what you&apos;re looking for? We&apos;re here to help.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => window.open('mailto:hello@stackbill.dev?subject=StackBill Support Request')}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Contact Support
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/dashboard/settings'}
            >
              Manage Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}