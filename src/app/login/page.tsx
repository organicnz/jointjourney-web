"use client"

import { useState } from 'react'
import { signInWithMagicLink } from './actions'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, ArrowRight } from 'lucide-react'
import { LiquidGlassBackground } from '@/components/ui/LiquidGlassBackground'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")
    
    const formData = new FormData(e.currentTarget)
    const result = await signInWithMagicLink(formData)
    
    if (result?.error) {
      setErrorMsg(result.error)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div className="flex-1 flex flex-col w-full px-8 justify-center items-center min-h-screen relative">
      
      <LiquidGlassBackground />
      <div className="absolute top-6 right-6">
      </div>

      {/* Login Container */}
      <div className="w-full max-w-md bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl border border-white/80 dark:border-gray-800/80 shadow-2xl shadow-blue-900/5 rounded-3xl p-8 sm:p-12 relative overflow-hidden text-gray-900 dark:text-gray-100">

        {success ? (
          <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Mail className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Check your email</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              We've sent a magic link to your inbox. Click the link to securely sign in.
            </p>
            <Button variant="outline" className="w-full bg-white/50 dark:bg-gray-800/50 dark:border-gray-700" onClick={() => setSuccess(false)}>
              Try a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="text-center mb-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Enter your email to sign in or create a new account instantly. No passwords required.
              </p>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="email" className="ml-1">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="bg-white/80 dark:bg-gray-800/80 border-gray-200/80 dark:border-gray-700 h-12 rounded-xl focus-visible:ring-blue-500/30 transition-all shadow-sm"
              />
            </div>
            
            {errorMsg && (
              <div className="p-3 bg-red-50/80 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-800/50 animate-in fade-in zoom-in-95">
                {errorMsg}
              </div>
            )}

            <Button 
              type="submit" 
              className="h-12 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all font-medium group"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Continue with Email
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>
        )}
      </div>
      
      <p className="mt-8 text-sm text-gray-400 font-medium">
        Powered by JointJourney Secure Auth
      </p>
    </div>
  )
}
