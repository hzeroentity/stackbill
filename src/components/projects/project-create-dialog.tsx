'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProjectsService } from '@/lib/projects'
import { useAuth } from '@/contexts/auth-context'

// Predefined color options
const PREDEFINED_COLORS = [
  { value: '#3B82F6', name: 'Blue', bg: 'bg-blue-500' },
  { value: '#10B981', name: 'Green', bg: 'bg-emerald-500' },
  { value: '#F59E0B', name: 'Yellow', bg: 'bg-amber-500' },
  { value: '#EF4444', name: 'Red', bg: 'bg-red-500' },
  { value: '#8B5CF6', name: 'Purple', bg: 'bg-violet-500' },
  { value: '#06B6D4', name: 'Cyan', bg: 'bg-cyan-500' },
  { value: '#F97316', name: 'Orange', bg: 'bg-orange-500' },
  { value: '#84CC16', name: 'Lime', bg: 'bg-lime-500' },
  { value: '#EC4899', name: 'Pink', bg: 'bg-pink-500' },
  { value: '#6B7280', name: 'Gray', bg: 'bg-gray-500' }
]

interface ProjectCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectCreated?: (projectId: string) => void
  existingProjectCount?: number
}

export function ProjectCreateDialog({ open, onOpenChange, onProjectCreated, existingProjectCount = 0 }: ProjectCreateDialogProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectColor, setProjectColor] = useState('#3B82F6')

  const resetForm = () => {
    setProjectName('')
    setProjectDescription('')
    setProjectColor('#3B82F6')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!projectName.trim()) {
      setError('Project name is required')
      return
    }

    if (existingProjectCount >= 10) {
      setError('Maximum of 10 projects allowed')
      return
    }

    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const newProject = await ProjectsService.createProject({
        user_id: user.id,
        name: projectName.trim(),
        description: projectDescription.trim() || null,
        color: projectColor,
        is_active: true
      })

      // Reset form and close dialog
      resetForm()
      onOpenChange(false)
      
      // Notify parent component
      if (onProjectCreated) {
        onProjectCreated(newProject.id)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !loading) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project-description">Description (Optional)</Label>
            <Input
              id="project-description"
              placeholder="Enter project description"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project-color">Color</Label>
            <Select value={projectColor} onValueChange={setProjectColor} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a color..." />
              </SelectTrigger>
              <SelectContent>
                {PREDEFINED_COLORS.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.value }}
                      />
                      <span>{color.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-800 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !projectName.trim()}>
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}