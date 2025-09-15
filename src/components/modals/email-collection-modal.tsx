'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from '@/contexts/language-context'

interface EmailCollectionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  source: string
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

export function EmailCollectionModal({
  open,
  onOpenChange,
  title,
  description,
  source,
  onSuccess,
  onError
}: EmailCollectionModalProps) {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { t } = useLanguage()

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async () => {
    if (!isValidEmail(email)) {
      onError?.(t('billing.invalidEmailError'))
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/email-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), source })
      })

      if (response.ok) {
        onOpenChange(false)
        setEmail('')
        onSuccess?.(t('billing.emailRegisteredSuccess'))
      } else {
        const data = await response.json()
        onError?.(data.error || t('billing.emailRegistrationError'))
      }
    } catch {
      onError?.(t('billing.emailRegistrationError'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setEmail('')
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email-input">{t('common.email')}</Label>
            <Input
              id="email-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={handleClose}
            disabled={submitting}
          >
            {t('common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleSubmit}
            disabled={submitting || !email.trim() || !isValidEmail(email)}
          >
            {submitting ? t('dashboard.processing') : 'Notify Me'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}