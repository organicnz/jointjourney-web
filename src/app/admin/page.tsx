import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import CRMClient from "./CRMClient"
import { getUsersAction } from "./actions"

export default async function AdminPage() {
  const supabase = await createClient()

  // 1. Verify Authentication
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session) {
    redirect("/login")
  }

  // 2. Fetch Users Data Server-Side (Includes emails from auth.users via Admin API)
  let initialUsers = []
  try {
    initialUsers = await getUsersAction()
  } catch (error) {
    console.error("Error fetching users:", error)
  }

  // 3. Render Client Component with pre-fetched data
  return <CRMClient initialUsers={initialUsers} />
}
