const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const resendKey = process.env.RESEND_API_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testMagicLinkFlow() {
  console.log("Triggering magic link...")
  
  const testEmail = "contact@jointjourney.app"
  
  const { error } = await supabase.auth.signInWithOtp({
    email: testEmail,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `http://localhost:3000/auth/callback`,
    },
  })

  if (error) {
    console.error("Failed to trigger magic link:", error)
    return
  }

  console.log("Magic link triggered. Waiting 3 seconds for Resend to process...")
  
  await new Promise(resolve => setTimeout(resolve, 3000))

  console.log("Fetching latest emails from Resend...")
  
  // Resend API to get latest emails
  const res = await fetch("https://api.resend.com/emails", {
    headers: {
      "Authorization": `Bearer ${resendKey}`
    }
  })
  
  const data = await res.json()
  
  if (!data.data || data.data.length === 0) {
    console.log("No emails found in Resend logs.")
    return
  }

  const latestEmail = data.data[0]
  console.log("Latest email ID:", latestEmail.id)
  console.log("Subject:", latestEmail.subject)
  
  // To get the email body we have to fetch the specific email
  const emailRes = await fetch(`https://api.resend.com/emails/${latestEmail.id}`, {
    headers: {
      "Authorization": `Bearer ${resendKey}`
    }
  })
  
  const emailData = await emailRes.json()
  console.log("\n--- Email Body ---")
  
  // Extract verify URL from href="..."
  const match = emailData.html.match(/href="([^"]+)"/)
  if (match) {
    console.log("Extracted verifyUrl:", match[1])
  } else {
    console.log("Could not find href in HTML!")
  }
}

testMagicLinkFlow()
