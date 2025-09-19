import { Resend } from 'resend'
import { Subscription } from './database.types'
import { Currency } from './currency-preferences'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is not set')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

// Currency symbol utility
function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF',
    'CNY': '¥',
    'SEK': 'kr',
    'NOK': 'kr',
    'MXN': '$',
    'INR': '₹',
    'NZD': 'NZ$',
    'SGD': 'S$',
    'HKD': 'HK$',
    'KRW': '₩',
    'TRY': '₺',
    'RUB': '₽',
    'BRL': 'R$',
    'ZAR': 'R'
  }
  return symbols[currency] || currency
}

// Email templates and utilities
export const EmailTemplates = {
  // Confirmation email template
  confirmationEmail: (confirmationUrl: string, userEmail: string) => ({
    from: 'StackBill <hello@stackbill.dev>',
    to: userEmail,
    subject: 'Confirm your StackBill account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Confirm Your Account - StackBill</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; text-align: center; padding: 40px 20px; }
            .logo-container { display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
            .logo-svg { width: 32px; height: 24px; margin-right: 12px; }
            .logo-text { font-size: 24px; font-weight: bold; color: white; }
            .content { padding: 40px; }
            .welcome-title { color: #1f2937; font-size: 28px; font-weight: 700; margin: 0 0 24px 0; text-align: center; }
            .button { 
              display: inline-block; 
              padding: 16px 32px; 
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              color: white; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: 600;
              font-size: 16px;
              margin: 24px 0;
              box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
              transition: all 0.2s;
            }
            .button:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4); }
            .footer { margin-top: 40px; padding: 30px 40px; background-color: #f8fafc; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; text-align: center; }
            .text-center { text-align: center; }
            .link-fallback { background-color: #f0f9ff; padding: 16px; border-radius: 8px; border: 1px solid #bae6fd; margin: 20px 0; word-break: break-all; color: #0369a1; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-container">
                <img src="https://www.stackbill.dev/stackbill-logo.svg" alt="StackBill" style="width: 32px; height: 32px; margin-right: 12px;" />
                <div class="logo-text">StackBill</div>
              </div>
              <div style="font-size: 16px; opacity: 0.9; color: white;">Welcome aboard!</div>
            </div>
            
            <div class="content">
              <h1 class="welcome-title">Welcome to StackBill! 🎉</h1>
              
              <p style="font-size: 16px; line-height: 1.7; color: #4b5563;">Thanks for joining StackBill, the subscription tracker built by developers, for developers.</p>
              
              <p style="font-size: 16px; line-height: 1.7; color: #4b5563;">Please confirm your account by clicking the button below:</p>
              
              <div class="text-center">
                <a href="${confirmationUrl}" class="button">✅ Confirm Your Account</a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">If the button above does not work, copy and paste this link:</p>
              <div class="link-fallback">${confirmationUrl}</div>
              
              <p style="font-size: 16px; line-height: 1.7; color: #4b5563;">Once confirmed, you can start tracking your subscriptions and take control of your recurring expenses. 🚀</p>
            </div>
            
            <div class="footer">
              <p style="margin: 0 0 16px 0;">If you did not create this account, you can safely ignore this email.</p>
              <p style="margin: 0;"><strong>The StackBill Team</strong><br>
              <a href="mailto:hello@stackbill.dev" style="color: #2563eb; text-decoration: none;">hello@stackbill.dev</a></p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  // Renewal alert email template
  renewalAlertEmail: (
    userEmail: string, 
    upcomingRenewals: (Subscription & { daysUntilRenewal: number })[],
    userName?: string
  ) => ({
    from: 'StackBill <hello@stackbill.dev>',
    to: userEmail,
    subject: `🔔 ${upcomingRenewals.length} subscription${upcomingRenewals.length > 1 ? 's' : ''} renewing soon`,
    html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Subscription Renewal Alert - StackBill</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segui UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f9fafb;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #ffffff; border-radius: 12px 12px 0 0; padding: 40px 30px 20px 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                      <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                        <img src="https://www.stackbill.dev/stackbill-logo.svg" alt="StackBill" style="width: 32px; height: 32px; margin-right: 12px;" />
                        <h1 style="margin: 0; color: #2563eb; font-size: 28px; font-weight: bold;">StackBill</h1>
                      </div>
                      <p style="margin: 0; color: #6b7280; font-size: 16px;">Subscription Renewal Alerts</p>
                    </td>
                  </tr>
                  
                  <!-- Alert Card -->
                  <tr>
                    <td style="padding: 30px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 20px;">
                            <h2 style="margin: 0 0 8px 0; color: #92400e; font-size: 22px; font-weight: 600;">⚠️ Renewal Alert</h2>
                            <p style="margin: 0; color: #92400e; font-size: 18px;">You have ${upcomingRenewals.length} subscription${upcomingRenewals.length > 1 ? 's' : ''} renewing soon${userName ? `, ${userName}` : ''}.</p>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Subscription Items -->
                      ${upcomingRenewals.map(sub => {
                        const badgeColor = sub.daysUntilRenewal <= 1 ? '#dc2626' : 
                                          sub.daysUntilRenewal <= 3 ? '#f59e0b' : '#2563eb'
                        const badgeText = sub.daysUntilRenewal === 0 ? 'Due Today' : 
                                         sub.daysUntilRenewal === 1 ? 'Due Tomorrow' : 
                                         `${sub.daysUntilRenewal} days left`
                        return `
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 16px;">
                          <tr>
                            <td style="padding: 20px;">
                              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                  <td style="vertical-align: top;">
                                    <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 20px; font-weight: 600;">${sub.name}</h3>
                                    <p style="margin: 4px 0; color: #6b7280; font-size: 16px;"><strong>Category:</strong> ${sub.category}</p>
                                    <p style="margin: 4px 0; color: #1f2937; font-size: 16px; font-weight: 600;"><strong>Amount:</strong> ${getCurrencySymbol(sub.currency)}${sub.amount.toFixed(2)} (${sub.billing_period})</p>
                                    <p style="margin: 4px 0; color: #6b7280; font-size: 16px;"><strong>Renewal Date:</strong> ${new Date(sub.renewal_date).toLocaleDateString('en-US', { 
                                      weekday: 'long', 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    })}</p>
                                  </td>
                                  <td style="vertical-align: top; text-align: right; width: 120px;">
                                    <span style="background-color: ${badgeColor}; color: #ffffff; padding: 8px 12px; border-radius: 4px; font-size: 12px; font-weight: 500; white-space: nowrap;">${badgeText}</span>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        `
                      }).join('')}
                      
                      <!-- CTA Button -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center" style="padding: 30px 0;">
                            <a href="https://stackbill.dev/dashboard" style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 18px; display: inline-block;">Manage Subscriptions</a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Footer -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px;">
                        <tr>
                          <td>
                            <p style="margin: 0 0 12px 0; color: #374151; font-size: 16px;"><strong>💡 Pro Tip:</strong> Set up automatic payments or calendar reminders to avoid service interruptions.</p>
                            <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 15px;">This is an automated reminder from StackBill. You're receiving this because you're a Pro user with email notifications enabled.</p>
                            <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 15px;">Questions? Reply to this email and we'll help you out.</p>
                            <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">
                              <a href="https://stackbill.dev/unsubscribe?type=alerts&email=${encodeURIComponent(userEmail)}" style="color: #6b7280; text-decoration: underline;">Unsubscribe from alerts</a> | 
                              <a href="https://stackbill.dev/dashboard/settings" style="color: #6b7280; text-decoration: underline;">Manage email preferences</a>
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `
      StackBill - Subscription Renewal Alert
      
      You have ${upcomingRenewals.length} subscription${upcomingRenewals.length > 1 ? 's' : ''} renewing soon${userName ? `, ${userName}` : ''}.
      
      ${upcomingRenewals.map(sub => {
        const daysText = sub.daysUntilRenewal === 0 ? 'Due Today' : 
                        sub.daysUntilRenewal === 1 ? 'Due Tomorrow' : 
                        `${sub.daysUntilRenewal} days left`
        return `• ${sub.name} - ${daysText}
  Category: ${sub.category}
  Amount: ${getCurrencySymbol(sub.currency)}${sub.amount.toFixed(2)} (${sub.billing_period})
  Renewal Date: ${new Date(sub.renewal_date).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`
      }).join('\n\n')}
      
      Manage your subscriptions: https://stackbill.dev/dashboard
      
      Pro Tip: Set up automatic payments or calendar reminders to avoid service interruptions.
      
      This is an automated reminder from StackBill. You're receiving this because you're a Pro user with email notifications enabled.
      
      Questions? Reply to this email and we'll help you out.
      
      Unsubscribe from alerts: https://stackbill.dev/unsubscribe?type=alerts&email=${encodeURIComponent(userEmail)}
      Manage email preferences: https://stackbill.dev/dashboard/settings
    `
  }),

  // Monthly summary email template
  monthlySummaryEmail: (
    userEmail: string,
    summaryData: {
      monthlyTotal: number;
      yearlyTotal: number;
      currency: Currency;
      subscriptionCount: number;
      categoryBreakdown: Record<string, number>;
      topSubscriptions: { name: string; monthlyAmount: number; currency: string }[];
      month: string;
      year: number;
    }
  ) => ({
    from: 'StackBill <hello@stackbill.dev>',
    to: userEmail,
    subject: `📈 Your ${summaryData.month} ${summaryData.year} spending summary`,
    html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Monthly Summary - StackBill</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f9fafb;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #ffffff; border-radius: 12px 12px 0 0; padding: 40px 30px 20px 30px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                      <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                        <img src="https://www.stackbill.dev/stackbill-logo.svg" alt="StackBill" style="width: 32px; height: 32px; margin-right: 12px;" />
                        <h1 style="margin: 0; color: #2563eb; font-size: 28px; font-weight: bold;">StackBill</h1>
                      </div>
                      <p style="margin: 0; color: #6b7280; font-size: 16px;">Your ${summaryData.month} ${summaryData.year} Summary</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 30px;">
                      <h2 style="margin: 0 0 30px 0; color: #1f2937; font-size: 28px; font-weight: 600; text-align: center;">Your ${summaryData.month} ${summaryData.year} Summary</h2>
                      
                      <!-- Summary Metrics -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 24px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td align="center" style="padding: 16px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; width: 50%;">
                                  <div style="font-size: 32px; font-weight: bold; color: #2563eb; margin-bottom: 4px;">${getCurrencySymbol(summaryData.currency)}${summaryData.monthlyTotal.toFixed(2)}</div>
                                  <div style="font-size: 16px; color: #6b7280;">Monthly Spending</div>
                                </td>
                                <td style="width: 16px;"></td>
                                <td align="center" style="padding: 16px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; width: 50%;">
                                  <div style="font-size: 32px; font-weight: bold; color: #2563eb; margin-bottom: 4px;">${summaryData.subscriptionCount}</div>
                                  <div style="font-size: 16px; color: #6b7280;">Active Subscriptions</div>
                                </td>
                              </tr>
                            </table>
                            
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                              <tr>
                                <td align="center">
                                  <div style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">Annual Projection</div>
                                  <div style="font-size: 24px; font-weight: 600; color: #1f2937;">${getCurrencySymbol(summaryData.currency)}${summaryData.yearlyTotal.toFixed(2)}</div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Spending by Category -->
                      <h3 style="margin: 30px 0 16px 0; color: #1f2937; font-size: 22px; font-weight: 600;">📊 Spending by Category</h3>
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 20px;">
                            ${Object.entries(summaryData.categoryBreakdown)
                              .sort(([,a], [,b]) => b - a)
                              .map(([category, amount], index, arr) => `
                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="${index < arr.length - 1 ? 'border-bottom: 1px solid #f3f4f6; padding-bottom: 12px; margin-bottom: 12px;' : ''}">
                                  <tr>
                                    <td style="color: #1f2937; font-weight: 500; font-size: 16px;">${category}</td>
                                    <td align="right" style="color: #2563eb; font-weight: 600; font-size: 16px;">${getCurrencySymbol(summaryData.currency)}${amount.toFixed(2)}</td>
                                  </tr>
                                </table>
                              `).join('')}
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Top Subscriptions -->
                      ${summaryData.topSubscriptions.length > 0 ? `
                        <h3 style="margin: 30px 0 16px 0; color: #1f2937; font-size: 22px; font-weight: 600;">💸 Top Subscriptions</h3>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 30px;">
                          <tr>
                            <td style="padding: 20px;">
                              ${summaryData.topSubscriptions.slice(0, 5).map((sub, index, arr) => `
                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="${index < arr.length - 1 ? 'margin-bottom: 8px;' : ''}">
                                  <tr>
                                    <td style="color: #1f2937; font-size: 16px;">${sub.name}</td>
                                    <td align="right" style="color: #6b7280; font-weight: 500; font-size: 16px;">${getCurrencySymbol(sub.currency)}${sub.monthlyAmount.toFixed(2)}/month</td>
                                  </tr>
                                </table>
                              `).join('')}
                            </td>
                          </tr>
                        </table>
                      ` : ''}
                      
                      <!-- CTA Button -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center" style="padding: 30px 0;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px; display: inline-block;">View Full Dashboard</a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Footer -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px;">
                        <tr>
                          <td>
                            <p style="margin: 0 0 12px 0; color: #374151; font-size: 16px;"><strong>💡 Insights:</strong> ${summaryData.monthlyTotal > 100 ? 
                              'Consider reviewing your subscriptions to identify potential savings.' : 
                              'Great job keeping your subscription costs under control!'}</p>
                            <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 15px;">This monthly summary is generated automatically for Pro users. You can manage your email preferences in your account settings.</p>
                            <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 15px;">Questions? Reply to this email and we'll help you out.</p>
                            <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: center;">
                              <a href="https://stackbill.dev/unsubscribe?type=summaries&email=${encodeURIComponent(userEmail)}" style="color: #6b7280; text-decoration: underline;">Unsubscribe from summaries</a> | 
                              <a href="https://stackbill.dev/dashboard/settings" style="color: #6b7280; text-decoration: underline;">Manage email preferences</a>
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `
      StackBill - Monthly Summary for ${summaryData.month} ${summaryData.year}
      
      Your ${summaryData.month} ${summaryData.year} Summary
      
      MONTHLY SPENDING: ${getCurrencySymbol(summaryData.currency)}${summaryData.monthlyTotal.toFixed(2)}
      ACTIVE SUBSCRIPTIONS: ${summaryData.subscriptionCount}
      ANNUAL PROJECTION: ${getCurrencySymbol(summaryData.currency)}${summaryData.yearlyTotal.toFixed(2)}
      
      SPENDING BY CATEGORY:
      ${Object.entries(summaryData.categoryBreakdown)
        .sort(([,a], [,b]) => b - a)
        .map(([category, amount]) => `• ${category}: ${getCurrencySymbol(summaryData.currency)}${amount.toFixed(2)}`).join('\n')}
      
      ${summaryData.topSubscriptions.length > 0 ? `
      TOP SUBSCRIPTIONS:
      ${summaryData.topSubscriptions.slice(0, 5).map(sub => `• ${sub.name}: ${getCurrencySymbol(sub.currency)}${sub.monthlyAmount.toFixed(2)}/month`).join('\n')}
      ` : ''}
      
      View your full dashboard: https://stackbill.dev/dashboard
      
      Insights: ${summaryData.monthlyTotal > 100 ? 
        'Consider reviewing your subscriptions to identify potential savings.' : 
        'Great job keeping your subscription costs under control!'}
      
      This monthly summary is generated automatically for Pro users. You can manage your email preferences in your account settings.
      
      Questions? Reply to this email and we'll help you out.
      
      Unsubscribe from summaries: https://stackbill.dev/unsubscribe?type=summaries&email=${encodeURIComponent(userEmail)}
      Manage email preferences: https://stackbill.dev/dashboard/settings
    `
  }),

  // Cancellation confirmation email template
  cancellationEmail: (userEmail: string) => ({
    from: 'StackBill <hello@stackbill.dev>',
    to: userEmail,
    subject: 'Your Pro plan has been cancelled - StackBill',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Plan Cancelled - StackBill</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }
            .header { background-color: #ffffff; color: #1f2937; text-align: center; padding: 40px 20px; border-bottom: 1px solid #e5e7eb; }
            .logo-container { display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
            .logo-text { font-size: 24px; font-weight: bold; color: #2563eb; }
            .content { padding: 40px; }
            .success-box { background-color: #dcfce7; border: 1px solid #16a34a; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .features-list { background: #f0f9ff; padding: 20px; border-radius: 8px; border: 1px solid #bae6fd; margin: 24px 0; }
            .features-list ul { margin: 0; padding-left: 20px; color: #0c4a6e; }
            .features-list li { margin: 8px 0; }
            .button { 
              display: inline-block; 
              padding: 14px 28px; 
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              color: white; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: 600;
              font-size: 16px;
              margin: 24px 0;
              box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
              transition: all 0.2s;
            }
            .button:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4); }
            .footer { padding: 30px 40px; background-color: #f8fafc; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; text-align: center; }
            .text-center { text-align: center; }
            .feedback-note { background: #fffbeb; padding: 20px; border-radius: 8px; border: 1px solid #fed7aa; margin: 24px 0; color: #92400e; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-container">
                <img src="https://www.stackbill.dev/stackbill-logo.svg" alt="StackBill" style="width: 32px; height: 32px; margin-right: 12px;" />
                <div class="logo-text">StackBill</div>
              </div>
              <div style="font-size: 16px; color: #6b7280;">Subscription Management</div>
            </div>
            
            <div class="content">
              <div class="success-box">
                <h2 style="color: #16a34a; margin: 0 0 10px 0;">✅ Plan Successfully Cancelled</h2>
                <p style="margin: 0; color: #15803d;">Your Pro plan has been downgraded to the Free plan. No future charges will be made.</p>
              </div>
              
              <h1 style="color: #1f2937; font-size: 28px; font-weight: 700; margin: 0 0 24px 0; text-align: center;">Thanks for using StackBill!</h1>
              
              <p style="font-size: 16px; line-height: 1.7; color: #4b5563; text-align: center; margin-bottom: 32px;">We've successfully cancelled your Pro subscription and downgraded your account to our Free plan.</p>
              
              <div class="features-list">
                <h3 style="color: #0c4a6e; margin: 0 0 16px 0; font-size: 18px;">What this means:</h3>
                <ul>
                  <li>✅ <strong>No future billing</strong> - your subscription has been cancelled</li>
                  <li>✅ You can still <strong>track up to 5 subscriptions</strong></li>
                  <li>✅ You can manage <strong>up to 2 projects</strong></li>
                  <li>❌ Email reminders are no longer available</li>
                  <li>❌ Monthly summary emails have been disabled</li>
                </ul>
              </div>
              
              <p style="font-size: 16px; line-height: 1.7; color: #4b5563; text-align: center;">You can continue using StackBill with the Free plan, or upgrade back to Pro anytime if you need more features.</p>
              
              <div class="feedback-note">
                <p style="margin: 0; font-size: 16px;">💬 We're sad to see you go! If there's anything we could have done better, please reply to this email and let us know. Your feedback helps us improve.</p>
              </div>
              
              <div class="text-center">
                <a href="https://stackbill.dev/dashboard" class="button">View Your Dashboard</a>
              </div>
            </div>
            
            <div class="footer">
              <p style="margin: 0 0 16px 0;">If you cancelled by mistake, you can easily upgrade back to Pro from your dashboard.</p>
              <p style="margin: 0;"><strong>The StackBill Team</strong><br>
              <a href="mailto:hello@stackbill.dev" style="color: #2563eb; text-decoration: none;">hello@stackbill.dev</a></p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  // Account deletion goodbye email template
  goodbyeEmail: (userEmail: string) => ({
    from: 'StackBill <hello@stackbill.dev>',
    to: userEmail,
    subject: 'Sorry to see you go - StackBill',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Account Deleted - StackBill</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; }
            .header { background-color: #ffffff; color: #1f2937; text-align: center; padding: 40px 20px; border-bottom: 1px solid #e5e7eb; }
            .logo-container { display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
            .logo-text { font-size: 24px; font-weight: bold; color: #2563eb; }
            .content { padding: 40px; }
            .goodbye-box { background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .features-list { background: #f0f9ff; padding: 20px; border-radius: 8px; border: 1px solid #bae6fd; margin: 24px 0; }
            .features-list ul { margin: 0; padding-left: 20px; color: #0c4a6e; }
            .features-list li { margin: 8px 0; }
            .feedback-section { background: #fffbeb; padding: 20px; border-radius: 8px; border: 1px solid #fed7aa; margin: 24px 0; }
            .button { 
              display: inline-block; 
              padding: 14px 28px; 
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
              color: white; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: 600;
              font-size: 16px;
              margin: 24px 0;
              box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
              transition: all 0.2s;
            }
            .button:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4); }
            .footer { padding: 30px 40px; background-color: #f8fafc; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; text-align: center; }
            .text-center { text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-container">
                <img src="https://www.stackbill.dev/stackbill-logo.svg" alt="StackBill" style="width: 32px; height: 32px; margin-right: 12px;" />
                <div class="logo-text">StackBill</div>
              </div>
              <div style="font-size: 16px; color: #6b7280;">Account Deletion</div>
            </div>
            
            <div class="content">
              <div class="goodbye-box">
                <h2 style="color: #92400e; margin: 0 0 10px 0;">👋 Account Successfully Deleted</h2>
                <p style="margin: 0; color: #92400e;">Your StackBill account and all associated data have been permanently deleted.</p>
              </div>
              
              <h1 style="color: #1f2937; font-size: 28px; font-weight: 700; margin: 0 0 24px 0; text-align: center;">Sorry to see you go!</h1>
              
              <p style="font-size: 16px; line-height: 1.7; color: #4b5563; text-align: center; margin-bottom: 32px;">We've successfully deleted your StackBill account as requested. Here's what happened:</p>
              
              <div class="features-list">
                <h3 style="color: #0c4a6e; margin: 0 0 16px 0; font-size: 18px;">What we've done:</h3>
                <ul>
                  <li>✅ Permanently deleted all your subscriptions and project data</li>
                  <li>✅ Cancelled any active Pro subscriptions (no future charges)</li>
                  <li>✅ Removed your account from all our systems</li>
                  <li>✅ Disabled all email notifications</li>
                </ul>
              </div>
              
              <div class="feedback-section">
                <h3 style="color: #92400e; margin: 0 0 16px 0; font-size: 18px;">We'd love your feedback!</h3>
                <p style="margin: 0 0 16px 0; color: #92400e;">Your feedback is incredibly valuable to us. Could you take just 30 seconds to let us know why you decided to leave? This helps us improve StackBill for future users.</p>
                
                <p style="margin: 0 0 12px 0; color: #92400e; font-weight: 600;">What could we have done better?</p>
                <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                  <li>Missing features you needed?</li>
                  <li>Pricing too high?</li>
                  <li>Found a better alternative?</li>
                  <li>App was too complex?</li>
                  <li>Something else?</li>
                </ul>
              </div>
              
              <div class="text-center">
                <a href="mailto:hello@stackbill.dev?subject=StackBill%20Feedback%20-%20Account%20Deletion&body=Hi%20StackBill%20Team%2C%0A%0AI%20recently%20deleted%20my%20account%20and%20wanted%20to%20share%20some%20feedback%3A%0A%0A%5BPlease%20share%20your%20thoughts%20here%5D%0A%0AThanks%21" class="button">Share Quick Feedback</a>
              </div>
              
              <p style="font-size: 16px; line-height: 1.7; color: #4b5563; text-align: center;">If you ever want to come back, you can create a new account anytime at <a href="https://stackbill.dev" style="color: #2563eb; text-decoration: none;">stackbill.dev</a>. We'll be here!</p>
            </div>
            
            <div class="footer">
              <p style="margin: 0 0 16px 0;">Thank you for giving StackBill a try. We hope it helped you get better visibility into your subscription costs.</p>
              <p style="margin: 0 0 16px 0;">If you have any questions about your account deletion, reply to this email - we're happy to help.</p>
              <p style="margin: 0 0 20px 0;">Wishing you all the best!</p>
              <p style="margin: 0;"><strong>- The StackBill Team</strong><br>
              <a href="mailto:hello@stackbill.dev" style="color: #2563eb; text-decoration: none;">hello@stackbill.dev</a></p>
            </div>
          </div>
        </body>
      </html>
    `
  })
}

// Utility function to send confirmation email
export async function sendConfirmationEmail(userEmail: string, confirmationUrl: string) {
  try {
    const emailData = EmailTemplates.confirmationEmail(confirmationUrl, userEmail)
    const result = await resend.emails.send(emailData)
    
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to send confirmation email:', error)
    return { success: false, error }
  }
}

// Utility function to send renewal alert email
export async function sendRenewalAlertEmail(
  userEmail: string, 
  upcomingRenewals: (Subscription & { daysUntilRenewal: number })[],
  userName?: string
) {
  try {
    const emailData = EmailTemplates.renewalAlertEmail(userEmail, upcomingRenewals, userName)
    const result = await resend.emails.send(emailData)
    
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to send renewal alert email:', error)
    return { success: false, error }
  }
}

// Utility function to send monthly summary email
export async function sendMonthlySummaryEmail(
  userEmail: string,
  summaryData: {
    monthlyTotal: number;
    yearlyTotal: number;
    currency: Currency;
    subscriptionCount: number;
    categoryBreakdown: Record<string, number>;
    topSubscriptions: { name: string; monthlyAmount: number; currency: string }[];
    month: string;
    year: number;
  }
) {
  try {
    const emailData = EmailTemplates.monthlySummaryEmail(userEmail, summaryData)
    const result = await resend.emails.send(emailData)
    
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to send monthly summary email:', error)
    return { success: false, error }
  }
}

// Utility function to send cancellation confirmation email
export async function sendCancellationEmail(userEmail: string) {
  try {
    const emailData = EmailTemplates.cancellationEmail(userEmail)
    const result = await resend.emails.send(emailData)
    
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to send cancellation email:', error)
    return { success: false, error }
  }
}

// Utility function to send goodbye email
export async function sendGoodbyeEmail(userEmail: string) {
  try {
    const emailData = EmailTemplates.goodbyeEmail(userEmail)
    const result = await resend.emails.send(emailData)
    
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to send goodbye email:', error)
    return { success: false, error }
  }
}