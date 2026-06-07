"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, Activity } from "lucide-react"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { UserData } from "./types"

export function CRMStatsCards({ users, loading }: { users: UserData[], loading: boolean }) {
  const metrics = useMemo(() => {
    const total = users.length
    const now = new Date()
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
    
    const newSignups = users.filter(u => new Date(u.created_at) > thirtyDaysAgo).length
    const activeRecently = users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > thirtyDaysAgo).length

    return { total, newSignups, activeRecently }
  }, [users])

  const sparklineData = useMemo(() => {
    const now = new Date()
    const dataTotal = []
    const dataSignups = []
    const dataActive = []

    for (let i = 9; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const startOfDay = new Date(d.setHours(0,0,0,0))
      const endOfDay = new Date(d.setHours(23,59,59,999))

      // Total users up to this day
      const upToDay = users.filter(u => new Date(u.created_at) <= endOfDay).length
      dataTotal.push({ value: upToDay })

      // New signups on this specific day
      const signupsOnDay = users.filter(u => {
        const created = new Date(u.created_at)
        return created >= startOfDay && created <= endOfDay
      }).length
      dataSignups.push({ value: signupsOnDay })

      // Active on this specific day (approximation using last_sign_in_at)
      const activeOnDay = users.filter(u => {
        if (!u.last_sign_in_at) return false
        const lastSignIn = new Date(u.last_sign_in_at)
        return lastSignIn >= startOfDay && lastSignIn <= endOfDay
      }).length
      dataActive.push({ value: activeOnDay })
    }

    return { total: dataTotal, signups: dataSignups, active: dataActive }
  }, [users])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl border border-white/60 dark:border-gray-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(37,99,235,0.1)] transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
          <CardTitle className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Total Users</CardTitle>
          <div className="p-2.5 bg-blue-100/50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400 backdrop-blur-md border border-white/50 dark:border-blue-800/50 shadow-sm"><Users className="h-4 w-4" /></div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight">{loading ? '-' : metrics.total}</div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">All time registered accounts</p>
          <div className="absolute bottom-0 right-0 w-32 h-16 opacity-40 pointer-events-none mix-blend-multiply dark:mix-blend-screen">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData.total}>
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={false} isAnimationActive={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl border border-white/60 dark:border-gray-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(22,163,74,0.1)] transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
          <CardTitle className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">New Signups</CardTitle>
          <div className="p-2.5 bg-green-100/50 dark:bg-green-900/30 rounded-2xl text-green-600 dark:text-green-400 backdrop-blur-md border border-white/50 dark:border-green-800/50 shadow-sm"><UserPlus className="h-4 w-4" /></div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight">{loading ? '-' : metrics.newSignups}</div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">Users joined in last 30 days</p>
          <div className="absolute bottom-0 right-0 w-32 h-16 opacity-40 pointer-events-none mix-blend-multiply dark:mix-blend-screen">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData.signups}>
                <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={3} dot={false} isAnimationActive={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl border border-white/60 dark:border-gray-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(147,51,234,0.1)] transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
          <CardTitle className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Active Users</CardTitle>
          <div className="p-2.5 bg-purple-100/50 dark:bg-purple-900/30 rounded-2xl text-purple-600 dark:text-purple-400 backdrop-blur-md border border-white/50 dark:border-purple-800/50 shadow-sm"><Activity className="h-4 w-4" /></div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight">{loading ? '-' : metrics.activeRecently}</div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">Signed in during last 30 days</p>
          <div className="absolute bottom-0 right-0 w-32 h-16 opacity-40 pointer-events-none mix-blend-multiply dark:mix-blend-screen">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData.active}>
                <Line type="monotone" dataKey="value" stroke="#9333ea" strokeWidth={3} dot={false} isAnimationActive={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
