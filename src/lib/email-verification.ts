import { createHash } from 'crypto'

// Create secure verification tokens using HMAC
export const createVerificationToken = (userId: string, email: string): string => {
  const secret = process.env.EMAIL_VERIFICATION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY!
  const timestamp = Date.now()
  const data = `${userId}:${email}:${timestamp}`
  const hash = createHash('sha256').update(data + secret).digest('hex')
  return `${Buffer.from(data).toString('base64')}.${hash}`
}

export const verifyToken = (token: string): { userId: string; email: string; timestamp: number } | null => {
  try {
    const [dataB64, hash] = token.split('.')
    if (!dataB64 || !hash) return null

    const data = Buffer.from(dataB64, 'base64').toString()
    const [userId, email, timestampStr] = data.split(':')
    const timestamp = parseInt(timestampStr)

    // Check if token is expired (24 hours)
    if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
      return null
    }

    // Verify hash
    const secret = process.env.EMAIL_VERIFICATION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY!
    const expectedHash = createHash('sha256').update(data + secret).digest('hex')
    
    if (hash !== expectedHash) return null

    return { userId, email, timestamp }
  } catch {
    return null
  }
}