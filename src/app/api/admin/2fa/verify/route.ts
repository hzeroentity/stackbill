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

    // Verify 2FA token
    const success = await adminService.verify2FA(userId, token)
    
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'

    if (success) {
      // Update session on successful 2FA
      await adminService.updateAdminSession(userId, clientIP)
      
      return NextResponse.json({ 
        success: true,
        message: '2FA verification successful'
      })
    } else {
      // Record failed attempt
      await adminService.recordFailedLogin(userId, clientIP)
      
      return NextResponse.json({ 
        error: 'Invalid 2FA token or backup code' 
      }, { status: 400 })
    }

  } catch (error) {
    console.error('2FA verify API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}