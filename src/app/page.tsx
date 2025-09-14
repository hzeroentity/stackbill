'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import { Check, CreditCard, X, Calendar, Mail, BarChart3, Folder, FolderTree, Zap, DollarSign, Trash2, Plus, Bell, PieChart, Menu } from "lucide-react"
import { LandingHeaderButtons } from "@/components/landing-header-buttons"
import { ModeToggle } from "@/components/mode-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useLanguage } from "@/contexts/language-context"

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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { t } = useLanguage()

  const closeMenu = () => {
    setIsMenuOpen(false)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          {/* Mobile Layout */}
          <div className="flex justify-between items-center sm:hidden">
            {/* Left: Logo + StackBill */}
            <div className="flex items-center space-x-2">
              <Image
                src="/stackbill-logo.svg"
                alt="StackBill Logo"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <span className="text-xl font-bold">StackBill</span>
            </div>
            
            {/* Right: Theme Toggle + Burger Menu */}
            <div className="flex items-center space-x-2">
              <ModeToggle />
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="mt-6 space-y-4">
                    {/* Navigation Links */}
                    <div className="space-y-2">
                      <a href="#how-it-works" onClick={closeMenu}>
                        <Button variant="ghost" className="w-full justify-start">
                          {t('landing.hero.howItWorks')}
                        </Button>
                      </a>
                      <a href="#features" onClick={closeMenu}>
                        <Button variant="ghost" className="w-full justify-start">
                          {t('landing.features.title')}
                        </Button>
                      </a>
                      <a href="#pricing" onClick={closeMenu}>
                        <Button variant="ghost" className="w-full justify-start">
                          {t('landing.pricing.title')}
                        </Button>
                      </a>
                      <a href="#testimonials" onClick={closeMenu}>
                        <Button variant="ghost" className="w-full justify-start">
                          {t('landing.testimonials.title')}
                        </Button>
                      </a>
                    </div>
                    
                    {/* Separator */}
                    <div className="border-t border-muted my-4"></div>
                    
                    {/* Auth Buttons */}
                    <div className="space-y-3">
                      <Link href="/login" onClick={closeMenu} className="block">
                        <Button variant="outline" className="w-full justify-center">
                          {t('auth.signIn')}
                        </Button>
                      </Link>
                      <Link href="/login?mode=signup" onClick={closeMenu} className="block">
                        <Button className="w-full justify-center">
                          {t('landing.hero.cta')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
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
            <a href="#pricing" className="inline-block">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer">
                <span className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                  ✨ Just Launched - Early Access
                </span>
              </div>
            </a>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
Stop surprise charges. <br /><span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Track your stack in seconds.</span>
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
          <div className="text-center max-w-6xl mx-auto">
            <div className="mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 dark:text-white">The Hidden Cost Crisis</h2>
              <p className="text-xl text-slate-600 dark:text-slate-300">Most developers and SaaS founders are hemorrhaging money without realizing it</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">62%</div>
                <p className="text-slate-600 dark:text-slate-300 font-medium">of developers get surprise charges</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">$180</div>
                <p className="text-slate-600 dark:text-slate-300 font-medium">average monthly SaaS spend per founder</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
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
              {t('landing.howItWorks.title')}
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              {t('landing.howItWorks.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-16 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center justify-center gap-3 flex-wrap">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span>Add your subscriptions</span>
              </h3>
              <div className="bg-slate-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-auto"
                >
                  <source src="/add-subscriptions.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
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
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center justify-center gap-3 flex-wrap">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <span>Get reminders + reports</span>
              </h3>
              <div className="bg-slate-100 dark:bg-gray-700 rounded-lg p-6 mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto">
                  <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
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
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center justify-center gap-3 flex-wrap">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FolderTree className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <span>Organize by projects</span>
              </h3>
              <div className="bg-slate-100 dark:bg-gray-700 rounded-lg p-6 mb-4">
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mx-auto">
                  <PieChart className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
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
              {t('landing.problems.title')}
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              {t('landing.problems.subtitle')}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Problems Column */}
            <div>
              <h3 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white text-center">
                {t('landing.problems.withoutStackbill')}
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      {t('landing.problems.surpriseCharges.title')}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      {t('landing.problems.surpriseCharges.description')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      {t('landing.problems.doublePayments.title')}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      {t('landing.problems.doublePayments.description')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      {t('landing.problems.noVisibility.title')}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      {t('landing.problems.noVisibility.description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Solutions Column */}
            <div>
              <h3 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white text-center">
                {t('landing.problems.withStackbill')}
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      {t('landing.problems.neverMiss.title')}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      {t('landing.problems.neverMiss.description')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      {t('landing.problems.completeOverview.title')}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      {t('landing.problems.completeOverview.description')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                      {t('landing.problems.clearInsights.title')}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400">
                      {t('landing.problems.clearInsights.description')}
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
              {t('landing.features.title')}
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
                <CardTitle className="text-xl dark:text-white">{t('landing.features.monthlyYearly.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  {t('landing.features.monthlyYearly.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-800">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl dark:text-white">{t('landing.features.currencyConversion.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  {t('landing.features.currencyConversion.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow relative dark:bg-gray-800">
              <Badge className="absolute top-4 right-4 bg-purple-600 text-white text-xs">Pro</Badge>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl dark:text-white">{t('landing.features.emailReminders.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  {t('landing.features.emailReminders.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow relative dark:bg-gray-800">
              <Badge className="absolute top-4 right-4 bg-purple-600 text-white text-xs">Pro</Badge>
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-xl dark:text-white">{t('landing.features.monthlyReports.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  {t('landing.features.monthlyReports.description')}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-800">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Folder className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-xl dark:text-white">{t('landing.features.categories.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  {t('landing.features.categories.description')}
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
      <section id="pricing" className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              {t('landing.pricing.title')}
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              {t('landing.pricing.subtitle')}
            </p>
            <div className="mt-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2 inline-block">
              <p className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                🚀 Early Access: Lock in $4/month forever for the first 100 customers
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 shadow-lg dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2 dark:text-white">{t('plans.free.name')}</CardTitle>
                <div className="text-4xl font-bold mb-2 dark:text-white">$0</div>
                <p className="text-slate-600 dark:text-slate-300">{t('plans.free.description')}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">{t('plans.free.features.trackSubscriptions', { limit: 5 })}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">{t('plans.free.features.monthlyYearlyOverview')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">{t('plans.free.features.basicRenewalTracking')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Category organization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">{t('plans.free.features.organizeProjects', { limit: 2 })}</span>
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
                      {t('billing.getStartedFree')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-blue-200 dark:border-blue-600 shadow-xl relative bg-gradient-to-b from-blue-50 to-white dark:bg-gradient-to-b dark:from-blue-900/20 dark:to-gray-800">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-4 py-1 hover:bg-blue-600">Limited Time</Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2 dark:text-white">{t('plans.pro.name')}</CardTitle>
                <div className="text-4xl font-bold mb-2 dark:text-white">
                  <span className="text-2xl line-through text-slate-400 mr-2">$6</span>$4
                </div>
                <p className="text-slate-600 dark:text-slate-300">per month • <span className="text-blue-700 dark:text-blue-300 font-semibold">Early access</span></p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">All Free plan features included</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">{t('plans.pro.features.trackSubscriptions', { limit: 30 })}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">{t('plans.pro.features.organizeProjects', { limit: 10 })}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">{t('plans.pro.features.emailReminders')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">Monthly spending email reports</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">{t('plans.pro.features.prioritySupport')}</span>
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
                <Badge className="bg-purple-600 text-white px-4 py-1 hover:bg-purple-600">Coming Soon</Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2 dark:text-white">{t('billing.teamPlan')}</CardTitle>
                <div className="text-4xl font-bold mb-2 dark:text-white">$10</div>
                <p className="text-slate-600 dark:text-slate-300">per month • {t('billing.teamPlanDescription')}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">{t('billing.allProFeaturesIncluded')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">{t('billing.upToTeamMembers')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">{t('billing.unlimitedSubscriptions')} & {t('billing.unlimitedProjects')}</span>
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
                  <span className="dark:text-slate-300">{t('billing.advancedAnalytics')}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="dark:text-slate-300">{t('billing.prioritySupport')}</span>
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
      <section id="testimonials" className="py-20 bg-slate-50 dark:bg-gray-900/50 overflow-hidden">
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
                  &ldquo;{t('landing.testimonials.reviews.0.quote')}&rdquo;
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    M
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">{t('landing.testimonials.reviews.0.author')}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">{t('landing.testimonials.reviews.0.role')}</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  &ldquo;{t('landing.testimonials.reviews.1.quote')}&rdquo;
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                    S
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">{t('landing.testimonials.reviews.1.author')}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">{t('landing.testimonials.reviews.1.role')}</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  &ldquo;{t('landing.testimonials.reviews.2.quote')}&rdquo;
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">{t('landing.testimonials.reviews.2.author')}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">{t('landing.testimonials.reviews.2.role')}</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 4 */}
              <div className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  &ldquo;{t('landing.testimonials.reviews.3.quote')}&rdquo;
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    L
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">{t('landing.testimonials.reviews.3.author')}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">{t('landing.testimonials.reviews.3.role')}</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 5 */}
              <div className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  &ldquo;{t('landing.testimonials.reviews.4.quote')}&rdquo;
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    R
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">{t('landing.testimonials.reviews.4.author')}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">{t('landing.testimonials.reviews.4.role')}</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 6 */}
              <div className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  &ldquo;{t('landing.testimonials.reviews.5.quote')}&rdquo;
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    J
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">{t('landing.testimonials.reviews.5.author')}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">{t('landing.testimonials.reviews.5.role')}</div>
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
                  &ldquo;{t('landing.testimonials.reviews.2.quote')}&rdquo;
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">{t('landing.testimonials.reviews.2.author')}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">{t('landing.testimonials.reviews.2.role')}</div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  &ldquo;{t('landing.testimonials.reviews.3.quote')}&rdquo;
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    L
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">{t('landing.testimonials.reviews.3.author')}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">{t('landing.testimonials.reviews.3.role')}</div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  &ldquo;{t('landing.testimonials.reviews.4.quote')}&rdquo;
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    R
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">{t('landing.testimonials.reviews.4.author')}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">{t('landing.testimonials.reviews.4.role')}</div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border dark:border-gray-700">
                <blockquote className="text-lg text-slate-700 dark:text-slate-300 mb-4 italic">
                  &ldquo;{t('landing.testimonials.reviews.5.quote')}&rdquo;
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    J
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">{t('landing.testimonials.reviews.5.author')}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">{t('landing.testimonials.reviews.5.role')}</div>
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
            {t('landing.finalCta.title')}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t('landing.finalCta.subtitle')}
          </p>
          <Link href="/login?mode=signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              {t('landing.finalCta.button')}
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
            <p className="mb-6">{t('landing.footer.tagline')}</p>
            <div className="flex justify-center space-x-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">{t('landing.footer.privacy')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('landing.footer.terms')}</a>
              <a href="#" className="hover:text-white transition-colors">{t('landing.footer.support')}</a>
            </div>
            <div className="mt-6 flex justify-center">
              <LanguageSwitcher />
            </div>
            <div className="mt-6 pt-6 border-t border-slate-800">
              <p className="text-sm text-slate-500">
                {t('landing.footer.copyright', { year: new Date().getFullYear() })}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
