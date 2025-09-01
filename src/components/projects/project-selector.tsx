'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus, Lock } from "lucide-react"
import { Project } from '@/lib/database.types'
import { ProjectsService, GENERAL_PROJECT_ID, getProjectDisplayName } from '@/lib/projects'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'

interface ProjectSelectorProps {
  value: string | null
  onChange: (projectId: string | null) => void
  disabled?: boolean
  isPro: boolean
}

export function ProjectSelector({ value, onChange, disabled, isPro }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
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

  // Show lock overlay for free plan users
  if (!isPro) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Project</label>
        <div className="relative">
          <Select disabled>
            <SelectTrigger className="relative">
              <SelectValue placeholder="General" />
            </SelectTrigger>
          </Select>
          <div className="absolute inset-0 bg-muted/50 rounded-md flex items-center justify-center cursor-pointer" onClick={handleUpgradeClick}>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span className="text-sm">Pro Feature</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Project</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            // TODO: Open project creation dialog
            console.log('Open project creation dialog')
          }}
          className="h-7 px-2"
        >
          <Plus className="w-3 h-3 mr-1" />
          New
        </Button>
      </div>
      
      <Select
        value={value || GENERAL_PROJECT_ID}
        onValueChange={(val) => onChange(val === GENERAL_PROJECT_ID ? null : val)}
        disabled={disabled || loading}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select project..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={GENERAL_PROJECT_ID}>
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