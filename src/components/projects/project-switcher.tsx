'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus, Lock } from "lucide-react"
import { Project } from '@/lib/database.types'
import { ProjectsService, ALL_PROJECTS_ID, GENERAL_PROJECT_ID, getProjectDisplayName } from '@/lib/projects'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { ProjectCreateDialog } from './project-create-dialog'

interface ProjectSwitcherProps {
  selectedProject: string
  onProjectChange: (projectId: string) => void
  isPro: boolean
  subscriptionCounts: Record<string, number>
}

export function ProjectSwitcher({ selectedProject, onProjectChange, isPro, subscriptionCounts }: ProjectSwitcherProps) {
  const [projects, setProjects] = useState<Project[]>([])
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
      return Object.values(subscriptionCounts).reduce((sum, count) => sum + count, 0)
    }
    if (projectId === GENERAL_PROJECT_ID) {
      return subscriptionCounts['general'] || 0
    }
    return subscriptionCounts[projectId] || 0
  }

  // Show lock overlay for free plan users
  if (!isPro) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          <Select disabled>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
          </Select>
          <div 
            className="absolute inset-0 bg-muted/50 rounded-md flex items-center justify-center cursor-pointer" 
            onClick={handleUpgradeClick}
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span className="text-xs">Pro</span>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleUpgradeClick}
          className="h-8 px-2"
        >
          <Plus className="w-3 h-3 mr-1" />
          <span className="hidden sm:inline">Project</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedProject}
        onValueChange={onProjectChange}
        disabled={loading}
      >
        <SelectTrigger className="w-40">
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
                {getProjectCount(ALL_PROJECTS_ID)}
              </span>
            </div>
          </SelectItem>
          <SelectItem value={GENERAL_PROJECT_ID}>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                General
              </div>
              <span className="text-xs text-muted-foreground ml-2">
                {getProjectCount(GENERAL_PROJECT_ID)}
              </span>
            </div>
          </SelectItem>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: project.color }}
                  />
                  {project.name}
                </div>
                <span className="text-xs text-muted-foreground ml-2">
                  {getProjectCount(project.id)}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsCreateDialogOpen(true)}
        className="h-8 px-2"
      >
        <Plus className="w-3 h-3 mr-1" />
        <span className="hidden sm:inline">Project</span>
      </Button>
      
      <ProjectCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onProjectCreated={handleProjectCreated}
        existingProjectCount={projects.length}
      />
    </div>
  )
}