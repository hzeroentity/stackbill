import { Resend } from 'resend'
import { Subscription } from './database.types'
import { Currency } from './currency-preferences'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is not set')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

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
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #2563eb; 
              color: white; 
              text-decoration: none; 
              border-radius: 6px; 
              font-weight: 500;
              margin: 20px 0;
            }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
            .text-center { text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">📊 StackBill</div>
            </div>
            
            <h1>Welcome to StackBill!</h1>
            
            <p>Thanks for signing up for StackBill, the simple way to track your SaaS subscription costs.</p>
            
            <p>To get started, please confirm your email address by clicking the button below:</p>
            
            <div class="text-center">
              <a href="${confirmationUrl}" class="button">Confirm Email Address</a>
            </div>
            
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p><a href="${confirmationUrl}">${confirmationUrl}</a></p>
            
            <p>Once confirmed, you'll be able to:</p>
            <ul>
              <li>Track up to 3 subscriptions for free</li>
              <li>Get renewal reminders (Pro feature)</li>
              <li>View spending insights and analytics</li>
              <li>Export your data in multiple formats</li>
            </ul>
            
            <div class="footer">
              <p>This confirmation link will expire in 24 hours.</p>
              <p>If you didn't create a StackBill account, you can safely ignore this email.</p>
              <p>Questions? Reply to this email and we'll help you out.</p>
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
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f9fafb;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: bold;">StackBill</h1>
                      <p style="margin: 12px 0 0 0; color: #ffffff; font-size: 20px; opacity: 0.95;">SaaS Subscription Tracker</p>
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
                                    <p style="margin: 4px 0; color: #1f2937; font-size: 16px; font-weight: 600;"><strong>Amount:</strong> ${sub.currency} ${sub.amount.toFixed(2)} (${sub.billing_period})</p>
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
  Amount: ${sub.currency} ${sub.amount.toFixed(2)} (${sub.billing_period})
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
    },
    userName?: string
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
                    <td style="background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%); border-radius: 12px 12px 0 0; padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: bold;">StackBill</h1>
                      <p style="margin: 12px 0 0 0; color: #ffffff; font-size: 20px; opacity: 0.95;">SaaS Subscription Tracker</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 30px;">
                      <h2 style="margin: 0 0 30px 0; color: #1f2937; font-size: 28px; font-weight: 600; text-align: center;">Your ${summaryData.month} ${summaryData.year} Summary${userName ? `, ${userName}` : ''}</h2>
                      
                      <!-- Summary Metrics -->
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 24px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                              <tr>
                                <td align="center" style="padding: 16px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; width: 50%;">
                                  <div style="font-size: 32px; font-weight: bold; color: #2563eb; margin-bottom: 4px;">${summaryData.currency} ${summaryData.monthlyTotal.toFixed(2)}</div>
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
                                  <div style="font-size: 24px; font-weight: 600; color: #1f2937;">${summaryData.currency} ${summaryData.yearlyTotal.toFixed(2)}</div>
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
                                    <td align="right" style="color: #2563eb; font-weight: 600; font-size: 16px;">${summaryData.currency} ${amount.toFixed(2)}</td>
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
                                    <td align="right" style="color: #6b7280; font-weight: 500; font-size: 16px;">${sub.currency} ${sub.monthlyAmount.toFixed(2)}/month</td>
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
      
      Your ${summaryData.month} ${summaryData.year} Summary${userName ? `, ${userName}` : ''}
      
      MONTHLY SPENDING: ${summaryData.currency} ${summaryData.monthlyTotal.toFixed(2)}
      ACTIVE SUBSCRIPTIONS: ${summaryData.subscriptionCount}
      ANNUAL PROJECTION: ${summaryData.currency} ${summaryData.yearlyTotal.toFixed(2)}
      
      SPENDING BY CATEGORY:
      ${Object.entries(summaryData.categoryBreakdown)
        .sort(([,a], [,b]) => b - a)
        .map(([category, amount]) => `• ${category}: ${summaryData.currency} ${amount.toFixed(2)}`).join('\n')}
      
      ${summaryData.topSubscriptions.length > 0 ? `
      TOP SUBSCRIPTIONS:
      ${summaryData.topSubscriptions.slice(0, 5).map(sub => `• ${sub.name}: ${sub.currency} ${sub.monthlyAmount.toFixed(2)}/month`).join('\n')}
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
  })
}

// Utility function to send confirmation email
export async function sendConfirmationEmail(userEmail: string, confirmationUrl: string) {
  try {
    const emailData = EmailTemplates.confirmationEmail(confirmationUrl, userEmail)
    const result = await resend.emails.send(emailData)
    
    console.log('Confirmation email sent successfully:', result)
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
    
    console.log('Renewal alert email sent successfully:', result)
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
  },
  userName?: string
) {
  try {
    const emailData = EmailTemplates.monthlySummaryEmail(userEmail, summaryData, userName)
    const result = await resend.emails.send(emailData)
    
    console.log('Monthly summary email sent successfully:', result)
    return { success: true, data: result }
  } catch (error) {
    console.error('Failed to send monthly summary email:', error)
    return { success: false, error }
  }
}