'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, HelpCircle } from 'lucide-react'
import { Tables } from '@/lib/database.types'
import { ProjectsService, GENERAL_PROJECT_ID } from '@/lib/projects'
import { useAuth } from '@/contexts/auth-context'

interface ProjectMultiSelectorProps {
  value: string[]
  onChange: (projectIds: string[]) => void
  disabled?: boolean
}

export function ProjectMultiSelector({ value, onChange, disabled }: ProjectMultiSelectorProps) {
  const [projects, setProjects] = useState<Tables<'projects'>[]>([])
  const [loading, setLoading] = useState(true)
  const [selectValue, setSelectValue] = useState<string>('') // Control the select state
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

  // Handle both real projects and the virtual General project
  const selectedProjects = projects.filter(p => value.includes(p.id))
  const isGeneralSelected = value.includes(GENERAL_PROJECT_ID)
  
  const availableProjects = projects.filter(p => !value.includes(p.id))
  const isGeneralAvailable = !value.includes(GENERAL_PROJECT_ID)

  const handleAddProject = (projectId: string) => {
    if (projectId && !value.includes(projectId)) {
      onChange([...value, projectId])
    }
    // Reset the select value to show placeholder again
    setSelectValue('')
  }

  const handleRemoveProject = (projectId: string) => {
    onChange(value.filter(id => id !== projectId))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <label className="text-sm font-medium">Projects</label>
        <div className="group relative">
          <HelpCircle className="w-3 h-3 text-muted-foreground cursor-help" />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            Create new projects in the dashboard using the &quot;+ Project&quot; button
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
      
      {/* Selected projects */}
      {(selectedProjects.length > 0 || isGeneralSelected) && (
        <div className="flex flex-wrap gap-2">
          {/* Show General if selected */}
          {isGeneralSelected && (
            <Badge key={GENERAL_PROJECT_ID} variant="secondary" className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              General
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemoveProject(GENERAL_PROJECT_ID)}
                disabled={disabled}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {/* Show real projects */}
          {selectedProjects.map((project) => (
            <Badge key={project.id} variant="secondary" className="flex items-center gap-1">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: project.color || '#3B82F6' }}
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

      {/* Add project selector - always visible with fixed width */}
      <Select 
        key={`project-selector-${availableProjects.length}`} 
        value={selectValue} 
        onValueChange={handleAddProject} 
        disabled={disabled || loading}
      >
        <SelectTrigger className="w-fit min-w-[140px]">
          <SelectValue placeholder="Add a project..." />
        </SelectTrigger>
        <SelectContent>
          {/* Show General if available */}
          {isGeneralAvailable && (
            <SelectItem key={GENERAL_PROJECT_ID} value={GENERAL_PROJECT_ID}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-500" />
                General
              </div>
            </SelectItem>
          )}
          {/* Show available real projects */}
          {availableProjects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: project.color || '#3B82F6' }}
                />
                {project.name}
              </div>
            </SelectItem>
          ))}
          {/* Show empty state only if no projects available and General is selected */}
          {availableProjects.length === 0 && !isGeneralAvailable && (
            <SelectItem value="no-projects" disabled>
              <span className="text-muted-foreground">
                All projects selected
              </span>
            </SelectItem>
          )}
        </SelectContent>
      </Select>

    </div>
  )
}