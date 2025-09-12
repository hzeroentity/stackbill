'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProjectsService } from '@/lib/projects'
import { useAuth } from '@/contexts/auth-context'
import { canAddProject, getProjectLimit } from '@/lib/plans'
import { PlanType } from '@/lib/database.types'
import { useLanguage } from '@/contexts/language-context'

// Predefined color options
const PREDEFINED_COLORS = [
  { value: '#3B82F6', nameKey: 'blue', bg: 'bg-blue-500' },
  { value: '#10B981', nameKey: 'green', bg: 'bg-emerald-500' },
  { value: '#F59E0B', nameKey: 'yellow', bg: 'bg-amber-500' },
  { value: '#EF4444', nameKey: 'red', bg: 'bg-red-500' },
  { value: '#8B5CF6', nameKey: 'purple', bg: 'bg-violet-500' },
  { value: '#06B6D4', nameKey: 'cyan', bg: 'bg-cyan-500' },
  { value: '#F97316', nameKey: 'orange', bg: 'bg-orange-500' },
  { value: '#84CC16', nameKey: 'lime', bg: 'bg-lime-500' },
  { value: '#EC4899', nameKey: 'pink', bg: 'bg-pink-500' },
  { value: '#6B7280', nameKey: 'gray', bg: 'bg-gray-500' }
]

interface ProjectCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectCreated?: (projectId: string) => void
  existingProjectCount?: number
  userPlan?: PlanType
  existingProjects?: { id: string; color: string }[]
}

export function ProjectCreateDialog({ open, onOpenChange, onProjectCreated, existingProjectCount = 0, userPlan = 'free', existingProjects = [] }: ProjectCreateDialogProps) {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectColor, setProjectColor] = useState('')

  // Filter out colors that are already used by other projects
  const getAvailableColors = () => {
    const usedColors = existingProjects.map(p => p.color)
    return PREDEFINED_COLORS.filter(color => !usedColors.includes(color.value))
  }

  const availableColors = getAvailableColors()

  // Set default color when dialog opens
  useEffect(() => {
    if (open && !projectColor && availableColors.length > 0) {
      setProjectColor(availableColors[0].value)
    }
  }, [open, projectColor, availableColors])

  const resetForm = () => {
    setProjectName('')
    setProjectDescription('')
    const availableColors = getAvailableColors()
    setProjectColor(availableColors.length > 0 ? availableColors[0].value : '#3B82F6')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!projectName.trim()) {
      setError(t('projectDialog.nameRequired'))
      return
    }

    if (!canAddProject(existingProjectCount, userPlan)) {
      const limit = getProjectLimit(userPlan)
      setError(t('projectDialog.maxProjectsReached', { limit, plan: userPlan }))
      return
    }

    if (availableColors.length === 0) {
      setError(t('projectDialog.noAvailableColors'))
      return
    }

    if (!user?.id) {
      setError(t('projectDialog.userNotAuthenticated'))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const newProject = await ProjectsService.createProject({
        user_id: user.id,
        name: projectName.trim(),
        description: projectDescription.trim() || null,
        color: projectColor
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
          <DialogTitle>{t('projectDialog.createTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">{t('projectDialog.projectName')}</Label>
            <Input
              id="project-name"
              placeholder={t('projectDialog.enterProjectName')}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project-description">{t('projectDialog.descriptionOptional')}</Label>
            <Input
              id="project-description"
              placeholder={t('projectDialog.enterProjectDescription')}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project-color">{t('projectDialog.color')}</Label>
            <Select value={projectColor} onValueChange={setProjectColor} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder={t('projectDialog.selectColor')} />
              </SelectTrigger>
              <SelectContent>
                {availableColors.length > 0 ? availableColors.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.value }}
                      />
                      <span>{t(`colors.${color.nameKey}`)}</span>
                    </div>
                  </SelectItem>
                )) : (
                  <SelectItem value="no-colors" disabled>
                    <span className="text-muted-foreground">{t('projectDialog.allColorsInUse')}</span>
                  </SelectItem>
                )}
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
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading || !projectName.trim()}>
              {loading ? t('projectDialog.creating') : t('projectDialog.createProject')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}