'use client'

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/mode-toggle"
import { useLanguage } from "@/contexts/language-context"

export function Header() {
  const { signOut, user } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const getUserInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        {/* Mobile Layout */}
        <div className="flex flex-col space-y-4 sm:hidden">
          <div className="flex justify-between items-center">
            {/* Left: Logo + StackBill */}
            <div className="flex items-center space-x-2">
              <Image
                src="/stackbill-logo.svg"
                alt="StackBill"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <Link href="/dashboard" className="text-xl font-bold">
                StackBill
              </Link>
            </div>
            
            {/* Right: Theme Toggle + User Dropdown */}
            <div className="flex items-center space-x-2">
              <ModeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-xs">
                        {user?.email ? getUserInitials(user.email) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{t('navigation.account')}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">{t('navigation.settings')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    {t('auth.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Center: Navigation */}
          <div className="flex justify-center space-x-1">
            <Link href="/dashboard" className="flex-1 max-w-20">
              <Button variant="ghost" size="sm" className="w-full text-xs">{t('navigation.dashboard')}</Button>
            </Link>
            <Link href="/dashboard/billing" className="flex-1 max-w-20">
              <Button variant="ghost" size="sm" className="w-full text-xs">{t('navigation.billing')}</Button>
            </Link>
            <Link href="/dashboard/settings" className="flex-1 max-w-20">
              <Button variant="ghost" size="sm" className="w-full text-xs">{t('navigation.settings')}</Button>
            </Link>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex justify-between items-center">
          {/* Left: Logo + StackBill */}
          <div className="flex items-center space-x-3">
            <Image
              src="/stackbill-logo.svg"
              alt="StackBill"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <Link href="/dashboard" className="text-xl font-bold">
              StackBill
            </Link>
          </div>
          
          {/* Right: Navigation + Theme Toggle + User Dropdown */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Link href="/dashboard">
                <Button variant="ghost">{t('navigation.dashboard')}</Button>
              </Link>
              <Link href="/dashboard/billing">
                <Button variant="ghost">{t('navigation.billing')}</Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button variant="ghost">{t('navigation.settings')}</Button>
              </Link>
            </div>
            
            <ModeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10">
                      {user?.email ? getUserInitials(user.email) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{t('navigation.account')}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">{t('navigation.settings')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  {t('auth.signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}