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
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { useLanguage } from "@/contexts/language-context"
import { trackEvent } from "@/components/analytics/google-analytics"

function NotifyMeButton() {
  const { t } = useLanguage()
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
        // Track team plan email signup
        trackEvent('email_signup', 'team_plan', email)
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
      {t('billing.getStartedTeam')}
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
              <span className="text-xl font-bold">StackBill.dev</span>
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
                  <VisuallyHidden>
                    <SheetTitle>Navigation Menu</SheetTitle>
                  </VisuallyHidden>
                  <div className="mt-6 space-y-4">
                    {/* Navigation Links */}
                    <div className="space-y-2">
                      <a href="#how-it-works" onClick={closeMenu}>
                        <Button variant="ghost" className="w-full justify-start">
                          {t('landing.mobileMenu.howItWorks')}
                        </Button>
                      </a>
                      <a href="#features" onClick={closeMenu}>
                        <Button variant="ghost" className="w-full justify-start">
                          {t('landing.mobileMenu.features')}
                        </Button>
                      </a>
                      <a href="#pricing" onClick={closeMenu}>
                        <Button variant="ghost" className="w-full justify-start">
                          {t('landing.mobileMenu.pricing')}
                        </Button>
                      </a>
                      <a href="#testimonials" onClick={closeMenu}>
                        <Button variant="ghost" className="w-full justify-start">
                          {t('landing.mobileMenu.testimonials')}
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
              <span className="text-xl font-bold">StackBill.dev</span>
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
                  {t('landing.hero.badge')}
                </span>
              </div>
            </a>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
{t('landing.hero.mainTitle')} <br /><span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">{t('landing.hero.highlightTitle')}</span>
          </h1>
          <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
            {t('landing.hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/login?mode=signup">
              <Button
                size="lg"
                className="text-lg px-8 py-4"
                onClick={() => trackEvent('cta_click', 'landing', 'hero_signup')}
              >
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
            {/* Desktop Video */}
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-auto hidden sm:block"
            >
              <source src="/stackbill_videorec_main_desktop.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Mobile Video */}
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-auto block sm:hidden"
            >
              <source src="/stackbill_videorec_main_mobile.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-20 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-red-200/20 dark:bg-red-600/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-orange-200/20 dark:bg-orange-600/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-200/20 dark:bg-yellow-600/10 rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto px-6 relative">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 mb-6">
              <span className="text-red-700 dark:text-red-300 text-sm font-medium">⚠️ Reality Check</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 dark:text-white">{t('landing.costCrisis.title')}</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">{t('landing.costCrisis.subtitle')}</p>
          </div>

          {/* Enhanced asymmetrical layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 max-w-6xl mx-auto">
            {/* Left side - Large featured stat */}
            <div className="text-left">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 lg:p-8 shadow-xl border border-red-100 dark:border-red-900/30 relative overflow-hidden h-full flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full"></div>
                <div className="relative">
                  {/* Mobile: horizontal layout, Desktop: vertical layout */}
                  <div className="flex items-center space-x-4 lg:block lg:space-x-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0 lg:mb-4">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div className="lg:pl-0">
                      <div className="text-4xl lg:text-5xl font-bold text-red-600 dark:text-red-400 mb-2">
                        {t('landing.costCrisis.stat2.number')}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 font-medium">
                        {t('landing.costCrisis.stat2.text')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Two smaller stats stacked */}
            <div className="flex flex-col h-full space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-yellow-100 dark:border-yellow-900/30 hover:shadow-xl transition-shadow flex-1">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                      {t('landing.costCrisis.stat1.number')}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 font-medium">
                      {t('landing.costCrisis.stat1.text')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-orange-100 dark:border-orange-900/30 hover:shadow-xl transition-shadow flex-1">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                    <Trash2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                      {t('landing.costCrisis.stat3.number')}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 font-medium">
                      {t('landing.costCrisis.stat3.text')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced conclusion */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 shadow-2xl max-w-4xl mx-auto">
              <p className="text-xl text-slate-100 font-semibold">
                {t('landing.costCrisis.conclusion')}
                <span className="text-red-400 font-bold mx-2">
                  {t('landing.costCrisis.conclusionAmount')}
                </span>
                {t('landing.costCrisis.conclusionEnd')}
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
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                {t('landing.howItWorks.step1.title')}
              </h3>
              <div className="bg-slate-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto"
                >
                  <source src="/stackbill_videorec_subs.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
{t('landing.howItWorks.step1.description')}
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Bell className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                {t('landing.howItWorks.step2.title')}
              </h3>
              <div className="bg-slate-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
                <Image
                  src="/email_summary.webp"
                  alt="Email Summary Report"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
              <p className="text-slate-600 dark:text-slate-300">
{t('landing.howItWorks.step2.description')}
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-6">
                <FolderTree className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                {t('landing.howItWorks.step3.title')}
              </h3>
              <div className="bg-slate-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto"
                >
                  <source src="/stackbill_videorec_proj.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
{t('landing.howItWorks.step3.description')}
              </p>
            </div>
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
              {t('landing.features.subtitle')}
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

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow dark:bg-gray-800">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center mb-4">
                  <FolderTree className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                </div>
                <CardTitle className="text-xl dark:text-white">{t('landing.features.multiProjectManagement.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 dark:text-slate-300">
                  {t('landing.features.multiProjectManagement.description')}
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
                  <span className="dark:text-slate-300">{t('landing.features.categories.title')}</span>
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
                    <Button
                      variant="outline"
                      className="w-full dark:border-slate-600 dark:text-white dark:hover:bg-slate-700"
                      onClick={() => trackEvent('cta_click', 'landing', 'pricing_free')}
                    >
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
                <p className="text-slate-600 dark:text-slate-300">{t('plans.perMonth')} • <span className="text-blue-700 dark:text-blue-300 font-semibold">Early access</span></p>
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
                    <Button
                      className="w-full"
                      onClick={() => trackEvent('cta_click', 'landing', 'pricing_pro')}
                    >
                    {t('billing.getStartedPro')}
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
                <p className="text-slate-600 dark:text-slate-300">{t('plans.perMonth')} • {t('billing.teamPlanDescription')}</p>
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
              {t('landing.testimonials.title')}
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              {t('landing.testimonials.subtitle')}
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
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-4"
              onClick={() => trackEvent('cta_click', 'landing', 'final_cta')}
            >
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
              <span className="text-xl font-bold text-white">StackBill.dev</span>
            </div>
            <p className="mb-6">{t('landing.footer.tagline')}</p>
            <div className="flex justify-center space-x-6 text-sm">
              <Link href="/privacy-policy" className="hover:text-white transition-colors">{t('landing.footer.privacy')}</Link>
              <Link href="/terms-of-service" className="hover:text-white transition-colors">{t('landing.footer.terms')}</Link>
              <Link href="/cookie-policy" className="hover:text-white transition-colors">{t('landing.footer.cookies')}</Link>
              <a href="mailto:hello@stackbill.dev" className="hover:text-white transition-colors">{t('landing.footer.support')}</a>
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
