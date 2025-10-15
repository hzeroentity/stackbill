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
import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { TutorialHelpButton } from "@/components/tutorial/tutorial-dialog"

export function Header() {
  const { signOut, user } = useAuth()
  const router = useRouter()
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }
  
  const closeMobileMenu = () => {
    setIsOpen(false)
  }

  const getUserInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        {/* Mobile Layout */}
        <div className="flex justify-between items-center sm:hidden">
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
              StackBill<span className="text-primary">.dev</span>
            </Link>
          </div>
          
          {/* Right: Help + Theme Toggle + Burger Menu */}
          <div className="flex items-center space-x-2">
            <TutorialHelpButton />
            <ModeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {/* Navigation Links */}
                  <div className="space-y-2">
                    <Link href="/dashboard" onClick={closeMobileMenu}>
                      <Button variant="ghost" className="w-full justify-start">
                        {t('navigation.dashboard')}
                      </Button>
                    </Link>
                    <Link href="/dashboard/billing" onClick={closeMobileMenu}>
                      <Button variant="ghost" className="w-full justify-start">
                        {t('navigation.billing')}
                      </Button>
                    </Link>
                    <Link href="/dashboard/settings" onClick={closeMobileMenu}>
                      <Button variant="ghost" className="w-full justify-start">
                        {t('navigation.settings')}
                      </Button>
                    </Link>
                    <Link href="/dashboard/support" onClick={closeMobileMenu}>
                      <Button variant="ghost" className="w-full justify-start">
                        {t('navigation.support')}
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Separator */}
                  <div className="border-t border-muted my-4"></div>
                  
                  {/* User Section */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-3 py-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10">
                          {user?.email ? getUserInitials(user.email) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-none">{t('navigation.account')}</p>
                        <p className="text-xs leading-none text-muted-foreground truncate mt-1">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => {
                        handleSignOut()
                        closeMobileMenu()
                      }}
                    >
                      {t('auth.signOut')}
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
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
              StackBill<span className="text-primary">.dev</span>
            </Link>
          </div>
          
          {/* Right: Navigation + Help + Theme Toggle + User Dropdown */}
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
              <Link href="/dashboard/support">
                <Button variant="ghost">{t('navigation.support')}</Button>
              </Link>
            </div>

            <TutorialHelpButton />
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
                  <Link href="/dashboard/settings" className="cursor-pointer">{t('navigation.settings')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
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