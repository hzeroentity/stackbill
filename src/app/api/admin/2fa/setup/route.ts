import { NextRequest, NextResponse } from 'next/server'
import { adminService } from '@/lib/admin-service'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID required' 
      }, { status: 400 })
    }

    // Setup 2FA for admin user
    const result = await adminService.setup2FA(userId)
    
    if (result) {
      return NextResponse.json({ 
        success: true,
        qrCode: result.qrCode,
        backupCodes: result.backupCodes,
        message: 'Scan the QR code with Google Authenticator and save your backup codes'
      })
    } else {
      return NextResponse.json({ 
        error: 'Failed to setup 2FA. Admin access required.' 
      }, { status: 403 })
    }

  } catch (error) {
    console.error('2FA setup API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}