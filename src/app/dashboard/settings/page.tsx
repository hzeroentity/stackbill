'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Plus, Edit, Trash2, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useLanguage } from '@/contexts/language-context'
import { createClient } from '@supabase/supabase-js'
import { Currency, SUPPORTED_CURRENCIES, getDefaultCurrency, setDefaultCurrency } from '@/lib/currency-preferences'
import { ProjectsService } from '@/lib/projects'
import { Project } from '@/lib/database.types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SettingsPage() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [emailLoading, setEmailLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
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
  useEffect(() => {
    if (user?.id) {
      loadUserData()
    }
  }, [user?.id]) // Removed loadUserData dependency to prevent loop

  const loadUserData = async () => {
    try {
      // Check if user has pro subscription
      const response = await fetch(`/api/user-subscription?userId=${user?.id}`)
      if (response.ok) {
        const { userSubscription } = await response.json()
        const isUserPro = userSubscription.plan_type === 'pro'
        setIsPro(isUserPro)

        // Load projects if pro
        if (isUserPro) {
          const projectsData = await ProjectsService.getProjects(user!.id)
          setProjects(projectsData)
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setProjectsLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: t('auth.passwordsDontMatch') })
      return
    }
    
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }
    
    setPasswordLoading(true)
    setMessage(null)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      
      setMessage({ type: 'success', text: t('settings.passwordChanged') })
      setNewPassword('')
      setConfirmPassword('')
      setIsPasswordDialogOpen(false)
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update password' 
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newEmail || !newEmail.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' })
      return
    }
    
    setEmailLoading(true)
    setMessage(null)
    
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      })
      
      if (error) throw error
      
      setMessage({ 
        type: 'success', 
        text: t('settings.emailChanged') 
      })
      setNewEmail('')
      setIsEmailDialogOpen(false)
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update email' 
      })
    } finally {
      setEmailLoading(false)
    }
  }

  const handleCurrencyChange = (currency: Currency) => {
    setDefaultCurrency(currency)
    setDefaultCurrencyState(currency)
    setMessage({ 
      type: 'success', 
      text: t('settings.currencyUpdated') 
    })
  }

  const resetProjectForm = () => {
    setProjectName('')
    setProjectDescription('')
    setProjectColor('#3B82F6')
    setEditingProject(null)
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!projectName.trim()) {
      setMessage({ type: 'error', text: 'Project name is required' })
      return
    }

    if (projects.length >= 10) {
      setMessage({ type: 'error', text: 'Maximum of 10 projects allowed' })
      return
    }

    setProjectActionLoading(true)
    setMessage(null)

    try {
      const newProject = await ProjectsService.createProject({
        user_id: user!.id,
        name: projectName.trim(),
        description: projectDescription.trim() || null,
        color: projectColor,
        is_active: true
      })

      setProjects(prev => [...prev, newProject])
      resetProjectForm()
      setIsCreateProjectDialogOpen(false)
      setMessage({ type: 'success', text: 'Project created successfully!' })
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to create project' 
      })
    } finally {
      setProjectActionLoading(false)
    }
  }

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingProject || !projectName.trim()) {
      setMessage({ type: 'error', text: 'Project name is required' })
      return
    }

    setProjectActionLoading(true)
    setMessage(null)

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
      setMessage({ type: 'success', text: 'Project updated successfully!' })
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update project' 
      })
    } finally {
      setProjectActionLoading(false)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    setMessage(null)

    try {
      await ProjectsService.deleteProject(projectId, user!.id)
      setProjects(prev => prev.filter(p => p.id !== projectId))
      setMessage({ type: 'success', text: 'Project deleted successfully!' })
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to delete project' 
      })
    }
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

      {message && (
        <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
          <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

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
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Project Management
            {!isPro && <Badge variant="secondary" className="bg-purple-100 text-purple-800">Pro</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isPro ? (
            <div className="relative">
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                <div className="text-center p-6">
                  <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Upgrade to Pro</h3>
                  <p className="text-muted-foreground mb-4">
                    Organize your subscriptions by project with Pro plan
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/dashboard/billing'}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Upgrade to Pro
                  </Button>
                </div>
              </div>
              
              {/* Blurred preview */}
              <div className="space-y-4 opacity-30">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Create and manage projects to organize your subscriptions
                  </p>
                  <Button size="sm" disabled>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Button>
                </div>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Sample Project</p>
                        <p className="text-sm text-muted-foreground">Project description</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" disabled>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Create and manage projects to organize your subscriptions
                </p>
                <Dialog open={isCreateProjectDialogOpen} onOpenChange={setIsCreateProjectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={resetProjectForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Project
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
          )}
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