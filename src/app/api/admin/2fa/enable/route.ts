import { NextRequest, NextResponse } from 'next/server'
import { adminService } from '@/lib/admin-service'

export async function POST(request: NextRequest) {
  try {
    const { userId, token } = await request.json()

    if (!userId || !token) {
      return NextResponse.json({ 
        error: 'User ID and token are required' 
      }, { status: 400 })
    }

    // Enable 2FA by verifying the token
    const success = await adminService.enable2FA(userId, token)
    
    if (success) {
      return NextResponse.json({ 
        success: true,
        message: '2FA has been enabled successfully! Your account is now more secure.'
      })
    } else {
      return NextResponse.json({ 
        error: 'Invalid token. Please check your authenticator app and try again.' 
      }, { status: 400 })
    }

  } catch (error) {
    console.error('2FA enable API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}