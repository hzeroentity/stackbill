import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold">
            StackBill
          </Link>
          
          <div className="flex space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/dashboard/subscriptions">
              <Button variant="ghost">Subscriptions</Button>
            </Link>
            <Button variant="outline">Sign Out</Button>
          </div>
        </div>
      </nav>
      
      <main>{children}</main>
    </div>
  )
}