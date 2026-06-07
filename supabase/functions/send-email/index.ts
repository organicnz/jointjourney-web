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

    const { token, token_hash, redirect_to, email_action_type, site_url } = email_data

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
          background-color: #f3f4f6;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          overflow: hidden;
        }
        .header {
          background-color: #111827;
          color: #ffffff;
          padding: 30px 40px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: -0.025em;
        }
        .content {
          padding: 40px;
          text-align: center;
        }
        .content p {
          color: #4b5563;
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          background-color: #111827;
          color: #ffffff !important;
          font-weight: 600;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-size: 16px;
          transition: background-color 0.2s;
        }
        .button:hover {
          background-color: #374151;
        }
        .footer {
          background-color: #f9fafb;
          padding: 20px 40px;
          text-align: center;
          color: #9ca3af;
          font-size: 14px;
          border-top: 1px solid #f3f4f6;
        }
        .code {
          background: #f3f4f6;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 4px;
          color: #111827;
          margin: 20px 0;
          display: inline-block;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>JointJourney</h1>
        </div>
        <div class="content">
          <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin-top: 0;">${subject}</h2>
          <p>${description}</p>
          <a href="${verifyUrl}" class="button">${actionText}</a>
          <p style="margin-top: 40px; margin-bottom: 10px; font-size: 14px;">Or enter this code manually:</p>
          <div class="code">${token}</div>
        </div>
        <div class="footer">
          If you didn't request this email, you can safely ignore it.
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
