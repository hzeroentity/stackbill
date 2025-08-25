'use client'

import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { signOut, user } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <nav className="border-b">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/dashboard" className="text-xl font-bold">
              StackBill
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/dashboard/subscriptions">
                <Button variant="ghost">Subscriptions</Button>
              </Link>
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </nav>
        
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  )
}