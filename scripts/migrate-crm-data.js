const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function migrate() {
  console.log('Starting migration from auth.users to public.profiles...')
  
  // 1. Fetch all users from Auth
  const { data: { users }, error } = await supabase.auth.admin.listUsers()
  if (error) {
    console.error('Failed to list users:', error)
    return
  }

  let migratedCount = 0

  // 2. For each user, update their profile
  for (const user of users) {
    const metadata = user.user_metadata || {}
    
    // Only update if they actually have CRM data
    if (metadata.crm_notes || metadata.status || metadata.special_skills) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          crm_notes: metadata.crm_notes || '',
          status: metadata.status || 'Lead',
          special_skills: metadata.special_skills || ''
        })
        .eq('id', user.id)

      if (updateError) {
        console.error(`Failed to update profile for user ${user.id}:`, updateError)
      } else {
        migratedCount++
        console.log(`Migrated user ${user.id} - Status: ${metadata.status || 'Lead'}`)
      }
    }
  }

  console.log(`\nMigration complete. Migrated ${migratedCount} users.`)
}

migrate()
