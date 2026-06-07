"use server"

import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { Resend } from "resend"



const resend = new Resend(process.env.RESEND_API_KEY)

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("Unauthorized")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || profile?.role !== "admin") {
    throw new Error("Forbidden: Admin access required")
  }

  return user
}

export async function getUsersAction() {
  await verifyAdmin()
  
  const supabaseAdmin = createAdminClient()
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
  
  if (error) {
    console.error("Failed to fetch users:", error)
    throw new Error("Failed to fetch users")
  }

  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("id, crm_notes, status, special_skills, role")

  if (profilesError) {
    console.error("Failed to fetch profiles:", profilesError)
  }

  const profilesMap = new Map(profiles?.map(p => [p.id, p]) || [])

  return users.map(user => {
    const profile = profilesMap.get(user.id)
    return {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      special_skills: profile?.special_skills || "",
      status: profile?.status || "Lead",
      crm_notes: profile?.crm_notes || "",
      role: profile?.role || "user"
    }
  })
}

export async function updateUserSkillsAction(userId: string, skills: string) {
  await verifyAdmin()
  
  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ special_skills: skills })
    .eq("id", userId)
  
  if (error) {
    console.error("Failed to update user skills:", error)
    throw new Error("Failed to update user skills")
  }

  return { success: true }
}

export async function updateUserProfileDetailsAction(userId: string, updates: { status?: string, crm_notes?: string }) {
  await verifyAdmin()
  
  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin
    .from("profiles")
    .update(updates)
    .eq("id", userId)
  
  if (error) {
    console.error("Failed to update user profile details:", error)
    throw new Error("Failed to update user profile details")
  }

  return { success: true }
}

export async function sendAdminEmailAction(userIds: string[], subject: string, message: string) {
  const adminUser = await verifyAdmin()
  
  const supabaseAdmin = createAdminClient()
  
  // Fetch users to get their emails
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
  if (error) throw new Error("Failed to fetch user directory")
  
  const targetUsers = users.filter(u => userIds.includes(u.id))
  if (targetUsers.length === 0) throw new Error("No valid users selected")
  
  const targetEmails = targetUsers.map(u => u.email).filter(Boolean) as string[]

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; }
        .header { background-color: #111827; color: #ffffff; padding: 30px 40px; text-align: center; }
        .content { padding: 40px; color: #4b5563; font-size: 16px; line-height: 1.6; }
        .footer { background-color: #f9fafb; padding: 20px 40px; text-align: center; color: #9ca3af; font-size: 14px; border-top: 1px solid #f3f4f6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin:0; font-size: 24px;">JointJourney</h1>
        </div>
        <div class="content">
          ${message}
        </div>
        <div class="footer">
          You are receiving this email because you are a registered member of JointJourney.
        </div>
      </div>
    </body>
    </html>
  `

  try {
    // Send emails individually to avoid users seeing each other in BCC/CC
    const promises = targetEmails.map(email => 
      resend.emails.send({
        from: "JointJourney <contact@jointjourney.app>",
        to: [email],
        subject: subject,
        html: htmlContent
      })
    )
    
    await Promise.all(promises)
    return { success: true, count: userIds.length }
  } catch (err) {
    console.error("Failed to send emails via Resend:", err)
    throw new Error("Failed to send emails")
  }
}

export async function deleteUserAction(userId: string) {
  await verifyAdmin()
  
  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  
  if (error) {
    console.error("Failed to delete user:", error)
    throw new Error("Failed to delete user")
  }

  return { success: true }
}

export async function bulkUpdateUserStatusAction(userIds: string[], status: string) {
  await verifyAdmin()
  
  const supabaseAdmin = createAdminClient()
  const errors = []
  
  for (const userId of userIds) {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ status })
      .eq("id", userId)
    if (error) errors.push({ userId, error })
  }
  
  if (errors.length > 0) {
    console.error("Failed to update some user statuses:", errors)
    throw new Error(`Failed to update ${errors.length} users`)
  }

  return { success: true }
}
