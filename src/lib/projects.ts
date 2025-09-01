import { supabase } from './supabase'
import { Project, ProjectInsert, ProjectUpdate } from './database.types'

export class ProjectsService {
  // Get all projects for a user
  static async getProjects(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
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
      .eq('is_active', true)
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

  // Delete a project (soft delete by setting is_active to false)
  static async deleteProject(projectId: string, userId: string): Promise<void> {
    // First, set all subscriptions in this project to have no project (project_id = null)
    await supabase
      .from('subscriptions')
      .update({ project_id: null })
      .eq('project_id', projectId)
      .eq('user_id', userId)

    // Then soft delete the project
    const { error } = await supabase
      .from('projects')
      .update({ is_active: false })
      .eq('id', projectId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error deleting project:', error)
      throw new Error('Failed to delete project')
    }
  }

  // Get subscription count per project
  static async getProjectSubscriptionCounts(userId: string): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('project_id')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching subscription counts:', error)
      return {}
    }

    const counts: Record<string, number> = {}
    
    // Count general subscriptions (project_id is null)
    const generalCount = data.filter(sub => sub.project_id === null).length
    if (generalCount > 0) {
      counts['general'] = generalCount
    }

    // Count subscriptions per project
    data.forEach(sub => {
      if (sub.project_id) {
        counts[sub.project_id] = (counts[sub.project_id] || 0) + 1
      }
    })

    return counts
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
export const GENERAL_PROJECT_ID = 'general'
export const ALL_PROJECTS_ID = 'all'

// Helper function to check if a project ID represents a special filter
export function isSpecialProjectId(projectId: string | null): boolean {
  return projectId === GENERAL_PROJECT_ID || projectId === ALL_PROJECTS_ID
}

// Helper function to get display name for project
export function getProjectDisplayName(project: Project | null, projectId?: string): string {
  if (projectId === ALL_PROJECTS_ID) return 'All Projects'
  if (projectId === GENERAL_PROJECT_ID || project === null) return 'General'
  return project.name
}