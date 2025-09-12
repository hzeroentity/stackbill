'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home, ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/contexts/language-context'

export default function NotFoundPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            {/* 404 Large Text */}
            <div className="space-y-2">
              <h1 className="text-6xl font-bold text-primary">404</h1>
              <h2 className="text-xl font-semibold text-foreground">
                {t('notFound.title')}
              </h2>
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-center">
              {t('notFound.description')}
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  {t('notFound.goHome')}
                </Link>
              </Button>
              
              <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('notFound.goBack')}
              </Button>
            </div>

            {/* Help Text */}
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                {t('notFound.helpText')} 
                <a 
                  href="mailto:hello@stackbill.dev" 
                  className="text-primary hover:underline ml-1"
                >
                  hello@stackbill.dev
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}