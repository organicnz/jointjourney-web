import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import CRMClient from "./CRMClient"
import { UserData } from "@/components/crm/types"

export default async function AdminPage() {
  const supabase = await createClient()

  // 1. Verify Authentication
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session) {
    redirect("/login")
  }

  // 2. Fetch Users Data Server-Side
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
  }

  const initialUsers: UserData[] = data || []

  // 3. Render Client Component with pre-fetched data
  return <CRMClient initialUsers={initialUsers} />
}
