import { supabaseAdmin } from './supabase-admin'
import { randomBytes } from 'crypto'
import * as speakeasy from 'speakeasy'
import * as QRCode from 'qrcode'

// Type for Supabase table operations when TypeScript inference fails
type SupabaseTableOp = any

export interface AdminUser {
  id: string
  user_id: string
  is_active: boolean
  totp_enabled: boolean
  last_login_at: string | null
  session_expires_at: string | null
  failed_attempts: number
  locked_until: string | null
  created_at: string
  email?: string
}

export interface SecurityLog {
  id: string
  user_id: string
  action: string
  details: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  success: boolean
  created_at: string
}

export class AdminService {
  
  // Verify if user is an active admin
  async verifyAdmin(userId: string): Promise<AdminUser | null> {
    try {
      const { data: adminUser, error } = await supabaseAdmin
        .from('admin_user')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (error || !adminUser) {
        return null
      }

      const typedAdminUser = adminUser as AdminUser

      // Check if account is locked
      if (typedAdminUser.locked_until && new Date(typedAdminUser.locked_until) > new Date()) {
        return null
      }

      // Check session expiry
      if (typedAdminUser.session_expires_at && new Date(typedAdminUser.session_expires_at) < new Date()) {
        return null
      }

      // Get user email
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId)
      
      return {
        ...typedAdminUser,
        email: userData?.user?.email
      }
    } catch (error) {
      console.error('Admin verification error:', error)
      return null
    }
  }

  // Log security events
  async logSecurityEvent(
    userId: string,
    action: string,
    details: {
      ip_address?: string
      user_agent?: string
      success?: boolean
      metadata?: Record<string, unknown>
    } = {}
  ): Promise<void> {
    try {
      const logEntry = {
        user_id: userId,
        action,
        details: details.metadata || {},
        ip_address: details.ip_address,
        user_agent: details.user_agent,
        success: details.success ?? true
      }
      
      await (supabaseAdmin.from('admin_security_log') as SupabaseTableOp).insert(logEntry)
    } catch (error) {
      console.error('Failed to log security event:', error)
    }
  }

  // Update admin session (extend session, update last login)
  async updateAdminSession(userId: string, ipAddress?: string): Promise<boolean> {
    try {
      const { error } = await (supabaseAdmin
        .from('admin_user') as SupabaseTableOp)
        .update({
          last_login_at: new Date().toISOString(),
          session_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          failed_attempts: 0 // Reset failed attempts on successful login
        })
        .eq('user_id', userId)

      if (!error) {
        await this.logSecurityEvent(userId, 'session_extended', {
          ip_address: ipAddress,
          metadata: { extended_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }
        })
      }

      return !error
    } catch (error) {
      console.error('Failed to update admin session:', error)
      return false
    }
  }

  // 2FA Setup: Generate TOTP secret and QR code
  async setup2FA(userId: string): Promise<{ secret: string; qrCode: string; backupCodes: string[] } | null> {
    try {
      const admin = await this.verifyAdmin(userId)
      if (!admin) return null

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `StackBill Admin (${admin.email})`,
        issuer: 'StackBill'
      })

      // Generate backup codes
      const backupCodes = Array.from({ length: 8 }, () => 
        randomBytes(4).toString('hex').toUpperCase()
      )

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url!)

      // Save secret to database (but don't enable 2FA yet)
      await (supabaseAdmin
        .from('admin_user') as SupabaseTableOp)
        .update({
          totp_secret: secret.base32,
          backup_codes: JSON.stringify(backupCodes)
        })
        .eq('user_id', userId)

      await this.logSecurityEvent(userId, '2fa_setup_initiated', {
        metadata: { secret_generated: true, backup_codes_count: backupCodes.length }
      })

      return {
        secret: secret.base32!,
        qrCode,
        backupCodes
      }
    } catch (error) {
      console.error('Failed to setup 2FA:', error)
      return null
    }
  }

  // 2FA Enable: Verify TOTP and enable 2FA
  async enable2FA(userId: string, token: string): Promise<boolean> {
    try {
      const { data: admin, error } = await supabaseAdmin
        .from('admin_user')
        .select('totp_secret')
        .eq('user_id', userId)
        .single()

      if (error || !admin?.totp_secret) {
        return false
      }

      // Clean the token (remove spaces, ensure it's 6 digits)
      const cleanToken = token.replace(/\s+/g, '').trim()

      // Verify the token with a reasonable time window
      const isValid = speakeasy.totp.verify({
        secret: admin.totp_secret,
        token: cleanToken,
        window: 2, // Allow 2 time steps of drift (±60 seconds)
        encoding: 'base32'
      })

      if (isValid) {
        // Enable 2FA
        await (supabaseAdmin
          .from('admin_user') as SupabaseTableOp)
          .update({
            totp_enabled: true,
            last_2fa_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        await this.logSecurityEvent(userId, '2fa_enabled', {
          metadata: { enabled_at: new Date().toISOString() }
        })

        return true
      }

      await this.logSecurityEvent(userId, '2fa_enable_failed', {
        success: false,
        metadata: { provided_token_length: cleanToken.length }
      })

      return false
    } catch (error) {
      console.error('Failed to enable 2FA:', error)
      return false
    }
  }

  // 2FA Verify: Verify TOTP token during login
  async verify2FA(userId: string, token: string): Promise<boolean> {
    try {
      const { data: admin, error } = await supabaseAdmin
        .from('admin_user')
        .select('totp_secret, totp_enabled, backup_codes')
        .eq('user_id', userId)
        .single()

      if (error || !admin?.totp_enabled || !admin?.totp_secret) {
        return false
      }

      // Check if it's a backup code
      const backupCodes = admin.backup_codes ? JSON.parse(admin.backup_codes) : []
      const isBackupCode = backupCodes.includes(token.toUpperCase())

      if (isBackupCode) {
        // Remove used backup code
        const remainingCodes = backupCodes.filter((code: string) => code !== token.toUpperCase())
        
        await (supabaseAdmin
          .from('admin_user') as SupabaseTableOp)
          .update({
            backup_codes: JSON.stringify(remainingCodes),
            last_2fa_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        await this.logSecurityEvent(userId, '2fa_backup_code_used', {
          metadata: { remaining_codes: remainingCodes.length }
        })

        return true
      }

      // Verify TOTP token
      const isValid = speakeasy.totp.verify({
        secret: admin.totp_secret,
        token,
        window: 2
      })

      if (isValid) {
        await (supabaseAdmin
          .from('admin_user') as SupabaseTableOp)
          .update({
            last_2fa_at: new Date().toISOString()
          })
          .eq('user_id', userId)

        await this.logSecurityEvent(userId, '2fa_verified', {
          metadata: { method: 'totp' }
        })

        return true
      }

      // Log failed 2FA attempt
      await this.logSecurityEvent(userId, '2fa_verification_failed', {
        success: false,
        metadata: { method: 'totp' }
      })

      return false
    } catch (error) {
      console.error('Failed to verify 2FA:', error)
      return false
    }
  }

  // Disable 2FA (emergency)
  async disable2FA(userId: string): Promise<boolean> {
    try {
      await (supabaseAdmin
        .from('admin_user') as SupabaseTableOp)
        .update({
          totp_enabled: false,
          totp_secret: null,
          backup_codes: '[]'
        })
        .eq('user_id', userId)

      await this.logSecurityEvent(userId, '2fa_disabled', {
        metadata: { disabled_at: new Date().toISOString() }
      })

      return true
    } catch (error) {
      console.error('Failed to disable 2FA:', error)
      return false
    }
  }

  // Record failed login attempt
  async recordFailedLogin(userId: string, ipAddress?: string): Promise<void> {
    try {
      // Increment failed attempts
      const { data: admin } = await supabaseAdmin
        .from('admin_user')
        .select('failed_attempts')
        .eq('user_id', userId)
        .single()

      const failedAttempts = (admin?.failed_attempts || 0) + 1
      const shouldLock = failedAttempts >= 5
      
      const updateData: Record<string, unknown> = {
        failed_attempts: failedAttempts
      }

      // Lock account for 30 minutes after 5 failed attempts
      if (shouldLock) {
        updateData.locked_until = new Date(Date.now() + 30 * 60 * 1000).toISOString()
      }

      await (supabaseAdmin
        .from('admin_user') as SupabaseTableOp)
        .update(updateData)
        .eq('user_id', userId)

      await this.logSecurityEvent(userId, 'failed_login', {
        success: false,
        ip_address: ipAddress,
        metadata: { 
          failed_attempts: failedAttempts,
          account_locked: shouldLock 
        }
      })
    } catch (error) {
      console.error('Failed to record failed login:', error)
    }
  }

  // Get security logs
  async getSecurityLogs(userId: string, limit: number = 100): Promise<SecurityLog[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('admin_security_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to get security logs:', error)
      return []
    }
  }
}

export const adminService = new AdminService()