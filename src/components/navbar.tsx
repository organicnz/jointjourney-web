import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Button, buttonVariants } from '@/components/ui/button'
import { signOut } from '@/app/auth/actions'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { cn } from "@/lib/utils"
import { Bell } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export async function Navbar() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 dark:border-white/5 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/40 supports-[backdrop-filter]:dark:bg-slate-950/40 shadow-sm dark:shadow-none transition-colors duration-300">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between mx-auto px-4 sm:px-8">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold sm:inline-block tracking-tight text-lg">JointJourney</span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center">
            {user ? (
              <div className="flex items-center gap-4">
                
                <DropdownMenu>
                  <DropdownMenuTrigger className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 border-2 border-white dark:border-gray-950"></span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 rounded-xl shadow-xl dark:border-gray-800">
                    <DropdownMenuLabel className="font-semibold text-lg py-3 px-4">Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator className="dark:bg-gray-800" />
                    <div className="max-h-[300px] overflow-y-auto">
                      <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Welcome to JointJourney! 🎉</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Your account has been successfully verified.</p>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">Just now</p>
                      </div>
                      <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">New Feature: Dark Mode</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">You can now toggle dark mode using the switcher.</p>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">1 hour ago</p>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <span className="text-sm text-muted-foreground hidden sm:inline-block font-medium">
                  {user.email}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "rounded-full px-4 font-semibold")}>
                    Account
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <Link href="/profile" className="w-full text-left">
                      <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        Profile Settings
                      </DropdownMenuItem>
                    </Link>
                    <form action={signOut}>
                      <button className="w-full text-left">
                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-950">
                          Sign out
                        </DropdownMenuItem>
                      </button>
                    </form>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link href="/login" className={cn(buttonVariants({ variant: "default", size: "sm" }), "px-6 rounded-full font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md hover:shadow-lg transition-all text-white")}>
                Sign In
              </Link>
            )}
            <div className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-800 flex items-center h-8">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
