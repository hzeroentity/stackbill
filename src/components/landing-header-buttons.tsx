'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useLanguage } from "@/contexts/language-context"

export function LandingHeaderButtons() {
  const { user, isInitialized } = useAuth()
  const { t } = useLanguage()

  // Show authenticated state only when both initialized and user exists
  if (isInitialized && user) {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/dashboard">
          <Button size="lg">{t('billing.goToDashboard')}</Button>
        </Link>
      </div>
    )
  }

  // Show sign-in buttons by default (both during loading and when not authenticated)
  return (
    <div className="flex items-center space-x-2 sm:space-x-4">
      <Link href="/login">
        <Button variant="ghost">{t('auth.signIn')}</Button>
      </Link>
      <Link href="/login?mode=signup">
        <Button>
          <span className="sm:hidden">{t('landing.hero.cta')}</span>
          <span className="hidden sm:inline">{t('billing.getStartedFree')}</span>
        </Button>
      </Link>
    </div>
  )
}