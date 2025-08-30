import { NextResponse } from 'next/server'
import { resend } from '@/lib/resend'

export async function GET() {
  try {
    console.log('Testing Resend integration...')
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
    console.log('RESEND_API_KEY starts with re_:', process.env.RESEND_API_KEY?.startsWith('re_'))
    
    const result = await resend.emails.send({
      from: 'StackBill <hello@stackbill.dev>',
      to: 'hello@stackbill.dev', // Use your registered email
      subject: 'Test Email',
      html: '<h1>Test Email</h1>'
    })
    
    console.log('Resend result:', result)
    
    return NextResponse.json({
      success: true,
      data: result
    })
    
  } catch (error) {
    console.error('Resend test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}