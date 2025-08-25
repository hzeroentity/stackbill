import { AuthForm } from '@/components/auth/auth-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Welcome to StackBill</h1>
          <p className="text-muted-foreground">Sign in to manage your subscriptions</p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}