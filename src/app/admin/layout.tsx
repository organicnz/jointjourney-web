import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, LayoutDashboard, User } from "lucide-react"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold tracking-tight">403 Forbidden</h1>
        <p className="mt-2 text-muted-foreground">You do not have permission to view the Admin Dashboard.</p>
        <a href="/" className="mt-6 font-medium text-primary hover:underline">Return to Home</a>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col flex-1 w-full min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-40 transition-colors">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              JointJourney CRM
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <User className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
            <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 border-emerald-500/20 uppercase tracking-wide px-3 shadow-none">
              Admin
            </Badge>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 relative z-10 flex-1">
        {children}
      </main>
    </div>
  )
}
