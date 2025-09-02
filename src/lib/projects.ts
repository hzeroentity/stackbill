import { supabase } from './supabase'
import { Project, ProjectInsert, ProjectUpdate } from './database.types'

export class ProjectsService {
  // Get all projects for a user (excluding the General project which is handled separately)
  static async getProjects(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .neq('name', 'General') // Exclude General project from regular project list
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching projects:', error)
      throw new Error('Failed to fetch projects')
    }

    return data || []
  }

  // Get a single project by ID
  static async getProject(projectId: string, userId: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching project:', error)
      return null
    }

    return data
  }

  // Create a new project
  static async createProject(project: Omit<ProjectInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      throw new Error('Failed to create project')
    }

    return data
  }

  // Update a project
  static async updateProject(projectId: string, userId: string, updates: ProjectUpdate): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      throw new Error('Failed to update project')
    }

    return data
  }

  // Delete a project (hard delete with CASCADE handling)
  static async deleteProject(projectId: string, userId: string): Promise<void> {
    // Hard delete the project - CASCADE will automatically handle
    // the subscription_projects relationships
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting project:', error)
      throw new Error('Failed to delete project')
    }

    // Delete any orphaned subscriptions (subscriptions with no project relationships left)
    try {
      // First, get all subscription IDs that still have project relationships
      const { data: linkedSubs, error: linkedError } = await supabase
        .from('subscription_projects')
        .select('subscription_id')

      if (linkedError) {
        console.error('Error getting linked subscriptions:', linkedError)
        return // Don't fail project deletion for this
      }

      const linkedSubIds = linkedSubs?.map(sp => sp.subscription_id) || []

      // Then get all user's subscriptions that are NOT in the linked list
      const { data: allUserSubs, error: allSubsError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)

      if (allSubsError) {
        console.error('Error getting user subscriptions:', allSubsError)
        return // Don't fail project deletion for this
      }

      const orphanedSubIds = allUserSubs?.filter(sub => !linkedSubIds.includes(sub.id)).map(sub => sub.id) || []

      // Delete orphaned subscriptions if any exist
      if (orphanedSubIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('subscriptions')
          .delete()
          .in('id', orphanedSubIds)

        if (deleteError) {
          console.error('Error deleting orphaned subscriptions:', deleteError)
          // Don't throw error to avoid blocking project deletion
        }
      }
    } catch (error) {
      console.error('Error in orphaned subscription cleanup:', error)
      // Don't throw error to avoid blocking project deletion
    }
  }

  // Get subscription count per project using the new many-to-many relationship
  static async getProjectSubscriptionCounts(userId: string): Promise<Record<string, number>> {
    // Get all active subscriptions for the user with their project relationships
    const { data, error } = await supabase
      .from('subscriptions')
      .select(`
        id,
        subscription_projects (
          project_id
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching subscription counts:', error)
      return {}
    }

    const counts: Record<string, number> = {}
    
    data.forEach(subscription => {
      if (subscription.subscription_projects && subscription.subscription_projects.length > 0) {
        // Subscription has project assignments
        subscription.subscription_projects.forEach((sp: { project_id: string }) => {
          counts[sp.project_id] = (counts[sp.project_id] || 0) + 1
        })
      }
      // Note: Subscriptions without projects won't be counted for any specific project
    })

    // Add General project virtual count by finding the actual General project
    // We need to get the user's General project ID and map it to GENERAL_PROJECT_ID for UI purposes
    const generalProject = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId)
      .eq('name', 'General')
      .single()
    
    if (generalProject.data && !generalProject.error) {
      // Move the count from the real General project ID to the virtual GENERAL_PROJECT_ID
      counts[GENERAL_PROJECT_ID] = counts[generalProject.data.id] || 0
      // Remove the count from the real project ID to avoid duplication in project switcher
      delete counts[generalProject.data.id]
    } else {
      counts[GENERAL_PROJECT_ID] = 0
    }

    return counts
  }

  // Ensure General project exists for a user
  static async ensureGeneralProject(userId: string): Promise<string> {
    // Check if user already has a General project
    const { data: existingGeneral, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId)
      .eq('name', 'General')
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking for General project:', fetchError)
      throw new Error('Failed to check for General project')
    }

    if (existingGeneral) {
      return existingGeneral.id
    }

    // Create General project for this user
    const { data: newGeneral, error: createError } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        name: 'General',
        description: 'General project for subscriptions that apply to all projects',
        color: '#6B7280' // Gray color
      })
      .select('id')
      .single()

    if (createError) {
      console.error('Error creating General project:', createError)
      throw new Error('Failed to create General project')
    }

    return newGeneral.id
  }

  // Assign a subscription to multiple projects
  static async assignSubscriptionToProjects(subscriptionId: string, projectIds: string[], userId?: string): Promise<void> {
    // First, remove all existing assignments for this subscription
    const { error: deleteError } = await supabase
      .from('subscription_projects')
      .delete()
      .eq('subscription_id', subscriptionId)

    if (deleteError) {
      console.error('Error removing existing project assignments:', deleteError)
      throw new Error('Failed to update project assignments')
    }

    // Then add new assignments
    if (projectIds.length > 0) {
      // Handle General project - convert GENERAL_PROJECT_ID to actual project ID
      const resolvedProjectIds = []
      for (const projectId of projectIds) {
        if (projectId === GENERAL_PROJECT_ID) {
          if (!userId) {
            throw new Error('User ID is required when assigning to General project')
          }
          const generalProjectId = await this.ensureGeneralProject(userId)
          resolvedProjectIds.push(generalProjectId)
        } else {
          resolvedProjectIds.push(projectId)
        }
      }

      const assignments = resolvedProjectIds.map(projectId => ({
        subscription_id: subscriptionId,
        project_id: projectId
      }))

      const { error: insertError } = await supabase
        .from('subscription_projects')
        .insert(assignments)

      if (insertError) {
        console.error('Error creating project assignments:', insertError)
        throw new Error('Failed to assign subscription to projects')
      }
    }
  }

  // Get projects assigned to a subscription
  static async getSubscriptionProjects(subscriptionId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('subscription_projects')
      .select(`
        projects (*)
      `)
      .eq('subscription_id', subscriptionId)

    if (error) {
      console.error('Error fetching subscription projects:', error)
      return []
    }

    // Extract projects from subscription_projects relationship - using any to avoid complex Supabase types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((sp: any) => sp.projects).filter((project: Project | null): project is Project => project !== null)
  }

  // Default colors for new projects
  static getDefaultColors(): string[] {
    return [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#06B6D4', // Cyan
      '#F97316', // Orange
      '#84CC16', // Lime
      '#EC4899', // Pink
      '#6B7280', // Gray
    ]
  }

  // Get next default color based on existing projects
  static getNextDefaultColor(existingProjects: Project[]): string {
    const defaultColors = this.getDefaultColors()
    const usedColors = existingProjects.map(p => p.color)
    
    // Find first unused color, or cycle back to the first one
    const unusedColor = defaultColors.find(color => !usedColors.includes(color))
    return unusedColor || defaultColors[existingProjects.length % defaultColors.length]
  }
}

// Special project types
export const ALL_PROJECTS_ID = 'all'
export const GENERAL_PROJECT_ID = 'general'

// Helper function to check if a project ID represents a special filter
export function isSpecialProjectId(projectId: string | null): boolean {
  return projectId === ALL_PROJECTS_ID || projectId === GENERAL_PROJECT_ID
}

// Helper function to get display name for project
export function getProjectDisplayName(project: Project | null, projectId?: string): string {
  if (projectId === ALL_PROJECTS_ID) return 'All Projects'
  if (projectId === GENERAL_PROJECT_ID) return 'General'
  return project?.name || 'Unknown Project'
}