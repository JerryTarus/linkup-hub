
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUser } from '@/hooks/useUser'
import { User, Settings, LogOut, Calendar, Users } from 'lucide-react'
import { toast } from 'sonner'
import axios, { isAxiosError } from 'axios'

export default function Navbar() {
  const { user, loading } = useUser()
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {}, {
        withCredentials: true
      })
      toast.success('Logged out successfully')
      router.push('/')
      router.refresh()
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Logout failed')
      } else {
        toast.error('An unexpected error occurred')
      }
    }
  }

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LH</span>
            </div>
            <span className="font-bold text-xl text-brand-primary">Link Up Hub</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/events" 
              className={`text-sm font-medium transition-colors hover:text-brand-accent ${
                isActive('/events') ? 'text-brand-accent' : 'text-gray-600'
              }`}
            >
              Events
            </Link>
            {user && (
              <Link 
                href="/dashboard" 
                className={`text-sm font-medium transition-colors hover:text-brand-accent ${
                  pathname.startsWith('/dashboard') ? 'text-brand-accent' : 'text-gray-600'
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-brand-accent text-white">
                        {user.email.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  {(user.role === 'admin' || user.role === 'super_admin') && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/events/create" className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>Create Event</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/admin" className="flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="bg-brand-accent hover:bg-brand-accent/90">
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
