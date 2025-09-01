'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Project } from '@/lib/database.types'
import { ProjectsService } from '@/lib/projects'
import { useAuth } from '@/contexts/auth-context'

interface ProjectSelectorProps {
  value: string | null
  onChange: (projectId: string | null) => void
  disabled?: boolean
}

export function ProjectSelector({ value, onChange, disabled }: ProjectSelectorProps) {
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

  // Free users can now use projects up to their limit

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Project</label>
      
      <Select
        value={value || 'general'}
        onValueChange={(val) => onChange(val === 'general' ? null : val)}
        disabled={disabled || loading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select project..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='general'>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              General
            </div>
          </SelectItem>
          {projects.map((project) => (
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
    </div>
  )
}