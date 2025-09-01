'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Copy, Check, AlertTriangle } from "lucide-react"
import { useAuth } from '@/contexts/auth-context'

interface TwoFASetupProps {
  isEnabled: boolean
  onSetupComplete: () => void
}

export function TwoFASetup({ isEnabled, onSetupComplete }: TwoFASetupProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<'setup' | 'verify' | 'complete'>('setup')
  const [qrCode, setQrCode] = useState<string>('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationToken, setVerificationToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedCodes, setCopiedCodes] = useState(false)

  const setupTwoFA = async () => {
    if (!user?.id) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      const data = await response.json()

      if (response.ok) {
        setQrCode(data.qrCode)
        setBackupCodes(data.backupCodes)
        setStep('verify')
      } else {
        setError(data.error || 'Failed to setup 2FA')
      }
    } catch {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const verifyAndEnable = async () => {
    if (!user?.id || !verificationToken) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/2fa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: user.id, 
          token: verificationToken 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStep('complete')
        onSetupComplete()
      } else {
        setError(data.error || 'Invalid verification code')
      }
    } catch {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n')
    navigator.clipboard.writeText(codesText)
    setCopiedCodes(true)
    setTimeout(() => setCopiedCodes(false), 2000)
  }

  if (isEnabled) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication Enabled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-green-600">
              Secure
            </Badge>
            <span className="text-sm text-green-700 dark:text-green-300">
              Your admin account is protected with 2FA
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
          <AlertTriangle className="h-5 w-5" />
          Two-Factor Authentication Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'setup' && (
          <>
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Secure your admin account with Google Authenticator or similar TOTP app
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <h4 className="font-medium">Why enable 2FA?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Protects against password breaches</li>
                <li>• Adds an extra layer of security</li>
                <li>• Required for production admin accounts</li>
              </ul>
            </div>

            <Button 
              onClick={setupTwoFA} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Setting up...' : 'Setup Two-Factor Authentication'}
            </Button>
          </>
        )}

        {step === 'verify' && (
          <>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Step 1: Scan QR Code</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Open Google Authenticator and scan this QR code:
                </p>
                {qrCode && (
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <Image src={qrCode} alt="2FA QR Code" width={192} height={192} className="max-w-48" />
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Step 2: Save Backup Codes</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Store these backup codes in a safe place. Each can only be used once:
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-mono text-sm">
                  {backupCodes.map((code, index) => (
                    <div key={index}>{code}</div>
                  ))}
                </div>
                <Button 
                  onClick={copyBackupCodes}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  {copiedCodes ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Backup Codes
                    </>
                  )}
                </Button>
              </div>

              <div>
                <h4 className="font-medium mb-2">Step 3: Verify</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Enter the 6-digit code from your authenticator app:
                </p>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="000000"
                    value={verificationToken}
                    onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="font-mono text-center text-lg"
                  />
                  <Button 
                    onClick={verifyAndEnable}
                    disabled={loading || verificationToken.length !== 6}
                  >
                    {loading ? 'Verifying...' : 'Enable 2FA'}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {step === 'complete' && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              🎉 Two-factor authentication has been enabled successfully! Your admin account is now secure.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}