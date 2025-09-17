'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/contexts/language-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Eye, EyeOff, Github, Check, X, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { Progress } from '@/components/ui/progress'

export function AuthForm() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [socialLoading, setSocialLoading] = useState(false)
  const [showSuccessState, setShowSuccessState] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const mode = searchParams.get('mode')
    const error = searchParams.get('error')
    const message = searchParams.get('message')
    
    if (mode === 'signup') {
      setIsSignUp(true)
    }
    
    // Handle confirmation messages
    if (message === 'confirmed') {
      setMessage('Email confirmed successfully! You can now log in.')
    } else if (message === 'already_confirmed') {
      setMessage('Email already confirmed. You can log in.')
    }
    
    // Handle confirmation errors
    if (error === 'invalid_link') {
      setMessage('Invalid or expired confirmation link. Please request a new one.')
    } else if (error === 'confirmation_failed') {
      setMessage('Email confirmation failed. Please try again or contact support.')
    } else if (error === 'server_error') {
      setMessage('Server error. Please try again later.')
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
      setMessage(error instanceof Error ? error.message : 'Failed to log in with GitHub. Please try again.')
      setSocialLoading(false)
    }
  }

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Password strength validation
  const validatePassword = (password: string) => {
    const hasUpper = /[A-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSymbol = /[^a-zA-Z0-9]/.test(password)
    const hasMinLength = password.length >= 8
    
    const checks = [
      { label: 'At least 8 characters', valid: hasMinLength },
      { label: 'One uppercase letter', valid: hasUpper },
      { label: 'One number', valid: hasNumber },
      { label: 'One symbol', valid: hasSymbol }
    ]
    
    const validCount = checks.filter(check => check.valid).length
    const strength = (validCount / checks.length) * 100
    
    return { checks, strength, isValid: validCount === checks.length }
  }

  const passwordValidation = validatePassword(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isLoading || socialLoading) return // Prevent double submissions
    
    // Client-side validation
    if (!validateEmail(email)) {
      setMessage('Please enter a valid email address.')
      return
    }
    
    if (isSignUp && email !== confirmEmail) {
      setMessage('Email addresses do not match.')
      return
    }
    
    if (isSignUp && !passwordValidation.isValid) {
      setMessage('Please meet all password requirements.')
      return
    }
    
    if (!isSignUp && password.length < 6) {
      setMessage('Password must be at least 6 characters long.')
      return
    }
    
    setIsLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const processedEmail = email.trim().toLowerCase()
        
        // Use our custom signup API with Resend
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: processedEmail,
            password
          })
        })
        
        const result = await response.json()
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to create account')
        }
        
        if (result.success) {
          setShowSuccessState(true)
          setMessage('Please check your email for the confirmation link to complete your account setup!')
        }
      } else {
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        })
        
        
        if (error) throw error
        
        if (data?.user && data?.session) {
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
        <p className="text-center text-sm text-muted-foreground">
          {isSignUp
            ? t('auth.signupTagline')
            : t('auth.signinTagline')
          }
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {showSuccessState ? (
          /* Success State */
          <div className="text-center space-y-4 py-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Check Your Email!</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                We&apos;ve sent a confirmation link to <strong>{email}</strong>.
                <br />Click the link in your email to complete your account setup.
              </p>
            </div>
            <div className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowSuccessState(false)
                  setEmail('')
                  setConfirmEmail('')
                  setPassword('')
                  setMessage('')
                  setIsSignUp(false)
                }}
                className="w-full"
              >
                Back to Log In
              </Button>
            </div>
          </div>
        ) : (
          /* Normal Auth Flow */
          <>
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

        <div className="text-center">
          <span className="text-xs uppercase text-muted-foreground">{t('auth.orContinueWithEmail')}</span>
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
          
          {isSignUp && (
            <div>
              <Input
                type="email"
                placeholder="Confirm email address"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                required
                className={`h-11 ${email && confirmEmail && email !== confirmEmail ? 'border-red-500' : ''}`}
              />
              {email && confirmEmail && email !== confirmEmail && (
                <p className="text-red-500 text-sm mt-1">Email addresses do not match</p>
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={t('auth.enterPassword')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={isSignUp ? 8 : 6}
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {isSignUp && password && (
              <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium dark:text-gray-200">Password strength</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {passwordValidation.strength === 100 ? 'Strong' : 
                     passwordValidation.strength >= 75 ? 'Good' :
                     passwordValidation.strength >= 50 ? 'Fair' : 'Weak'}
                  </span>
                </div>
                <Progress 
                  value={passwordValidation.strength} 
                  className="h-2"
                />
                <div className="space-y-1">
                  {passwordValidation.checks.map((check, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                      {check.valid ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <X className="w-3 h-3 text-red-500" />
                      )}
                      <span className={check.valid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button 
            type="submit" 
            className="w-full h-11" 
            disabled={isLoading || socialLoading || (isSignUp && (!passwordValidation.isValid || email !== confirmEmail))}
          >
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
            message.includes('Check your email') || 
            message.includes('Please check your email') ||
            message.includes('Email confirmed successfully') ||
            message.includes('Email already confirmed')
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
          </>
        )}
      </CardContent>
    </Card>
  )
}