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
  { value: '#3B82F6', nameKey: 'blue' },
  { value: '#10B981', nameKey: 'green' },
  { value: '#F59E0B', nameKey: 'yellow' },
  { value: '#EF4444', nameKey: 'red' },
  { value: '#8B5CF6', nameKey: 'purple' },
  { value: '#06B6D4', nameKey: 'cyan' },
  { value: '#F97316', nameKey: 'orange' },
  { value: '#84CC16', nameKey: 'lime' },
  { value: '#EC4899', nameKey: 'pink' },
  { value: '#6B7280', nameKey: 'gray' }
]
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Edit, Trash2, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useLanguage } from '@/contexts/language-context'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Currency, SUPPORTED_CURRENCIES, getDefaultCurrency, setDefaultCurrency } from '@/lib/currency-preferences'
import { ProjectsService } from '@/lib/projects'
import { Tables } from '@/lib/database.types'
import { EmailPreferencesService, EmailPreferences } from '@/lib/email-preferences'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SettingsPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()
  const [emailLoading, setEmailLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [defaultCurrency, setDefaultCurrencyState] = useState<Currency>('USD')
  const [isPro, setIsPro] = useState(false)
  const [projects, setProjects] = useState<Tables<'projects'>[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] = useState(false)
  const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Tables<'projects'> | null>(null)
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
  
  // Delete account form
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false)
  const [isDangerZoneOpen, setIsDangerZoneOpen] = useState(false)
  
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

        // Load email preferences for Pro users (free users see disabled preview)
        if (isUserPro) {
          await loadEmailPreferences()
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setProjectsLoading(false)
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load email preferences
  const loadEmailPreferences = useCallback(async () => {
    if (!user?.id) return
    
    try {
      setEmailPreferencesLoading(true)
      const preferences = await EmailPreferencesService.getUserPreferences(user.id)
      setEmailPreferences(preferences)
    } catch (error) {
      console.error('Error loading email preferences:', error)
      toast.error(t('settings.emailPreferencesLoadFailed'))
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
      toast.error(t('settings.passwordMinLength'))
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
      toast.error(error instanceof Error ? error.message : t('settings.passwordUpdateFailed'))
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newEmail || !newEmail.includes('@')) {
      toast.error(t('settings.validEmailRequired'))
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
      toast.error(error instanceof Error ? error.message : t('settings.emailUpdateFailed'))
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
      toast.error(t('settings.projectNameRequired'))
      return
    }

    const maxProjects = isPro ? 10 : 2
    if (projects.length >= maxProjects) {
      toast.error(t('settings.maxProjectsReached', { count: maxProjects, planNote: !isPro ? ' on free plan. Upgrade to Pro for up to 10 projects.' : '' }))
      return
    }

    // Check if there are available colors
    const usedColors = projects.map(p => p.color)
    const availableColors = PREDEFINED_COLORS.filter(color => !usedColors.includes(color.value))
    if (availableColors.length === 0) {
      toast.error(t('settings.noAvailableColors'))
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
      toast.success(t('settings.projectCreatedSuccess'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('settings.projectCreateFailed'))
    } finally {
      setProjectActionLoading(false)
    }
  }

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingProject || !projectName.trim()) {
      toast.error(t('settings.projectNameRequired'))
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
      toast.success(t('settings.projectUpdatedSuccess'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('settings.projectUpdateFailed'))
    } finally {
      setProjectActionLoading(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {

    try {
      await ProjectsService.deleteProject(projectId, user!.id)
      setProjects(prev => prev.filter(p => p.id !== projectId))
      toast.success(t('settings.projectDeletedSuccess'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('settings.projectDeleteFailed'))
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
      toast.success(t('settings.emailPreferencesUpdateSuccess'))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('settings.emailPreferencesUpdateFailed'))
    }
  }

  const handleReminderDayToggle = (day: number) => {
    if (!emailPreferences) return

    const currentDays = emailPreferences.renewal_reminder_days || [7]
    const newDays = currentDays.includes(day) 
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort((a, b) => b - a) // Sort descending

    handleEmailPreferenceUpdate({ renewal_reminder_days: newDays })
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'delete my account') {
      toast.error(t('settings.deleteAccountConfirmationError'))
      return
    }

    if (!user) return

    setDeleteAccountLoading(true)
    
    try {
      const response = await fetch('/api/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete account')
      }

      toast.success(t('settings.deleteAccountSuccess'))
      
      // Sign out and redirect
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)

    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error(error instanceof Error ? error.message : t('settings.deleteAccountFailed'))
    } finally {
      setDeleteAccountLoading(false)
    }
  }

  const openEditProject = (project: Tables<'projects'>) => {
    setEditingProject(project)
    setProjectName(project.name)
    setProjectDescription(project.description || '')
    setProjectColor(project.color || '#3B82F6')
    setIsEditProjectDialogOpen(true)
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 pt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold">{t('settings.title')}</h1>
        </div>
      </div>
      <div className="mb-6">
        <p className="text-muted-foreground">{t('settings.accountSettings')}</p>
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
            {t('settings.projectManagement')}
            <span className="text-sm font-normal text-muted-foreground">({projects.length}/{isPro ? '10' : '2'})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between sm:justify-start">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t('settings.projectDescription')}
                  </p>
                  {!isPro && (
                    <p className="text-xs text-muted-foreground">
                      {t('settings.freePlanProjectLimit')} • <button 
                        onClick={() => window.location.href = '/dashboard/billing'}
                        className="text-purple-600 hover:text-purple-700 underline"
                      >
                        {t('settings.upgradeProProjectsMsg')}
                      </button>
                    </p>
                  )}
                </div>
                {/* Button on desktop - inline with description */}
                <div className="hidden sm:block">
                  <Dialog open={isCreateProjectDialogOpen} onOpenChange={setIsCreateProjectDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        onClick={resetProjectForm}
                        disabled={!isPro && projects.length >= 2}
                        className={!isPro && projects.length >= 2 ? 'opacity-50 cursor-not-allowed' : ''}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t('settings.addProject')}
                        {!isPro && projects.length >= 2 && <Lock className="h-4 w-4 ml-2" />}
                      </Button>
                    </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('projects.createNewProject')}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateProject} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-name">{t('projects.projectName')}</Label>
                      <Input
                        id="project-name"
                        placeholder={t('projects.enterProjectName')}
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        disabled={projectActionLoading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-description">{t('projects.descriptionOptional')}</Label>
                      <Input
                        id="project-description"
                        placeholder={t('projects.enterProjectDescription')}
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        disabled={projectActionLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-color">{t('projects.color')}</Label>
                      <Select value={projectColor} onValueChange={setProjectColor} disabled={projectActionLoading}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('projects.selectColor')} />
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
                                  <span>{t(`colors.${color.nameKey}`)}</span>
                                </div>
                              </SelectItem>
                            )) : (
                              <SelectItem value="no-colors" disabled>
                                <span className="text-muted-foreground">{t('projects.allColorsInUse')}</span>
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
                        {t('common.cancel')}
                      </Button>
                      <Button type="submit" disabled={projectActionLoading || !projectName.trim()}>
                        {projectActionLoading ? t('projects.creating') : t('projects.createProject')}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              </div>
              {/* Button on mobile - separate row */}
              <div className="sm:hidden">
                <Dialog open={isCreateProjectDialogOpen} onOpenChange={setIsCreateProjectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      onClick={resetProjectForm}
                      disabled={!isPro && projects.length >= 2}
                      className={!isPro && projects.length >= 2 ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t('settings.addMobile')}
                      {!isPro && projects.length >= 2 && <Lock className="h-4 w-4 ml-2" />}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('projects.createNewProject')}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateProject} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="project-name-mobile">{t('projects.projectName')}</Label>
                        <Input
                          id="project-name-mobile"
                          placeholder={t('projects.enterProjectName')}
                          value={projectName}
                          onChange={(e) => setProjectName(e.target.value)}
                          disabled={projectActionLoading}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="project-description-mobile">{t('projects.descriptionOptional')}</Label>
                        <Input
                          id="project-description-mobile"
                          placeholder={t('projects.enterProjectDescription')}
                          value={projectDescription}
                          onChange={(e) => setProjectDescription(e.target.value)}
                          disabled={projectActionLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="project-color-mobile">{t('projects.color')}</Label>
                        <Select value={projectColor} onValueChange={setProjectColor} disabled={projectActionLoading}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('projects.selectColor')} />
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
                                    <span>{t(`colors.${color.nameKey}`)}</span>
                                  </div>
                                </SelectItem>
                              )) : (
                                <SelectItem value="no-colors" disabled>
                                  <span className="text-muted-foreground">{t('projects.allColorsInUse')}</span>
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
                          {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={projectActionLoading || !projectName.trim()}>
                          {projectActionLoading ? t('projects.creating') : t('projects.createProject')}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Upgrade prompt for free users at limit */}
            {!isPro && projects.length >= 2 && (
              <Alert className="border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20">
                <Lock className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-800 dark:text-purple-200">
                  {t('settings.youveReachedLimit')} 
                  <Button 
                    variant="link" 
                    size="sm"
                    className="text-purple-600 dark:text-purple-400 p-0 ml-1 h-auto"
                    onClick={() => window.location.href = '/dashboard/billing'}
                  >
                    {t('settings.upgradeProProjectsMsg')}
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
                <p>{t('settings.noProjectsYet')}</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: project.color || '#3B82F6' }}
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
                          {t('common.edit')}
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('projects.deleteProject')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('projects.deleteProjectConfirm', { name: project.name })}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteProject(project.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {t('projects.deleteProjectButton')}
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
            <DialogTitle>{t('projects.editProject')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditProject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-project-name">{t('projects.projectName')}</Label>
              <Input
                id="edit-project-name"
                placeholder={t('projects.enterProjectName')}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                disabled={projectActionLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project-description">{t('projects.descriptionOptional')}</Label>
              <Input
                id="edit-project-description"
                placeholder={t('projects.enterProjectDescription')}
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                disabled={projectActionLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-project-color">{t('projects.color')}</Label>
              <Select value={projectColor} onValueChange={setProjectColor} disabled={projectActionLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={t('projects.selectColor')} />
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
                          <span>{t(`colors.${color.nameKey}`)}</span>
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
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={projectActionLoading || !projectName.trim()}>
                {projectActionLoading ? t('projects.updating') : t('projects.updateProject')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Email Preferences Card (All users) */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t('settings.emailPreferences')}
            <Badge variant="secondary" className="text-xs">Pro</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isPro ? (
            /* Free user - show upgrade prompt */
            <div className="relative">
              {/* Overlay for disabled state */}
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-[1px] z-10 rounded-lg"></div>
              
              {/* Disabled preview content */}
              <div className="space-y-6 opacity-60 pointer-events-none">
                {/* Monthly Summary Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">{t('settings.monthlySummaryEmails')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.monthlySummaryDescription')}
                    </p>
                  </div>
                  <Switch checked={false} disabled />
                </div>

                <div className="border-t pt-6">
                  {/* Renewal Alerts Toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">{t('settings.renewalAlertEmails')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.renewalAlertDescription')}
                      </p>
                    </div>
                    <Switch checked={false} disabled />
                  </div>

                  {/* Reminder Days Preview */}
                  <div className="pl-4 border-l-2 border-muted space-y-3">
                    <Label className="text-sm font-medium text-muted-foreground">{t('settings.reminderSchedule')}</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="opacity-50">{t('settings.sevenDaysBefore')}</Badge>
                      <Badge variant="outline" className="opacity-50">{t('settings.threeDaysBefore')}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simple upgrade prompt */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="text-center bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-600 shadow-sm">
                  <p className="text-sm font-medium mb-3">{t('settings.upgradeForEmailReminders')}</p>
                  <Button onClick={() => router.push('/billing')} size="sm">
                    {t('settings.upgradeProPrice')}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Pro user - show working email preferences */
            <>
              {emailPreferencesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : emailPreferences ? (
                <div className="space-y-6">
                  {/* Monthly Summary Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-base font-medium">{t('settings.monthlySummaryEmails')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.monthlySummaryDescription')}
                      </p>
                    </div>
                    <Switch
                      checked={emailPreferences.monthly_summary_enabled ?? false}
                      onCheckedChange={(checked) => 
                        handleEmailPreferenceUpdate({ monthly_summary_enabled: checked })
                      }
                    />
                  </div>

                  <div className="border-t pt-6">
                    {/* Renewal Alerts Toggle */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="space-y-1">
                        <Label className="text-base font-medium">{t('settings.renewalAlertEmails')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('settings.renewalAlertDescription')}
                        </p>
                      </div>
                      <Switch
                        checked={emailPreferences.renewal_alerts_enabled ?? false}
                        onCheckedChange={(checked) => 
                          handleEmailPreferenceUpdate({ renewal_alerts_enabled: checked })
                        }
                      />
                    </div>

                    {/* Reminder Days Selection */}
                    {(emailPreferences.renewal_alerts_enabled ?? false) && (
                      <div className="pl-4 border-l-2 border-muted space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">{t('settings.reminderSchedule')}</Label>
                        <p className="text-xs text-muted-foreground mb-3">
                          {t('settings.reminderScheduleNote')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {[7, 3].map((day) => (
                            <Badge
                              key={day}
                              variant="outline"
                              className={`cursor-pointer transition-colors border-2 ${
                                (emailPreferences.renewal_reminder_days ?? []).includes(day) 
                                  ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" 
                                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              }`}
                              onClick={() => handleReminderDayToggle(day)}
                            >
                              {day} day{day !== 1 ? 's' : ''} before
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t('settings.selectedReminders', {
                            reminders: (emailPreferences.renewal_reminder_days ?? [])
                              .sort((a, b) => b - a)
                              .map(d => `${d} day${d !== 1 ? 's' : ''}`)
                              .join(', ') || t('settings.none')
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Anti-spam Notice */}
                  <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                    <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
                      {t('settings.smartDeliveryNotice')}
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <p>{t('settings.failedToLoadEmailPrefs')}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={loadEmailPreferences}
                  >
                    {t('settings.retry')}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

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

      {/* Danger Zone - Collapsible */}
      <Card className="mt-8 border-red-200 dark:border-red-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-red-600 dark:text-red-400">{t('settings.dangerZone')}</CardTitle>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setIsDangerZoneOpen(!isDangerZoneOpen)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDangerZoneOpen ? t('settings.closeDangerZone') : t('settings.openDangerZone')}
            </Button>
          </div>
        </CardHeader>
        
        {isDangerZoneOpen && (
          <CardContent className="space-y-6 border-t border-red-200 dark:border-red-800">
            <div className="space-y-4 pt-6">
              <div>
                <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">{t('settings.deleteAccount')}</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('settings.deleteAccountWarning')}
                </p>
                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 mb-4">
                  <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
                    ⚠️ <strong>{t('settings.thisWillPermanentlyDelete')}:</strong> {t('settings.deleteAccountDetails')}
                  </AlertDescription>
                </Alert>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      {t('settings.deleteAccount')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('settings.deleteAccountConfirmTitle')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('settings.deleteAccountConfirmText')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="my-4">
                      <Label htmlFor="delete-confirmation" className="text-sm">
                        {t('settings.deleteAccountConfirmPrompt')}
                      </Label>
                      <Input
                        id="delete-confirmation"
                        placeholder={t('settings.deleteAccountConfirmPhrase')}
                        className="mt-2"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        disabled={deleteAccountLoading}
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel 
                        disabled={deleteAccountLoading}
                        onClick={() => setDeleteConfirmation('')}
                      >
                        {t('common.cancel')}
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-red-600 hover:bg-red-700"
                        disabled={deleteConfirmation !== 'delete my account' || deleteAccountLoading}
                        onClick={handleDeleteAccount}
                      >
                        {deleteAccountLoading ? t('settings.deleting') : t('settings.deleteAccount')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}