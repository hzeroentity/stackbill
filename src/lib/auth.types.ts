// User with profile data for email operations
export interface UserProfile {
  user_id: string
  email: string | null
  raw_user_meta_data: {
    name?: string
    full_name?: string
    [key: string]: unknown
  } | null
}

// User subscription with nested profiles for email queries
export interface UserSubscriptionWithProfile {
  user_id: string
  plan_type: string
  status: string
  profiles: UserProfile | null
}

// User data from admin getUserById response
export interface AdminUserResponse {
  user: {
    id: string
    email: string | null
    user_metadata: {
      name?: string
      full_name?: string
      [key: string]: unknown
    } | null
    raw_user_meta_data?: {
      name?: string
      full_name?: string
      [key: string]: unknown
    } | null
    created_at: string
    last_sign_in_at: string | null
  } | null
}

// Helper function to safely extract user name from auth user data
export function extractUserName(user: UserProfile | AdminUserResponse['user']): string {
  if (!user) return 'Unknown'
  
  // Handle AdminUserResponse format
  if ('user_metadata' in user) {
    return user.user_metadata?.name || 
           user.user_metadata?.full_name ||
           user.email?.split('@')[0] || 
           'Unknown'
  }
  
  // Handle UserProfile format  
  return user.raw_user_meta_data?.name ||
         user.raw_user_meta_data?.full_name ||
         user.email?.split('@')[0] ||
         'Unknown'
}

// Helper function to safely extract email
export function extractUserEmail(user: UserProfile | AdminUserResponse['user']): string {
  return user?.email || 'unknown@email.com'
}