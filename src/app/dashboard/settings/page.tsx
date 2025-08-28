'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@supabase/supabase-js'
import { Currency, SUPPORTED_CURRENCIES, getDefaultCurrency, setDefaultCurrency } from '@/lib/currency-preferences'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SettingsPage() {
  const { user } = useAuth()
  const [emailLoading, setEmailLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [defaultCurrency, setDefaultCurrencyState] = useState<Currency>('USD')
  
  // Password change form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Email change form
  const [newEmail, setNewEmail] = useState('')
  
  // Load currency preference on mount
  useEffect(() => {
    setDefaultCurrencyState(getDefaultCurrency())
  }, [])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }
    
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }
    
    setPasswordLoading(true)
    setMessage(null)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      
      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setIsPasswordDialogOpen(false)
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update password' 
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newEmail || !newEmail.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' })
      return
    }
    
    setEmailLoading(true)
    setMessage(null)
    
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      })
      
      if (error) throw error
      
      setMessage({ 
        type: 'success', 
        text: 'Email update initiated! Check both your old and new email for confirmation links.' 
      })
      setNewEmail('')
      setIsEmailDialogOpen(false)
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update email' 
      })
    } finally {
      setEmailLoading(false)
    }
  }

  const handleCurrencyChange = (currency: Currency) => {
    setDefaultCurrency(currency)
    setDefaultCurrencyState(currency)
    setMessage({ 
      type: 'success', 
      text: `Default currency updated to ${SUPPORTED_CURRENCIES.find(c => c.value === currency)?.label}` 
    })
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account preferences and security settings</p>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
          <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Account Settings Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Account Information */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
              <p className="text-base">{user?.email || 'Loading...'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
              <p className="text-base">
                {user?.created_at 
                  ? new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Loading...'
                }
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  Change Email
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Email Address</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEmailChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-email">New Email Address</Label>
                    <Input
                      id="new-email"
                      type="email"
                      placeholder="Enter new email address"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      disabled={emailLoading}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEmailDialogOpen(false)}
                      disabled={emailLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={emailLoading || !newEmail}>
                      {emailLoading ? 'Updating...' : 'Update Email'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={passwordLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={passwordLoading}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsPasswordDialogOpen(false)}
                      disabled={passwordLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={passwordLoading || !newPassword || !confirmPassword}
                    >
                      {passwordLoading ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Currency Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle>Currency Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Default Currency</Label>
              <p className="text-sm text-muted-foreground mb-2">
                This will be used for dashboard totals and as the default when adding new subscriptions.
              </p>
              <Select value={defaultCurrency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="w-full sm:w-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.symbol} {currency.label} ({currency.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}