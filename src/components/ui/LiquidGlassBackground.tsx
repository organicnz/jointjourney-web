"use client"

export function LiquidGlassBackground() {
  return (
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-200/50 dark:bg-blue-900/30 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-all duration-1000" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-200/50 dark:bg-purple-900/30 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-all duration-1000" />
    </div>
  )
}
