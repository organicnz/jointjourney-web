import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Button, buttonVariants } from '@/components/ui/button'
import { signOut } from '@/app/auth/actions'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from "@/lib/utils"

export async function Navbar() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                <span className="text-sm text-muted-foreground hidden sm:inline-block font-medium">
                  {user.email}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "rounded-full px-4 font-semibold")}>
                    Account
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
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
              <Link href="/login" className={cn(buttonVariants({ variant: "default", size: "sm" }), "px-6 rounded-full font-semibold")}>
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
