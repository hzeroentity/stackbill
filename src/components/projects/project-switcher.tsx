'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus, Lock, Settings } from "lucide-react"
import { Tables, PlanType } from '@/lib/database.types'
import { ProjectsService, ALL_PROJECTS_ID, GENERAL_PROJECT_ID } from '@/lib/projects'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { ProjectCreateDialog } from './project-create-dialog'
import { canAddProject } from '@/lib/plans'

interface ProjectSwitcherProps {
  selectedProject: string
  onProjectChange: (projectId: string) => void
  isPro: boolean
  subscriptionCounts: Record<string, number>
  totalActiveSubscriptions: number
  userPlan?: PlanType
}

export function ProjectSwitcher({ selectedProject, onProjectChange, isPro, subscriptionCounts, totalActiveSubscriptions, userPlan = 'free' }: ProjectSwitcherProps) {
  const [projects, setProjects] = useState<Tables<'projects'>[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user?.id) return

    const fetchProjects = async () => {
      try {
        const userProjects = await ProjectsService.getProjects(user.id)
        setProjects(userProjects)
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [user?.id])

  const handleUpgradeClick = () => {
    router.push('/dashboard/billing')
  }

  const handleProjectCreated = (projectId: string) => {
    // Refresh the projects list
    if (user?.id) {
      ProjectsService.getProjects(user.id)
        .then(userProjects => {
          setProjects(userProjects)
          // Automatically switch to the newly created project
          onProjectChange(projectId)
        })
        .catch(error => console.error('Error refreshing projects:', error))
    }
  }

  const getProjectCount = (projectId: string): number => {
    if (projectId === ALL_PROJECTS_ID) {
      // Show total number of unique active subscriptions
      return totalActiveSubscriptions
    }
    if (projectId === GENERAL_PROJECT_ID) {
      // For now, return 0 as we need to calculate General subscriptions from the parent
      return subscriptionCounts[projectId] || 0
    }
    return subscriptionCounts[projectId] || 0
  }

  const canCreateMoreProjects = canAddProject(projects.length, userPlan)
  const showCreateButton = isPro || canCreateMoreProjects

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedProject}
        onValueChange={onProjectChange}
        disabled={loading}
      >
        <SelectTrigger className="min-w-fit max-w-48">
          <SelectValue placeholder="Select project..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_PROJECTS_ID}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                All Projects
              </div>
              <span className="text-xs text-muted-foreground ml-2">
                {getProjectCount(ALL_PROJECTS_ID)} subs
              </span>
            </div>
          </SelectItem>
          <SelectItem value={GENERAL_PROJECT_ID}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                General
              </div>
              <span className="text-xs text-muted-foreground ml-2">
                {getProjectCount(GENERAL_PROJECT_ID)} subs
              </span>
            </div>
          </SelectItem>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: project.color || '#3B82F6' }}
                  />
                  {project.name}
                </div>
                <span className="text-xs text-muted-foreground ml-2">
                  {getProjectCount(project.id)} subs
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {showCreateButton ? (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateDialogOpen(true)}
            className="h-8 px-2"
          >
            <Plus className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Project</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard/settings#projects')}
            className="h-8 px-2"
          >
            <Settings className="w-3 h-3" />
          </Button>
        </>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleUpgradeClick}
          className="h-8 px-2"
        >
          <Lock className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Upgrade</span>
        </Button>
      )}
      
      <ProjectCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onProjectCreated={handleProjectCreated}
        existingProjectCount={projects.length}
        userPlan={userPlan}
        existingProjects={projects.map(p => ({ id: p.id, color: p.color || '#3B82F6' }))}
      />
    </div>
  )
}