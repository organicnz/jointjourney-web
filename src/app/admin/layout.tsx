import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

const ADMIN_EMAILS = [
  "contact@jointjourney.app",
  "tamerlanium@gmail.com",
  "Fuad.aliyevcap@gmail.com"
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  if (!user.email || !ADMIN_EMAILS.includes(user.email)) {
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
    <div className="min-h-screen bg-gray-50/50">
      <header className="border-b bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-gray-900">JointJourney CRM</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>{user.email}</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">Admin</span>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
