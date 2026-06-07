import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

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
    // Alternatively, we could render a 403 Forbidden page here
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 text-gray-900">
        <h1 className="text-3xl font-bold tracking-tight text-red-600">403 Forbidden</h1>
        <p className="mt-2 text-gray-600">You do not have permission to view the Admin Dashboard.</p>
        <a href="/" className="mt-6 font-medium text-blue-600 hover:underline">Return to Home</a>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col flex-1 w-full min-h-screen">
      <header className="border-b border-gray-200/50 dark:border-gray-800/50 bg-white/50 dark:bg-gray-950/50 backdrop-blur-xl sticky top-0 z-40 transition-colors">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h2 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
              JointJourney CRM
            </h2>
          </div>
          <div className="flex items-center space-x-4 text-sm font-medium">
            <span className="text-gray-600 dark:text-gray-300 hidden sm:inline-block">{user.email}</span>
            <span className="px-2.5 py-1 bg-gradient-to-r from-emerald-500/10 to-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm">
              Admin
            </span>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 relative z-10 flex-1">
        {children}
      </main>
    </div>
  )
}
