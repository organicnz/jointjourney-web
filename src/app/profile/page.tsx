import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import ProfileForm from "./ProfileForm"

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session) {
    redirect("/login")
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('username, created_at, role, special_skills, status')
    .eq('id', session.user.id)
    .single()

  if (error) {
    console.error("Error fetching profile:", error)
  }

  return (
    <div className="flex-1 container max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-gray-900 dark:text-gray-100">Profile Settings</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">Manage your personal information and preferences.</p>
      
      <ProfileForm 
        userId={session.user.id}
        initialUsername={profile?.username || ''}
        role={profile?.role || 'user'}
        status={profile?.status || 'Lead'}
        specialSkills={profile?.special_skills || ''}
        email={session.user.email || ''}
        joinedAt={profile?.created_at || ''}
      />
    </div>
  )
}
