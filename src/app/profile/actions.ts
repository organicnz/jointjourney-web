"use server"

import { createClient } from "@/utils/supabase/server"

export async function updateProfileDetailsAction(userId: string, formData: FormData) {
  const supabase = await createClient()

  // Ensure users can only update their OWN profile
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user || user.id !== userId) {
    return { error: "Unauthorized or invalid user ID." }
  }

  const username = formData.get("username") as string

  // We are relying on the Postgres trigger to block status/role/special_skills updates
  // But we also just don't pass them here.
  const { error } = await supabase
    .from("profiles")
    .update({ username })
    .eq("id", userId)

  if (error) {
    console.error("Error updating profile:", error)
    return { error: error.message }
  }

  return { success: true }
}
