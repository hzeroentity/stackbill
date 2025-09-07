'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export function LandingHeaderButtons() {
  const { user, isInitialized } = useAuth()

  // Show authenticated state only when both initialized and user exists
  if (isInitialized && user) {
    return (
      <div className="flex items-center space-x-4">
        <Link href="/dashboard">
          <Button size="lg">Go to Dashboard</Button>
        </Link>
      </div>
    )
  }

  // Show sign-in buttons by default (both during loading and when not authenticated)
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