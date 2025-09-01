import { NextRequest, NextResponse } from 'next/server'
import { adminService } from '@/lib/admin-service'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ 
        isAdmin: false, 
        error: 'User ID required' 
      }, { status: 400 })
    }

    // Verify admin status using secure admin service
    const admin = await adminService.verifyAdmin(userId)
    
    if (admin) {
      // Log the verification attempt
      const clientIP = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
      const userAgent = request.headers.get('user-agent') || 'unknown'
      
      await adminService.logSecurityEvent(userId, 'admin_verification', {
        ip_address: clientIP,
        user_agent: userAgent,
        metadata: { verification_result: 'success' }
      })

      return NextResponse.json({ 
        isAdmin: true,
        totp_enabled: admin.totp_enabled,
        email: admin.email
      })
    } else {
      return NextResponse.json({ 
        isAdmin: false, 
        error: 'Access denied - Admin privileges required' 
      }, { status: 403 })
    }

  } catch (error) {
    console.error('Admin verification API error:', error)
    return NextResponse.json({ 
      isAdmin: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}