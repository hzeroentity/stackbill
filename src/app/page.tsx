'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Check, CreditCard, TrendingUp, Bell, Users, Shield, X, Calendar, Mail, BarChart3, Globe, Moon, Folder } from "lucide-react"
import { LandingHeaderButtons } from "@/components/landing-header-buttons"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/contexts/language-context"

export default function Home() {
  const { t } = useLanguage()
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
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
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            {t('landing.hero.title')}, <br /><span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">keep your stack under control.</span>
          </h1>
          <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
            {t('landing.hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/login?mode=signup">
              <Button size="lg" className="text-lg px-8 py-4">
                {t('landing.hero.cta')}
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                {t('landing.hero.howItWorks')}
              </Button>
            </Link>
          </div>
          
          {/* Dashboard Preview Placeholder */}
          <div className="max-w-4xl mx-auto mt-16 bg-white dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 p-8">
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              📊 Dashboard Screenshot Placeholder
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
              (Spending summary + email preview)
            </p>
          </div>
        </div>
      </section>

      {/* Problem vs Solution Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
              Spreadsheets don't send reminders.
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              StackBill gives you clarity, control, and reminders — in one clean dashboard.
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
                      Forgot a $29 tool was still renewing and got hit with unexpected charges
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
                      Paid twice for the same subscription because you lost track of renewals
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
                      No idea how much you're spending each month on your dev tools
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
                      Never miss a renewal
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      Get email reminders before renewals so you can cancel or prepare for charges
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Complete overview
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      See all your subscriptions in one place, organized and easy to manage
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      Clear spending insights
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      Know exactly how much you spend monthly and yearly with smart breakdowns
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white dark:bg-slate-800">
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
              <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Add your subscriptions manually</h3>
              <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-6 mb-4">
                <p className="text-slate-500 dark:text-slate-400">📝 Simple form UI placeholder</p>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Quick form to add subscription name, cost, and renewal date
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Set renewal dates & currency</h3>
              <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-6 mb-4">
                <p className="text-slate-500 dark:text-slate-400">💰 Currency selector screenshot</p>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Choose from 10+ currencies with automatic conversion
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Get notified before renewals</h3>
              <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-6 mb-4">
                <p className="text-slate-500 dark:text-slate-400">📧 Example email preview</p>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Email reminders so you never get surprised again
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
              <strong>Optional 4th step:</strong> Upgrade to Pro to track more tools and get monthly summaries.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Everything you need. Nothing you don't.
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-slate-800">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl dark:text-white">Track monthly & yearly spend</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  See your total costs at a glance with smart category breakdowns and spending insights.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-slate-800">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl dark:text-white">Auto currency conversion (10+ supported)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  Track subscriptions in multiple currencies with real-time conversion rates.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow relative dark:bg-slate-800">
              <Badge className="absolute top-4 right-4 bg-purple-600 text-white text-xs">Pro</Badge>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl dark:text-white">Email renewal reminders</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  Get notified before subscription renewals so you never get surprise charges again.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow relative dark:bg-slate-800">
              <Badge className="absolute top-4 right-4 bg-purple-600 text-white text-xs">Pro</Badge>
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-xl dark:text-white">Monthly spending reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  Receive monthly spending summaries with insights and renewal forecasts.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-slate-800">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Folder className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-xl dark:text-white">Group tools by category</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  Organize subscriptions with predefined categories for better spending insights.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-slate-800">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Moon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <CardTitle className="text-xl dark:text-white">Dark mode + multi-language</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  Beautiful dark theme and support for English, Spanish, and Italian.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Start free, upgrade when you're ready
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 shadow-lg dark:bg-slate-800 dark:border-slate-700">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2 dark:text-white">Free</CardTitle>
                <div className="text-4xl font-bold mb-2 dark:text-white">€0</div>
                <p className="text-slate-600 dark:text-slate-300">Perfect for getting started</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Track up to 3 subscriptions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Monthly & annual spend overview</span>
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
                  <span className="dark:text-slate-300">Multi-currency support (10+ currencies)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Real-time currency conversion</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Dark mode & multi-language</span>
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
            <Card className="border-2 border-blue-200 dark:border-blue-600 shadow-xl relative dark:bg-slate-800">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2 dark:text-white">Pro</CardTitle>
                <div className="text-4xl font-bold mb-2 dark:text-white">€4</div>
                <p className="text-slate-600 dark:text-slate-300">per month</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Track up to 30 subscriptions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">All Free features included</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Email renewal reminders</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Monthly spending summaries</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Priority customer support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Advanced spending insights</span>
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
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              What developers are saying
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Join early testers getting better control of their SaaS costs
            </p>
          </div>
          
          {/* Auto-scrolling Carousel */}
          <div className="relative">
            <div className="flex space-x-6 animate-[scroll_30s_linear_infinite] hover:[animation-play-state:paused]">
              {/* Testimonial 1 */}
              <div className="flex-shrink-0 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border dark:border-slate-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  "Way better than my janky Notion page. Love the reminders."
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">@mikeDeveloper</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Full-stack Developer</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="flex-shrink-0 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border dark:border-slate-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  "Finally stopped getting surprise $99 charges from tools I forgot about."
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">@sarahCodes</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">SaaS Founder</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="flex-shrink-0 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border dark:border-slate-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  "Simple, clean interface. Exactly what I needed to track my dev tools."
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">@alexBuilds</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Indie Hacker</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 4 */}
              <div className="flex-shrink-0 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border dark:border-slate-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  "The currency conversion feature is perfect for my international subscriptions."
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    L
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">@lucasDev</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Tech Lead</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 5 */}
              <div className="flex-shrink-0 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border dark:border-slate-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  "Saved me $200+ this month by catching unused subscriptions!"
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    R
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">@rachelTech</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Frontend Developer</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 6 */}
              <div className="flex-shrink-0 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border dark:border-slate-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  "Clean design, no bloat. Just tracks what I need to know."
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    J
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">@jakeCode</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">DevOps Engineer</div>
                  </div>
                </div>
              </div>

              {/* Duplicate first few for seamless loop */}
              <div className="flex-shrink-0 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border dark:border-slate-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  "Way better than my janky Notion page. Love the reminders."
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">@mikeDeveloper</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Full-stack Developer</div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border dark:border-slate-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  "Finally stopped getting surprise $99 charges from tools I forgot about."
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">@sarahCodes</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">SaaS Founder</div>
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
            <p className="mb-6">Simple SaaS cost tracking for founders and development teams</p>
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
