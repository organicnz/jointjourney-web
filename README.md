# JointJourney

JointJourney is a modern, bleeding-edge web application built with the "Liquid Glass" aesthetic in mind. It uses the latest React 19, Next.js 16 App Router, and Tailwind CSS v4 to deliver a blazingly fast and beautiful user experience.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Transactional Emails**: [Resend](https://resend.com/) + Custom Supabase Edge Functions
- **Deployment**: [Vercel](https://vercel.com/) (Frontend) and [Cloudflare](https://cloudflare.com/) (DNS & Proxy)
- **Package Manager**: [Bun](https://bun.sh/) or `npm`

## Architecture Highlights

### Supabase SSR Authentication
JointJourney uses `@supabase/ssr` to ensure secure authentication flows across Server Components, Server Actions, Route Handlers, and Client Components. This allows for instant page rendering and secure session management.

### Custom Magic Links via Edge Functions
Instead of relying on the default SMTP templates provided by Supabase, JointJourney uses a **Custom Auth Webhook** running on a Supabase Edge Function (`send-email`). This intercepts authentication events (like `signup` or `magiclink`) and uses the **Resend API** to deliver beautifully formatted, custom HTML templates directly to users.

### Environment & Deployment
The application is deployed on Vercel with standard `npm run build` and runs via Vercel's Edge/Serverless infrastructure. It handles secure, unquoted environment variables and sits behind a Cloudflare Proxied DNS (`jointjourney.app`).

## Local Development

### Prerequisites
- Node.js v20+ or Bun installed
- Supabase CLI installed (`bunx supabase`)
- Access to the JointJourney Supabase Project (`nkxztsfuhgjvcdseuree`)

### Getting Started

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Link the Supabase Project:**
   ```bash
   bunx supabase link --project-ref nkxztsfuhgjvcdseuree
   ```

3. **Pull Environment Variables:**
   ```bash
   bunx vercel env pull .env.local
   ```
   *(Ensure variables do not contain literal quotes!)*

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Open the App:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Edge Functions

If you make changes to the `send-email` Edge Function (located in `supabase/functions/send-email`), you must deploy it to Supabase:
```bash
bunx supabase functions deploy send-email --project-ref nkxztsfuhgjvcdseuree
```

## Contributing

Make sure to run `npm run lint` and `npm run build` locally before pushing changes. We use strict ESLint v10 and TypeScript v6 settings.
