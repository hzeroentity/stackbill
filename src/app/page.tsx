import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">StackBill</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Track all your subscriptions in one place
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">Sign In</Button>
            </Link>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Track Everything</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Keep track of all your recurring subscriptions in one dashboard</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Smart Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p>See your total monthly and annual spend at a glance</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Never Forget</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Get notified before your subscriptions renew</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
