import { Resend } from 'resend'

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