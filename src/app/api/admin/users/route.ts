import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { adminService } from '@/lib/admin-service'
import type { Database } from '@/lib/database.types'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userIdFromQuery = url.searchParams.get('userId')
    
    let userId: string | null = null
    
    if (userIdFromQuery) {
      // Verify the user exists and get their ID
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userIdFromQuery)
      if (userError || !userData.user) {
        console.error('Admin API - Failed to get user by ID:', userError)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      userId = userData.user.id
    } else {
      // Fallback to SSR auth method
      const cookieStore = await cookies()
      const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            },
          },
        }
      )
      
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !authUser) {
        console.error('Admin API - Auth failed:', authError)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      userId = authUser.id
    }

    if (!userId) {
      console.error('Admin API - No user ID found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin access using secure admin service
    const admin = await adminService.verifyAdmin(userId)
    if (!admin) {
      console.error('Admin API - Access denied for user:', userId)
      return NextResponse.json({ 
        error: 'Access denied - Admin privileges required'
      }, { status: 403 })
    }

    // Update admin session and log the access
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    await adminService.updateAdminSession(userId, clientIP)
    await adminService.logSecurityEvent(userId, 'view_admin_dashboard', {
      ip_address: clientIP,
      user_agent: userAgent,
      metadata: { action: 'dashboard_access' }
    })

    // Fetch all users with their auth data using admin client
    const { data: authUsers, error: authError2 } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError2) {
      throw new Error('Failed to fetch auth users: ' + authError2.message)
    }

    // Get all user subscriptions (plan data)
    const { data: userSubscriptions, error: userSubError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')

    if (userSubError) {
      console.error('Error fetching user subscriptions:', userSubError)
    }

    // Get all subscriptions
    const { data: allSubscriptions, error: subsError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError)
    }

    // Get all subscription-project relationships
    const { data: subscriptionProjects, error: spError } = await supabaseAdmin
      .from('subscription_projects')
      .select(`
        subscription_id,
        project_id,
        projects(name, color)
      `)

    if (spError) {
      console.error('Error fetching subscription-project relationships:', spError)
    }

    // Get all projects
    const { data: allProjects, error: projectsError } = await supabaseAdmin
      .from('projects')
      .select('*')

    if (projectsError) {
      console.error('Error fetching projects:', projectsError)
    }

    // Build comprehensive user data
    const users = authUsers.users.map(authUser => {
      const userSub = userSubscriptions?.find((us: any) => us.user_id === authUser.id) ?? null
      const userSubscriptionsList = allSubscriptions?.filter((s: any) => s.user_id === authUser.id) ?? []
      const userProjects = allProjects?.filter((p: any) => p.user_id === authUser.id) ?? []

      // Calculate monthly spending by converting all subscriptions to monthly amounts
      const monthlySpending = userSubscriptionsList
        .filter(sub => sub.is_active)
        .reduce((total, sub) => {
          let monthlyAmount = sub.amount
          
          switch (sub.billing_period?.toLowerCase()) {
            case 'yearly':
            case 'annual':
              monthlyAmount = sub.amount / 12
              break
            case 'weekly':
              monthlyAmount = sub.amount * 4.33 // approximate weeks per month
              break
            case 'daily':
              monthlyAmount = sub.amount * 30
              break
            // 'monthly' and default case keep the amount as is
          }
          
          return total + monthlyAmount
        }, 0)

      // Get project subscription counts
      const projectsWithCounts = userProjects.map(project => ({
        ...project,
        subscription_count: userSubscriptionsList.filter(sub => 
          subscriptionProjects?.some(sp => sp.project_id === project.id && sp.subscription_id === sub.id)
        ).length
      }))

      // Format subscriptions with project info
      const subscriptionsWithProjects = userSubscriptionsList.map(sub => ({
        ...sub,
        projects: subscriptionProjects
          ?.filter(sp => sp.subscription_id === sub.id)
          .map(sp => ({
            name: sp.projects?.name || 'Unknown',
            color: sp.projects?.color || '#3B82F6'
          })) || []
      }))

      return {
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at,
        plan_type: userSub?.plan_type || 'free',
        total_subscriptions: userSubscriptionsList.length,
        active_subscriptions: userSubscriptionsList.filter(s => s.is_active).length,
        total_projects: userProjects.length,
        monthly_spending: monthlySpending,
        stripe_customer_id: userSub?.stripe_customer_id,
        subscriptions: subscriptionsWithProjects,
        projects: projectsWithCounts
      }
    })

    // Sort users by creation date (newest first)
    users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({ users })

  } catch (error) {
    console.error('Admin API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}