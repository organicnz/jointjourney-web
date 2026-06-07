import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Get env variables (make sure to run this script with access to jointjourney-web/.env.local)
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing environment variables. Please run this from jointjourney-web or pass them in.");
  process.exit(1);
}

const targetEmails = ['tamerlanium@gmail.com', 'contact@jointjourney.app'];

async function testResend(email: string) {
  console.log(`📨 Testing Transactional Email to ${email}...`);
  const resend = new Resend(RESEND_API_KEY);
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'JointJourney <contact@jointjourney.app>',
      to: email,
      subject: 'Test Transactional Email',
      html: `<p>Hello from your new Resend setup at JointJourney! This is a test transactional email sent to ${email}.</p>`
    });

    if (error) {
      console.error(`❌ Resend Error for ${email}:`, error);
    } else {
      console.log(`✅ Resend Success for ${email}! Message ID:`, data?.id);
    }
  } catch (err) {
    console.error(`❌ Exception during Resend test for ${email}:`, err);
  }
}

async function testSupabaseAuth(email: string) {
  console.log(`\n🔐 Testing Supabase Auth Email (Magic Link) to ${email}...`);
  const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);

  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        // You can redirect back to localhost or prod url
        emailRedirectTo: 'http://localhost:3000/auth/callback',
      },
    });

    if (error) {
      console.error(`❌ Supabase Auth Error for ${email}:`, error.message);
    } else {
      console.log(`✅ Supabase Auth Success! Magic link sent to ${email}.`);
    }
  } catch (err) {
    console.error(`❌ Exception during Supabase Auth test for ${email}:`, err);
  }
}

async function run() {
  console.log("🚀 Starting Email Experience Test...");
  for (const email of targetEmails) {
    await testResend(email);
    await testSupabaseAuth(email);
  }
  console.log("\n🎉 Tests finished. Please check the inboxes!");
}

run();
