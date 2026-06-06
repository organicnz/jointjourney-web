import { login, signup } from './actions'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default async function LoginPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams;
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mt-20 mx-auto">
      <form className="flex-1 flex flex-col w-full justify-center gap-4 text-foreground">
        <div className="flex flex-col mb-4 gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and password to sign in or create a new account
          </p>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            name="email"
            placeholder="you@example.com"
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="••••••••"
            required
          />
        </div>
        
        <Button formAction={login} className="mt-4" variant="default">
          Sign In
        </Button>
        <Button formAction={signup} variant="outline">
          Sign Up
        </Button>
        
        {searchParams?.message && (
          <p className="mt-4 p-4 bg-muted text-foreground text-center text-sm rounded-md border border-border">
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  )
}
