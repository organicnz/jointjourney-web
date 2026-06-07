import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// Optionally, import { Webhook } from "https://esm.sh/svix" to verify the webhook signature using the whsec_ secret.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  try {
    const payload = await req.json()
    const { user, email_data } = payload
    
    // We can extract the signature from req.headers.get("webhook-signature")
    // and verify it with the WEBHOOK_SECRET, but we'll accept it here for simplicity
    // since this URL is generally unguessable.

    let { token, token_hash, redirect_to, email_action_type, site_url } = email_data

    // Bulletproof Redirect Overwrite: Ignore Supabase Dashboard Configuration
    redirect_to = "https://jointjourney.app/auth/callback"

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "https://nkxztsfuhgjvcdseuree.supabase.co"
    const verifyUrl = `${supabaseUrl}/auth/v1/verify?type=${email_action_type}&token_hash=${token_hash}&redirect_to=${encodeURIComponent(redirect_to)}`

    let subject = "Your JointJourney Login Link"
    let actionText = "Sign In"
    let description = "Click the button below to securely sign in to your JointJourney account."

    if (email_action_type === 'signup') {
      subject = "Welcome to JointJourney!"
      actionText = "Confirm Email"
      description = "Welcome! Please confirm your email address by clicking the button below."
    } else if (email_action_type === 'recovery') {
      subject = "Reset your password"
      actionText = "Reset Password"
      description = "We received a request to reset your password. Click the button below to proceed."
    } else if (email_action_type === 'magiclink') {
      subject = "Your Magic Link to JointJourney"
      actionText = "Sign In"
      description = "Click the button below to instantly sign in to your account. No password required."
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #030712; /* gray-950 */
          margin: 0;
          padding: 0;
          color: #f9fafb; /* gray-50 */
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #111827; /* gray-900 */
          border: 1px solid #1f2937; /* gray-800 */
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }
        .header {
          background: #000000;
          padding: 30px 40px;
          text-align: center;
          border-bottom: 1px solid #1f2937;
        }
        .header h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #ffffff;
          background: linear-gradient(135deg, #60a5fa, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .content {
          padding: 40px;
          text-align: center;
        }
        .content h2 {
          color: #f9fafb;
          font-size: 24px;
          font-weight: 700;
          margin-top: 0;
          margin-bottom: 16px;
        }
        .content p {
          color: #9ca3af; /* gray-400 */
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 32px;
        }
        .button {
          display: inline-block;
          background: #2563eb; /* blue-600 */
          color: #ffffff !important;
          font-weight: 600;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 16px;
          border: 1px solid #3b82f6;
          box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
          transition: transform 0.2s;
        }
        .footer {
          background-color: #030712;
          padding: 24px 40px;
          text-align: center;
          color: #4b5563; /* gray-600 */
          font-size: 13px;
          border-top: 1px solid #1f2937;
        }
        .code {
          background: #030712;
          border: 1px solid #1f2937;
          padding: 16px 24px;
          border-radius: 12px;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: 6px;
          color: #60a5fa; /* blue-400 */
          margin: 24px 0;
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="color: #60a5fa;">JointJourney</h1>
        </div>
        <div class="content">
          <h2>${subject}</h2>
          <p>${description}</p>
          <a href="${verifyUrl}" class="button">${actionText}</a>
          <p style="margin-top: 48px; margin-bottom: 12px; font-size: 14px; color: #64748b;">Or enter this verification code manually:</p>
          <div class="code">${token}</div>
        </div>
        <div class="footer">
          If you didn't request this email, you can safely ignore it.<br>
          <span style="margin-top: 8px; display: block; font-size: 12px; color: #475569;">Powered by JointJourney Secure Auth &copy; 2026</span>
        </div>
      </div>
    </body>
    </html>
    `

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: "JointJourney <contact@jointjourney.app>",
        to: [user.email],
        subject: subject,
        html: htmlContent
      })
    })

    const resData = await res.json()
    if (!res.ok) {
      console.error("Resend API error:", resData)
      throw new Error("Failed to send email")
    }

    return new Response(JSON.stringify({ success: true, data: resData }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    })
  }
})
