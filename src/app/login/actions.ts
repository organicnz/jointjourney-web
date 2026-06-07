'use server'

import { createClient } from '@/utils/supabase/server'

export async function signInWithMagicLink(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  
  if (!email) {
    return { error: 'Email is required' }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `https://jointjourney.app/auth/callback`,
    },
  })

  if (error) {
    console.error("Magic link error:", error)
    return { error: error.message || 'Could not send magic link' }
  }

  return { success: true }
}
