'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, MessageCircle, Clock, CheckCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function SupportPage() {
  const { t } = useLanguage()
  return (
    <div className="container mx-auto p-4 sm:p-6 pt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold">{t('support.title')}</h1>
        </div>
      </div>
      <div className="mb-6">
        <p className="text-muted-foreground">
          {t('support.subtitle')}
        </p>
      </div>

      {/* Contact Support Section */}
      <div className="mb-12">
        <Card className="border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              <CardTitle>{t('support.contactSupport')}</CardTitle>
            </div>
            <CardDescription>
              {t('support.personalizedHelp')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('support.emailSupport')}</p>
                  <p className="text-sm text-muted-foreground">{t('support.emailSupportDescription')}</p>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {t('support.responseTime')}
                </Badge>
              </div>
              <div className="pt-2">
                <Button 
                  onClick={() => window.open('mailto:hello@stackbill.dev?subject=StackBill Support Request')}
                  className="w-full sm:w-auto"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  hello@stackbill.dev
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('support.emailInstructions')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-8">
          <MessageCircle className="h-5 w-5" />
          <h2 className="text-2xl font-bold">{t('support.faq.title')}</h2>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                {t('support.faq.proPlanFeatures.question')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">
                {t('support.faq.proPlanFeatures.answer')}
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                {(() => {
                  const features = t('support.faq.proPlanFeatures.features', { returnObjects: true })
                  if (Array.isArray(features)) {
                    return features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))
                  }
                  return null
                })()}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                {t('support.faq.billingWork.question')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('support.faq.billingWork.answer')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                {t('support.faq.cancelDowngrade.question')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('support.faq.cancelDowngrade.answer')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                {t('support.faq.dataOnDowngrade.question')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">
                {t('support.faq.dataOnDowngrade.answer')}
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                {(() => {
                  const details = t('support.faq.dataOnDowngrade.details', { returnObjects: true })
                  if (Array.isArray(details)) {
                    return details.map((detail, index) => (
                      <li key={index}>• {detail}</li>
                    ))
                  }
                  return null
                })()}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                {t('support.faq.emailNotifications.question')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('support.faq.emailNotifications.answer')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                {t('support.faq.paymentSecurity.question')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('support.faq.paymentSecurity.answer')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                {t('support.faq.deleteAccount.question')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('support.faq.deleteAccount.answer')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                {t('support.faq.refunds.question')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('support.faq.refunds.answer')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                {t('support.faq.organizeProjects.question')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">
                {t('support.faq.organizeProjects.answer')}
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                {(() => {
                  const steps = t('support.faq.organizeProjects.steps', { returnObjects: true })
                  if (Array.isArray(steps)) {
                    return steps.map((step, index) => (
                      <li key={index}>• {step}</li>
                    ))
                  }
                  return null
                })()}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                {t('support.faq.currencies.question')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3">
                {t('support.faq.currencies.answer')}
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                {(() => {
                  const currencies = t('support.faq.currencies.currencies', { returnObjects: true })
                  if (Array.isArray(currencies)) {
                    return currencies.map((currency, index) => (
                      <li key={index}>• {currency}</li>
                    ))
                  }
                  return null
                })()}
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                {t('support.faq.currencies.note')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Still Need Help Section */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>{t('support.stillNeedHelp')}</CardTitle>
          <CardDescription>
            {t('support.cantFind')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => window.open('mailto:hello@stackbill.dev?subject=StackBill Support Request')}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              {t('support.contactSupport')}
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/dashboard/settings'}
            >
              {t('support.manageAccount')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}