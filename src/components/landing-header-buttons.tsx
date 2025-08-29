'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export function LandingHeaderButtons() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="w-16 h-9 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
        <div className="w-24 h-9 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/dashboard">
          <Button size="lg">Go to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <Link href="/login">
        <Button variant="ghost">Sign In</Button>
      </Link>
      <Link href="/login?mode=signup">
        <Button>Get Started Free</Button>
      </Link>
    </div>
  )
}