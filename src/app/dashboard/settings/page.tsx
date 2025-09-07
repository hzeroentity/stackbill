'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

// Predefined color options
const PREDEFINED_COLORS = [
  { value: '#3B82F6', name: 'Blue' },
  { value: '#10B981', name: 'Green' },
  { value: '#F59E0B', name: 'Yellow' },
  { value: '#EF4444', name: 'Red' },
  { value: '#8B5CF6', name: 'Purple' },
  { value: '#06B6D4', name: 'Cyan' },
  { value: '#F97316', name: 'Orange' },
  { value: '#84CC16', name: 'Lime' },
  { value: '#EC4899', name: 'Pink' },
  { value: '#6B7280', name: 'Gray' }
]
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Edit, Trash2, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useLanguage } from '@/contexts/language-context'
import { createClient } from '@supabase/supabase-js'
import { Currency, SUPPORTED_CURRENCIES, getDefaultCurrency, setDefaultCurrency } from '@/lib/currency-preferences'
import { ProjectsService } from '@/lib/projects'
import { Project } from '@/lib/database.types'
import { EmailPreferencesService, EmailPreferences } from '@/lib/email-preferences'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SettingsPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [emailLoading, setEmailLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [defaultCurrency, setDefaultCurrencyState] = useState<Currency>('USD')
  const [isPro, setIsPro] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false)
  const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [projectActionLoading, setProjectActionLoading] = useState(false)
  
  // Email preferences state
  const [emailPreferences, setEmailPreferences] = useState<EmailPreferences | null>(null)
  const [emailPreferencesLoading, setEmailPreferencesLoading] = useState(false)
  
  // Password change form
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Email change form
  const [newEmail, setNewEmail] = useState('')
  
  // Project form
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectColor, setProjectColor] = useState('#3B82F6')
  
  // Load currency preference on mount
  useEffect(() => {
    setDefaultCurrencyState(getDefaultCurrency())
  }, [])

  // Load user subscription and projects
  const loadUserData = useCallback(async () => {
    try {
      // Check if user has pro subscription
      const response = await fetch(`/api/user-subscription?userId=${user?.id}`)
      if (response.ok) {
        const { userSubscription } = await response.json()
        const isUserPro = userSubscription.plan_type === 'pro'
        setIsPro(isUserPro)

        // Load projects for all users (free users can have up to 2 projects)
        const projectsData = await ProjectsService.getProjects(user!.id)
        setProjects(projectsData)

        // Load email preferences for Pro users
        if (isUserPro) {
          await loadEmailPreferences()
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setProjectsLoading(false)
    }
  }, [user])

  // Load email preferences
  const loadEmailPreferences = useCallback(async () => {
    if (!user?.id) return
    
    try {
      setEmailPreferencesLoading(true)
      const preferences = await EmailPreferencesService.getUserPreferences(user.id)
      setEmailPreferences(preferences)
    } catch (error) {
      console.error('Error loading email preferences:', error)
      toast.error('Failed to load email preferences')
    } finally {
      setEmailPreferencesLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user?.id) {
      loadUserData()
    }
  }, [user?.id, loadUserData])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error(t('auth.passwordsDontMatch'))
      return
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    setPasswordLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      
      toast.success(t('settings.passwordChanged'))
      setNewPassword('')
      setConfirmPassword('')
      setIsPasswordDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    
    setEmailLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      })
      
      if (error) throw error
      
      toast.success(t('settings.emailChanged'))
      setNewEmail('')
      setIsEmailDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update email')
    } finally {
      setEmailLoading(false)
    }
  }

  const handleCurrencyChange = (currency: Currency) => {
    setDefaultCurrency(currency)
    setDefaultCurrencyState(currency)
    toast.success(t('settings.currencyUpdated'))
  }

  const resetProjectForm = () => {
    setProjectName('')
    setProjectDescription('')
    // Get first available color for new projects
    const usedColors = projects.map(p => p.color)
    const availableColor = PREDEFINED_COLORS.find(color => !usedColors.includes(color.value))
    setProjectColor(availableColor?.value || '#3B82F6')
    setEditingProject(null)
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!projectName.trim()) {
      toast.error('Project name is required')
      return
    }

    const maxProjects = isPro ? 10 : 2
    if (projects.length >= maxProjects) {
      toast.error(`Maximum of ${maxProjects} projects allowed${!isPro ? ' on free plan. Upgrade to Pro for up to 10 projects.' : ''}`)
      return
    }

    // Check if there are available colors
    const usedColors = projects.map(p => p.color)
    const availableColors = PREDEFINED_COLORS.filter(color => !usedColors.includes(color.value))
    if (availableColors.length === 0) {
      toast.error('No available colors. Please edit an existing project to change its color first.')
      return
    }

    setProjectActionLoading(true)

    try {
      const newProject = await ProjectsService.createProject({
        user_id: user!.id,
        name: projectName.trim(),
        description: projectDescription.trim() || null,
        color: projectColor
      })

      setProjects(prev => [...prev, newProject])
      resetProjectForm()
      setIsCreateProjectDialogOpen(false)
      toast.success('Project created successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create project')
    } finally {
      setProjectActionLoading(false)
    }
  }

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingProject || !projectName.trim()) {
      toast.error('Project name is required')
      return
    }

    setProjectActionLoading(true)

    try {
      const updatedProject = await ProjectsService.updateProject(editingProject.id, user!.id, {
        name: projectName.trim(),
        description: projectDescription.trim() || null,
        color: projectColor
      })

      setProjects(prev => 
        prev.map(p => p.id === updatedProject.id ? updatedProject : p)
      )
      resetProjectForm()
      setIsEditProjectDialogOpen(false)
      toast.success('Project updated successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update project')
    } finally {
      setProjectActionLoading(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {

    try {
      await ProjectsService.deleteProject(projectId, user!.id)
      setProjects(prev => prev.filter(p => p.id !== projectId))
      toast.success('Project deleted successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete project')
    }
  }

  // Handle email preference updates
  const handleEmailPreferenceUpdate = async (
    updates: Partial<Pick<EmailPreferences, 'monthly_summary_enabled' | 'renewal_alerts_enabled' | 'renewal_reminder_days'>>
  ) => {
    if (!user?.id || !emailPreferences) return

    try {
      const updatedPreferences = await EmailPreferencesService.updatePreferences(user.id, updates)
      setEmailPreferences(updatedPreferences)
      toast.success('Email preferences updated successfully!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update email preferences')
    }
  }

  const handleReminderDayToggle = (day: number) => {
    if (!emailPreferences) return

    const currentDays = emailPreferences.renewal_reminder_days
    const newDays = currentDays.includes(day) 
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort((a, b) => b - a) // Sort descending

    handleEmailPreferenceUpdate({ renewal_reminder_days: newDays })
  }

  const openEditProject = (project: Project) => {
    setEditingProject(project)
    setProjectName(project.name)
    setProjectDescription(project.description || '')
    setProjectColor(project.color)
    setIsEditProjectDialogOpen(true)
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">{t('settings.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('settings.accountSettings')}</p>
      </div>


      {/* Account Settings Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('settings.accountSettings')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Account Information */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">{t('common.email')}</Label>
              <p className="text-base">{user?.email || 'Loading...'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">{t('settings.registeredOn')}</Label>
              <p className="text-base">
                {user?.created_at 
                  ? new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Loading...'
                }
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  {t('settings.changeEmail')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('settings.changeEmail')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEmailChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-email">{t('settings.newEmail')}</Label>
                    <Input
                      id="new-email"
                      type="email"
                      placeholder={t('settings.newEmail')}
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      disabled={emailLoading}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsEmailDialogOpen(false)}
                      disabled={emailLoading}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button type="submit" disabled={emailLoading || !newEmail}>
                      {emailLoading ? t('settings.changingEmail') : t('settings.changeEmail')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  {t('settings.changePassword')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('settings.changePassword')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">{t('settings.newPassword')}</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder={t('settings.newPassword')}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={passwordLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{t('settings.confirmNewPassword')}</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder={t('settings.confirmNewPassword')}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={passwordLoading}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsPasswordDialogOpen(false)}
                      disabled={passwordLoading}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={passwordLoading || !newPassword || !confirmPassword}
                    >
                      {passwordLoading ? t('settings.changingPassword') : t('settings.changePassword')}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Project Management Card */}
      <Card className="mb-6" id="projects">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Project Management
            <span className="text-sm font-normal text-muted-foreground">({projects.length}/{isPro ? '10' : '2'})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Create and manage projects to organize your subscriptions
                </p>
                {!isPro && (
                  <p className="text-xs text-muted-foreground">
                    Free plan: up to 2 projects • <button 
                      onClick={() => window.location.href = '/dashboard/billing'}
                      className="text-purple-600 hover:text-purple-700 underline"
                    >
                      Upgrade to Pro for up to 10 projects
                    </button>
                  </p>
                )}
              </div>
              <Dialog open={isCreateProjectDialogOpen} onOpenChange={setIsCreateProjectDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    onClick={resetProjectForm}
                    disabled={!isPro && projects.length >= 2}
                    className={!isPro && projects.length >= 2 ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                    {!isPro && projects.length >= 2 && <Lock className="h-4 w-4 ml-2" />}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateProject} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-name">Project Name</Label>
                      <Input
                        id="project-name"
                        placeholder="Enter project name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        disabled={projectActionLoading}
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
                        disabled={projectActionLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-color">Color</Label>
                      <Select value={projectColor} onValueChange={setProjectColor} disabled={projectActionLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a color..." />
                        </SelectTrigger>
                        <SelectContent>
                          {(() => {
                            const usedColors = projects.map(p => p.color)
                            const availableColors = PREDEFINED_COLORS.filter(color => !usedColors.includes(color.value))
                            return availableColors.length > 0 ? availableColors.map((color) => (
                              <SelectItem key={color.value} value={color.value}>
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: color.value }}
                                  />
                                  <span>{color.name}</span>
                                </div>
                              </SelectItem>
                            )) : (
                              <SelectItem value="no-colors" disabled>
                                <span className="text-muted-foreground">All colors are in use</span>
                              </SelectItem>
                            )
                          })()} 
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCreateProjectDialogOpen(false)}
                        disabled={projectActionLoading}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={projectActionLoading || !projectName.trim()}>
                        {projectActionLoading ? 'Creating...' : 'Create Project'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Upgrade prompt for free users at limit */}
            {!isPro && projects.length >= 2 && (
              <Alert className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20">
                <Lock className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-800 dark:text-purple-200">
                  You&apos;ve reached the free plan limit (2 projects). 
                  <Button 
                    variant="link" 
                    size="sm"
                    className="text-purple-600 dark:text-purple-400 p-0 ml-1 h-auto"
                    onClick={() => window.location.href = '/dashboard/billing'}
                  >
                    Upgrade to Pro for up to 10 projects
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {projectsLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <p>No projects yet. Create your first project to organize subscriptions!</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: project.color }}
                      ></div>
                      <div>
                        <p className="font-medium">{project.name}</p>
                        {project.description && (
                          <p className="text-sm text-muted-foreground">{project.description}</p>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditProject(project)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Project</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete &quot;{project.name}&quot;? This action cannot be undone. 
                                All subscriptions in this project will be moved to General.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteProject(project.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Project
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Project Dialog */}
      <Dialog open={isEditProjectDialogOpen} onOpenChange={setIsEditProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditProject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-project-name">Project Name</Label>
              <Input
                id="edit-project-name"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={projectActionLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project-description">Description (Optional)</Label>
              <Input
                id="edit-project-description"
                placeholder="Enter project description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                disabled={projectActionLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project-color">Color</Label>
              <Select value={projectColor} onValueChange={setProjectColor} disabled={projectActionLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a color..." />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    const usedColors = projects.filter(p => p.id !== editingProject?.id).map(p => p.color)
                    const availableColors = PREDEFINED_COLORS.filter(color => 
                      !usedColors.includes(color.value) || color.value === projectColor
                    )
                    return availableColors.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: color.value }}
                          />
                          <span>{color.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  })()} 
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditProjectDialogOpen(false)}
                disabled={projectActionLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={projectActionLoading || !projectName.trim()}>
                {projectActionLoading ? 'Updating...' : 'Update Project'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Email Preferences Card (Pro users only) */}
      {isPro && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Email Preferences
              <Badge variant="secondary" className="text-xs">Pro</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {emailPreferencesLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : emailPreferences ? (
              <div className="space-y-6">
                {/* Monthly Summary Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Monthly Summary Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a monthly summary of your subscription expenses and insights
                    </p>
                  </div>
                  <Switch
                    checked={emailPreferences.monthly_summary_enabled}
                    onCheckedChange={(checked) => 
                      handleEmailPreferenceUpdate({ monthly_summary_enabled: checked })
                    }
                  />
                </div>

                <div className="border-t pt-6">
                  {/* Renewal Alerts Toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">Renewal Alert Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified before your subscriptions renew
                      </p>
                    </div>
                    <Switch
                      checked={emailPreferences.renewal_alerts_enabled}
                      onCheckedChange={(checked) => 
                        handleEmailPreferenceUpdate({ renewal_alerts_enabled: checked })
                      }
                    />
                  </div>

                  {/* Reminder Days Selection */}
                  {emailPreferences.renewal_alerts_enabled && (
                    <div className="pl-4 border-l-2 border-muted space-y-3">
                      <Label className="text-sm font-medium text-muted-foreground">Reminder Schedule</Label>
                      <p className="text-xs text-muted-foreground mb-3">
                        Choose when you want to receive renewal reminders (you can select multiple)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[14, 7, 3, 1].map((day) => (
                          <Badge
                            key={day}
                            variant={emailPreferences.renewal_reminder_days.includes(day) ? "default" : "outline"}
                            className={`cursor-pointer transition-colors ${
                              emailPreferences.renewal_reminder_days.includes(day) 
                                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                                : "hover:bg-muted"
                            }`}
                            onClick={() => handleReminderDayToggle(day)}
                          >
                            {day} day{day !== 1 ? 's' : ''} before
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Currently selected: {emailPreferences.renewal_reminder_days
                          .sort((a, b) => b - a)
                          .map(d => `${d} day${d !== 1 ? 's' : ''}`)
                          .join(', ') || 'None'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Anti-spam Notice */}
                <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                  <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
                    📧 <strong>Smart Delivery:</strong> We&apos;ll never spam you. Monthly summaries are sent once per month, 
                    and renewal alerts are limited to once per day maximum to avoid overwhelming your inbox.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                <p>Failed to load email preferences</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={loadEmailPreferences}
                >
                  Retry
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Currency Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.currencyPreferences')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">{t('settings.preferredCurrency')}</Label>
              <p className="text-sm text-muted-foreground mb-2">
                {t('settings.currencyNote')}
              </p>
              <Select value={defaultCurrency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="w-full sm:w-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.symbol} {currency.label} ({currency.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}