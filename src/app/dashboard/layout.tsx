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
          <div className="container mx-auto px-4 sm:px-6 py-4">
            {/* Mobile Layout */}
            <div className="flex flex-col space-y-4 sm:hidden">
              <div className="flex justify-between items-center">
                <Link href="/dashboard" className="text-xl font-bold">
                  StackBill
                </Link>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
              <div className="flex justify-center">
                <Link href="/dashboard" className="flex-1 max-w-32">
                  <Button variant="ghost" size="sm" className="w-full">Dashboard</Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex justify-between items-center">
              <Link href="/dashboard" className="text-xl font-bold">
                StackBill
              </Link>
              
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <span className="text-sm text-muted-foreground">
                  {user?.email}
                </span>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </nav>
        
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  )
}