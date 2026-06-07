"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return <div className={`w-10 h-10 ${className}`} />
  }

  return (
    <Button 
      variant="ghost" 
      className={`rounded-xl h-10 w-10 p-0 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-all duration-300 ${className || ""}`}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle dark mode"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}
