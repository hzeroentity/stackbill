import { NextRequest, NextResponse } from 'next/server'
import { EmailTemplates } from '@/lib/resend'
import type { Subscription } from '@/lib/database.types'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'confirmation'

  try {
    let emailHtml = ''

    switch (type) {
      case 'confirmation':
        const confirmationEmail = EmailTemplates.confirmationEmail(
          'https://stackbill.dev/confirm?token=preview-token',
          'preview@example.com'
        )
        emailHtml = confirmationEmail.html
        break

      case 'renewal':
        const mockRenewals = [{
          id: 'test-1',
          name: 'Supabase Pro',
          category: 'Cloud & Hosting',
          amount: 25.00,
          currency: 'USD',
          billing_period: 'monthly',
          renewal_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          daysUntilRenewal: 3,
          is_active: true,
          user_id: 'test',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]
        const renewalEmail = EmailTemplates.renewalAlertEmail(
          'preview@example.com',
          mockRenewals as (Subscription & { daysUntilRenewal: number })[],
          'Preview User'
        )
        emailHtml = renewalEmail.html
        break

      case 'summary':
        const mockSummaryData = {
          monthlyTotal: 155.94,
          yearlyTotal: 1871.28,
          currency: 'USD' as const,
          subscriptionCount: 9,
          categoryBreakdown: {
            'Cloud & Hosting': 65.00,
            'Developer Tools': 30.00,
            'AI Tools & LLMs': 20.00,
            'Analytics & Monitoring': 15.00,
            'Communication': 10.00,
            'Design & Creative': 15.94
          },
          topSubscriptions: [
            { name: 'Vercel Pro', monthlyAmount: 20.00, currency: 'USD' },
            { name: 'Supabase Pro', monthlyAmount: 25.00, currency: 'USD' },
            { name: 'ChatGPT Plus', monthlyAmount: 20.00, currency: 'USD' },
            { name: 'PostHog Cloud', monthlyAmount: 15.00, currency: 'USD' },
            { name: 'Resend Pro', monthlyAmount: 10.00, currency: 'USD' }
          ],
          month: new Date().toLocaleString('en-US', { month: 'long' }),
          year: new Date().getFullYear()
        }
        const summaryEmail = EmailTemplates.monthlySummaryEmail(
          'preview@example.com',
          mockSummaryData
        )
        emailHtml = summaryEmail.html
        break

      case 'cancellation':
        const cancellationEmail = EmailTemplates.cancellationEmail('preview@example.com')
        emailHtml = cancellationEmail.html
        break

      case 'goodbye':
        const goodbyeEmail = EmailTemplates.goodbyeEmail('preview@example.com')
        emailHtml = goodbyeEmail.html
        break

      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

    return new NextResponse(emailHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    })

  } catch (error) {
    console.error('Error generating email preview:', error)
    return NextResponse.json({ error: 'Failed to generate preview' }, { status: 500 })
  }
}