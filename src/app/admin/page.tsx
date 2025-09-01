'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Users, CreditCard, FolderOpen, Search } from "lucide-react"
import { TwoFASetup } from "@/components/admin/2fa-setup"

interface AdminUser {
  id: string
  email?: string
  created_at: string
  plan_type: string
  total_subscriptions: number
  active_subscriptions: number  
  total_projects: number
  monthly_spending: number
  stripe_customer_id?: string
  subscriptions: AdminSubscription[]
  projects: AdminProject[]
}

interface AdminSubscription {
  id: string
  name: string
  amount: number
  currency: string
  billing_period: string
  category: string
  is_active: boolean
  created_at: string
  projects: { name: string; color: string }[]
}

interface AdminProject {
  id: string
  name: string
  description?: string
  color: string
  created_at: string
  subscription_count: number
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set())
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchAdminData()
    }
  }, [user?.id])

  const fetchAdminData = async () => {
    if (!user?.id) {
      setError('User not authenticated')
      setLoading(false)
      return
    }

    try {
      // Check admin verification first
      const verifyResponse = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json()
        setTwoFAEnabled(verifyData.totp_enabled || false)
      }

      const response = await fetch(`/api/admin/users?userId=${user.id}`)
      if (!response.ok) {
        const errorData = await response.json()
        
        if (response.status === 403) {
          console.error('Admin access denied:', errorData)
          let errorMessage = 'Access denied. This page is for administrators only.'
          
          if (errorData.debug) {
            errorMessage += `\n\nDebug info:\nYour email: ${errorData.debug.userEmail}\nAdmin email: ${errorData.debug.adminEmail}\nUser ID: ${errorData.debug.userId}`
          }
          
          throw new Error(errorMessage)
        }
        
        throw new Error(`Failed to fetch admin data: ${errorData.error || 'Unknown error'}`)
      }
      const data = await response.json()
      setUsers(data.users)
    } catch (err) {
      console.error('Admin dashboard error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const toggleUserExpansion = (userId: string) => {
    const newExpanded = new Set(expandedUsers)
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId)
    } else {
      newExpanded.add(userId)
    }
    setExpandedUsers(newExpanded)
  }

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Calculate totals
  const totalUsers = users.length
  const proUsers = users.filter(u => u.plan_type === 'pro').length
  const totalRevenue = proUsers * 4 // $4/month per Pro user
  const totalSubscriptions = users.reduce((sum, u) => sum + u.total_subscriptions, 0)
  const totalProjects = users.reduce((sum, u) => sum + u.total_projects, 0)

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Access Error
              </h2>
              <pre className="text-red-600 dark:text-red-400 text-sm whitespace-pre-wrap">{error}</pre>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of all users, subscriptions, and platform metrics
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {proUsers} Pro ({((proUsers / totalUsers) * 100).toFixed(1)}%)
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {proUsers} Pro subscriptions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              Across all users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              Across all users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2FA Setup Section */}
      <div className="mb-8">
        <TwoFASetup 
          isEnabled={twoFAEnabled} 
          onSetupComplete={() => setTwoFAEnabled(true)}
        />
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search users by email or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Subscriptions</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Monthly Spend</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <React.Fragment key={user.id}>
                  <TableRow key={`user-${user.id}`} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => toggleUserExpansion(user.id)}
                      >
                        {expandedUsers.has(user.id) ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.email || 'No email'}</span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {user.id.slice(0, 8)}...
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.plan_type === 'pro' ? 'default' : 'secondary'}
                        className={
                          user.plan_type === 'pro' 
                            ? 'bg-purple-600 hover:bg-purple-700' 
                            : ''
                        }
                      >
                        {user.plan_type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.active_subscriptions}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.total_subscriptions} total
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{user.total_projects}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(user.monthly_spending)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.created_at)}
                    </TableCell>
                  </TableRow>
                  
                  {/* Collapsible Details */}
                  <TableRow key={`details-${user.id}`}>
                    <TableCell colSpan={7} className="p-0">
                      <Collapsible open={expandedUsers.has(user.id)}>
                        <CollapsibleContent>
                          <div className="p-4 bg-muted/25 border-t">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Subscriptions */}
                              <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                  <CreditCard className="h-4 w-4" />
                                  Subscriptions ({user.subscriptions.length})
                                </h4>
                                {user.subscriptions.length > 0 ? (
                                  <div className="space-y-2">
                                    {user.subscriptions.map((sub) => (
                                      <div key={sub.id} className="p-3 bg-background rounded-lg border">
                                        <div className="flex justify-between items-start mb-2">
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium truncate">{sub.name}</span>
                                              <Badge 
                                                variant={sub.is_active ? 'default' : 'secondary'}
                                                className={sub.is_active ? 'bg-green-600' : 'bg-gray-500'}
                                              >
                                                {sub.is_active ? 'Active' : 'Inactive'}
                                              </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{sub.category}</p>
                                          </div>
                                          <div className="text-right">
                                            <p className="font-medium">
                                              {formatCurrency(sub.amount, sub.currency)}
                                            </p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                              {sub.billing_period}
                                            </p>
                                          </div>
                                        </div>
                                        {sub.projects.length > 0 && (
                                          <div className="flex gap-1 flex-wrap">
                                            {sub.projects.map((project, idx) => (
                                              <Badge 
                                                key={idx}
                                                variant="outline" 
                                                className="text-xs"
                                                style={{ 
                                                  borderColor: project.color, 
                                                  color: project.color,
                                                  backgroundColor: `${project.color}15`
                                                }}
                                              >
                                                {project.name}
                                              </Badge>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">No subscriptions</p>
                                )}
                              </div>

                              {/* Projects */}
                              <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                  <FolderOpen className="h-4 w-4" />
                                  Projects ({user.projects.length})
                                </h4>
                                {user.projects.length > 0 ? (
                                  <div className="space-y-2">
                                    {user.projects.map((project) => (
                                      <div key={project.id} className="p-3 bg-background rounded-lg border">
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                              <div 
                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: project.color }}
                                              />
                                              <span className="font-medium truncate">{project.name}</span>
                                            </div>
                                            {project.description && (
                                              <p className="text-sm text-muted-foreground mb-2">
                                                {project.description}
                                              </p>
                                            )}
                                            <div className="flex justify-between items-center">
                                              <span className="text-xs text-muted-foreground">
                                                {project.subscription_count} subscriptions
                                              </span>
                                              <span className="text-xs text-muted-foreground">
                                                {formatDate(project.created_at)}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">No projects</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}