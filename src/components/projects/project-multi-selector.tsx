'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from 'lucide-react'
import { Project } from '@/lib/database.types'
import { ProjectsService } from '@/lib/projects'
import { useAuth } from '@/contexts/auth-context'

interface ProjectMultiSelectorProps {
  value: string[]
  onChange: (projectIds: string[]) => void
  disabled?: boolean
}

export function ProjectMultiSelector({ value, onChange, disabled }: ProjectMultiSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

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

  const selectedProjects = projects.filter(p => value.includes(p.id))
  const availableProjects = projects.filter(p => !value.includes(p.id))

  const handleAddProject = (projectId: string) => {
    if (projectId && !value.includes(projectId)) {
      onChange([...value, projectId])
    }
  }

  const handleRemoveProject = (projectId: string) => {
    onChange(value.filter(id => id !== projectId))
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Projects</label>
      
      {/* Selected projects */}
      {selectedProjects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedProjects.map((project) => (
            <Badge key={project.id} variant="secondary" className="flex items-center gap-1">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: project.color }}
              />
              {project.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemoveProject(project.id)}
                disabled={disabled}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Add project selector */}
      {availableProjects.length > 0 && (
        <Select onValueChange={handleAddProject} disabled={disabled || loading}>
          <SelectTrigger>
            <SelectValue placeholder="Add a project..." />
          </SelectTrigger>
          <SelectContent>
            {availableProjects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: project.color }}
                  />
                  {project.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {projects.length === 0 && !loading && (
        <p className="text-sm text-muted-foreground">
          No projects available. Create a project first.
        </p>
      )}
    </div>
  )
}