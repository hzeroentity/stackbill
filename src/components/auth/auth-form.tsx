'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Github } from 'lucide-react'
import Image from 'next/image'

export function AuthForm() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [socialLoading, setSocialLoading] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const mode = searchParams.get('mode')
    if (mode === 'signup') {
      setIsSignUp(true)
    }
  }, [searchParams])

  const handleGitHubAuth = async () => {
    if (socialLoading || isLoading) return
    
    setSocialLoading(true)
    setMessage('')
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (error) throw error
      // OAuth will redirect, so we don't need to handle success here
    } catch (error: unknown) {
      console.error('GitHub auth error:', error)
      setMessage(error instanceof Error ? error.message : 'Failed to sign in with GitHub. Please try again.')
      setSocialLoading(false)
    }
  }

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isLoading || socialLoading) return // Prevent double submissions
    
    // Client-side validation
    if (!validateEmail(email)) {
      setMessage('Please enter a valid email address.')
      return
    }
    
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.')
      return
    }
    
    setIsLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const processedEmail = email.trim().toLowerCase()
        console.log('Attempting signup with email:', email)
        console.log('Email after processing:', processedEmail)
        console.log('Password length:', password.length)
        console.log('Domain:', processedEmail.split('@')[1])
        
        // Try signup with minimal options first
        const { data, error } = await supabase.auth.signUp({
          email: processedEmail,
          password
        })
        
        console.log('Full Signup response:', JSON.stringify({ data, error }, null, 2))
        
        if (error) {
          console.log('Error name:', error.name)
          console.log('Error message:', error.message)
          console.log('Error status:', error.status)
        }
        
        if (error) {
          console.error('Signup error details:', error)
          // Handle specific Supabase errors
          if (error.message.includes('already registered') || error.message.includes('User already registered')) {
            throw new Error('An account with this email already exists. Please sign in instead.')
          }
          if (error.message.includes('invalid') || error.message.includes('Invalid')) {
            throw new Error('This email address appears to be blocked or invalid. Please try a different email address or contact support.')
          }
          if (error.message.includes('Email address')) {
            const domain = processedEmail.split('@')[1]
            throw new Error(`Supabase is rejecting the domain "${domain}". This may be due to Supabase's email validation settings. Please check your Supabase Dashboard → Authentication → Settings for any domain restrictions, or try with a different email domain. Original error: ${error.message}`)
          }
          throw error
        }
        
        if (data?.user && !data?.session) {
          setMessage('Please check your email for the confirmation link to complete your account setup!')
        } else if (data?.session) {
          // User was auto-confirmed, redirect will happen automatically
          console.log('Signup successful with session')
        }
      } else {
        console.log('Attempting signin with email:', email)
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        })
        
        console.log('Signin response:', { data, error })
        
        if (error) throw error
        
        if (data?.user && data?.session) {
          console.log('Sign in successful with session')
          // Don't redirect manually, let the auth context handle it
        }
      }
    } catch (error: unknown) {
      console.error('Auth error:', error)
      setMessage(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-0">
      <CardHeader className="space-y-2 pb-6">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Image
            src="/stackbill-logo.svg"
            alt="StackBill Logo"
            width={40}
            height={40}
            className="w-10 h-10"
          />
          <span className="text-2xl font-bold">StackBill</span>
        </div>
        <CardTitle className="text-center text-2xl">
          {isSignUp ? t('auth.createAccount') : t('auth.welcome')}
        </CardTitle>
        <p className="text-center text-sm text-muted-foreground">
          {isSignUp 
            ? 'Start tracking your SaaS costs for free' 
            : 'Sign in to your dashboard'
          }
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* GitHub Authentication */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-11"
          onClick={handleGitHubAuth}
          disabled={socialLoading || isLoading}
        >
          {socialLoading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <Github className="w-5 h-5" />
          )}
          <span className="ml-2">{t('auth.withGithub')}</span>
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-muted-foreground">Or continue with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder={t('auth.enterEmail')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
            />
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={t('auth.enterPassword')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <Button type="submit" className="w-full h-11" disabled={isLoading || socialLoading}>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Please wait...</span>
              </div>
            ) : (
              isSignUp ? t('auth.createAccount') : t('auth.signIn')
            )}
          </Button>
        </form>
        
        {message && (
          <div className={`text-sm text-center p-3 rounded-md ${
            message.includes('Check your email') || message.includes('Please check your email')
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}
        
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setMessage('')
            }}
            className="text-sm text-primary hover:underline"
          >
            {isSignUp ? t('auth.alreadyHaveAccount') + ' ' + t('auth.signIn') : t('auth.noAccount') + ' ' + t('auth.signUp')}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}