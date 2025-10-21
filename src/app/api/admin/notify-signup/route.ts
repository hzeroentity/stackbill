import { NextResponse } from 'next/server'
import { sendAdminNewUserNotification } from '@/lib/resend'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, userId, signupMethod, timestamp, ipAddress, userAgent } = body

    // Validate required fields
    if (!email || !userId || !signupMethod) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate signup method
    if (signupMethod !== 'email_verification' && signupMethod !== 'github_oauth') {
      return NextResponse.json(
        { success: false, error: 'Invalid signup method' },
        { status: 400 }
      )
    }

    // Send admin notification (non-blocking)
    await sendAdminNewUserNotification({
      email,
      signupMethod,
      userId,
      timestamp: timestamp || new Date().toISOString(),
      ipAddress,
      userAgent
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin signup notification error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
