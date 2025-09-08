'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import { Check, CreditCard, X, Calendar, Mail, BarChart3, Folder, FolderTree } from "lucide-react"
import { LandingHeaderButtons } from "@/components/landing-header-buttons"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"

function NotifyMeButton() {
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleNotifyMe = () => {
    setShowEmailInput(true)
  }

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) return
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/email-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          source: 'team-plan',
          metadata: {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          }
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        console.error('Failed to submit email')
        // Could add error state here if needed
      }
    } catch (error) {
      console.error('Error submitting email:', error)
      // Could add error state here if needed
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center">
        <div className="text-green-600 dark:text-green-400 text-sm font-medium mb-2">
          ✓ You&apos;ll be notified when Team plan launches!
        </div>
      </div>
    )
  }

  if (showEmailInput) {
    return (
      <div className="space-y-3">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full"
        />
        <div className="flex space-x-2">
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !email.includes('@')}
            className="flex-1"
          >
            {isSubmitting ? 'Sending...' : 'Send'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowEmailInput(false)}
            className="px-3"
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button 
      onClick={handleNotifyMe}
      variant="outline" 
      className="w-full dark:border-slate-600 dark:text-white dark:hover:bg-slate-700"
    >
      Notify Me
    </Button>
  )
}

export default function Home() {
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image
                src="/stackbill-logo.svg"
                alt="StackBill Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-xl font-bold">StackBill</span>
            </div>
            <div className="flex items-center space-x-4">
              <ModeToggle />
              <LandingHeaderButtons />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
              <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                ✨ Just Launched - Early Access
              </span>
            </div>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
Stop surprise charges. <br /><span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Track your stack in seconds.</span>
          </h1>
          <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
Track every subscription in one clean dashboard with reminders, reports, and real-time currency conversion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/login?mode=signup">
              <Button size="lg" className="text-lg px-8 py-4">
Start Free
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
See How It Works
              </Button>
            </Link>
          </div>
          
          {/* Dashboard Preview Video */}
          <div className="max-w-6xl mx-auto mt-16 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-auto"
            >
              <source src="/hero-preview.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-5xl mx-auto">
            <div className="mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 dark:text-white">The Hidden Cost Crisis</h2>
              <p className="text-xl text-slate-600 dark:text-slate-300">Most developers and SaaS founders are hemorrhaging money without realizing it</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">⚡</div>
                <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">62%</div>
                <p className="text-slate-600 dark:text-slate-300 font-medium">of developers get surprise charges</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl mb-4">💸</div>
                <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">$180</div>
                <p className="text-slate-600 dark:text-slate-300 font-medium">average monthly SaaS spend per founder</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl mb-4">🗑️</div>
                <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">73%</div>
                <p className="text-slate-600 dark:text-slate-300 font-medium">pay for tools they rarely use</p>
              </div>
            </div>
            
            <div className="mt-12">
              <p className="text-xl text-slate-600 dark:text-slate-300 font-semibold">
                That&apos;s potentially <span className="text-slate-900 dark:text-white font-bold">$1,000+ per year</span> down the drain
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Simple, visual tracking in 3 steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">📝 Add your subscriptions</h3>
              <div className="bg-slate-100 dark:bg-gray-700 rounded-lg p-6 mb-4">
                <p className="text-slate-500 dark:text-gray-400">📝 Simple form UI placeholder</p>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
Quick form for name, cost, currency, billing period, renewal date, category, and project.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">📁 Get reminders + reports</h3>
              <div className="bg-slate-100 dark:bg-gray-700 rounded-lg p-6 mb-4">
                <p className="text-slate-500 dark:text-gray-400">📁 Project categorization view</p>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
Email alerts before renewals + monthly spending summaries straight to your inbox.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">📊 Organize by projects</h3>
              <div className="bg-slate-100 dark:bg-gray-700 rounded-lg p-6 mb-4">
                <p className="text-slate-500 dark:text-gray-400">📊 Dashboard analytics view</p>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
Group subscriptions per project for granular cost tracking and team insights.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
              <strong>Optional 4th step:</strong> Upgrade to Pro for email reminders, monthly reports, and unlimited subscriptions.
            </p>
          </div>
        </div>
      </section>

      {/* Problem vs Solution Section */}
      <section className="py-20 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Spreadsheets don&apos;t send reminders.
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              StackBill gives you clarity, control, and reminders in one clean dashboard.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Problems Column */}
            <div>
              <h3 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white text-center">
                Without StackBill
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Surprise charges
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      Surprise charges when a $39 tool renews you forgot about.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Double payments
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      Double payments because two tools overlap.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      No spending visibility
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      No idea how much you&apos;re actually spending.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Solutions Column */}
            <div>
              <h3 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white text-center">
                With StackBill
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Email alerts before every renewal
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      Email alerts before every renewal.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Monthly + yearly spending at a glance
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      Monthly + yearly spending at a glance.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Clear project-level insights and category breakdowns
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      Clear project-level insights and category breakdowns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Everything you need. Nothing you don&apos;t.
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Complete subscription management with all the features you actually need.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-800">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl dark:text-white">Track monthly & yearly spend</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  Know exactly how much your stack costs over time.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-800">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl dark:text-white">Auto currency conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  10+ currencies supported with live FX rates.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow relative dark:bg-gray-800">
              <Badge className="absolute top-4 right-4 bg-purple-600 text-white text-xs">Pro</Badge>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl dark:text-white">Email renewal reminders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  Never get surprised by a charge again.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow relative dark:bg-gray-800">
              <Badge className="absolute top-4 right-4 bg-purple-600 text-white text-xs">Pro</Badge>
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-xl dark:text-white">Monthly spending reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  Recap your costs + trends, every month.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-800">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Folder className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-xl dark:text-white">Smart categorization</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  Group tools by type: infra, analytics, AI, etc.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow relative dark:bg-gray-800">
              <Badge className="absolute top-4 right-4 bg-purple-600 text-white text-xs">Pro</Badge>
              <CardHeader>
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mb-4">
                  <FolderTree className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <CardTitle className="text-xl dark:text-white">Multi-project management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  Separate client projects or products in one place.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Start free, upgrade when you&apos;re ready
            </p>
            <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg px-4 py-2 inline-block">
              <p className="text-orange-800 dark:text-orange-200 text-sm font-medium">
                🚀 Early Access: Lock in $3/month forever for the first 100 customers
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2 dark:text-white">Free</CardTitle>
                <div className="text-4xl font-bold mb-2 dark:text-white">$0</div>
                <p className="text-slate-600 dark:text-slate-300">Perfect to start</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Track up to 5 subscriptions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Monthly spending report</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Renewal date tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Category organization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">2 projects for organization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Live currency conversion (10+ currencies)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Renewal status tracking</span>
                </div>
                <div className="pt-6">
                  <Link href="/login?mode=signup" className="w-full block">
                    <Button variant="outline" className="w-full dark:border-slate-600 dark:text-white dark:hover:bg-slate-700">
                      Get Started Free
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-blue-200 dark:border-blue-600 shadow-xl relative dark:bg-gray-800">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-orange-600 text-white px-4 py-1">Limited Time</Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2 dark:text-white">Pro</CardTitle>
                <div className="text-4xl font-bold mb-2 dark:text-white">
                  <span className="text-2xl line-through text-slate-400 mr-2">$5</span>$3
                </div>
                <p className="text-slate-600 dark:text-slate-300">per month • <span className="text-orange-600 font-semibold">Early access</span></p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">All Free plan features included</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Track up to 30 subscriptions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">10 projects for organization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Email renewal reminders (7, 3, 1 day alerts)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Monthly spending email reports</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Priority support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Export data & reports</span>
                </div>
                <div className="pt-6">
                  <Link href="/login?mode=signup" className="w-full block">
                    <Button className="w-full">
                      Start with Pro
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Team Plan */}
            <Card className="border-2 shadow-lg dark:bg-gray-800 dark:border-gray-700 relative opacity-95">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-600 text-white px-4 py-1">Coming Soon</Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2 dark:text-white">Team</CardTitle>
                <div className="text-4xl font-bold mb-2 dark:text-white">$12</div>
                <p className="text-slate-600 dark:text-slate-300">per month • Scale with your team</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">All Pro plan features included</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Up to 5 team members</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Unlimited subscriptions & projects</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Role-based permissions (Readonly, Editor, Admin)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Team billing & settings management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Advanced reporting & analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Priority team support</span>
                </div>
                <div className="pt-6" id="team-plan-notify">
                  <NotifyMeButton />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-slate-50 dark:bg-gray-900/50 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Early adopters are already saving money
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Be part of the first wave of developers taking control of their SaaS costs
            </p>
          </div>
          
          {/* Auto-scrolling Carousel */}
          <div className="relative overflow-hidden">
            <div className="flex space-x-6 animate-scroll hover:[animation-play-state:paused]">
              <style jsx global>{`
                @keyframes scroll {
                  0% {
                    transform: translateX(0);
                  }
                  100% {
                    transform: translateX(-50%);
                  }
                }
                .animate-scroll {
                  animation: scroll 60s linear infinite;
                  width: 200%;
                }
              `}</style>
              {/* Testimonial 1 */}
              <div className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  &ldquo;Way better than my messy Notion table. Love the reminders.&rdquo;
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">@michaelchen</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Full-stack Developer</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  &ldquo;Finally stopped getting surprise $99 charges. Totally worth it.&rdquo;
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">@sarah_kim</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">SaaS Founder</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  &ldquo;Simple, clean interface. Exactly what I needed to track my dev tools.&rdquo;
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">@alex_rodriguez</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Indie Hacker</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 4 */}
              <div className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  &ldquo;The FX conversion is perfect for my international stack.&rdquo;
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    L
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">@lucas_weber</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Tech Lead</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 5 */}
              <div className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  &ldquo;Saved me $200+ this month by catching unused subscriptions!&rdquo;
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    R
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">@rachel_tech</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Frontend Developer</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 6 */}
              <div className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  &ldquo;Clean design, no bloat. Just tracks what I need to know.&rdquo;
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    J
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">@jake_martinez</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">DevOps Engineer</div>
                  </div>
                </div>
              </div>

              {/* Complete duplicate set for seamless loop */}
              <div className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  &ldquo;Way better than my messy Notion table. Love the reminders.&rdquo;
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">@michaelchen</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Full-stack Developer</div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  &ldquo;Finally stopped getting surprise $99 charges. Totally worth it.&rdquo;
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">@sarah_kim</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">SaaS Founder</div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  &ldquo;Simple, clean interface. Exactly what I needed to track my dev tools.&rdquo;
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">@alex_rodriguez</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Indie Hacker</div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  &ldquo;The FX conversion is perfect for my international stack.&rdquo;
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    L
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">@lucas_weber</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Tech Lead</div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  &ldquo;Saved me $200+ this month by catching unused subscriptions!&rdquo;
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    R
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">@rachel_tech</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Frontend Developer</div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  &ldquo;Clean design, no bloat. Just tracks what I need to know.&rdquo;
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    J
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">@jake_martinez</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">DevOps Engineer</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-700">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Stop paying for tools you forgot about.
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start tracking your stack in 60 seconds.
          </p>
          <Link href="/login?mode=signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              Start Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Image
                src="/stackbill-logo.svg"
                alt="StackBill Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-white">StackBill</span>
            </div>
            <p className="mb-6">Built by developers, for developers. Simple SaaS cost tracking made right.</p>
            <div className="flex justify-center space-x-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
            <div className="mt-6 flex justify-center">
              <LanguageSwitcher />
            </div>
            <div className="mt-6 pt-6 border-t border-slate-800">
              <p className="text-sm text-slate-500">
                © 2025 StackBill. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
