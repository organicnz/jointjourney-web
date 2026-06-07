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
    return Array.from({length: 10}, (_, i) => ({
      value: Math.floor(Math.random() * 10) + (metrics.total / 10 * i)
    }))
  }, [metrics.total])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-white/60 backdrop-blur-2xl border-white/50 shadow-lg shadow-blue-900/5 hover:shadow-blue-900/10 transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Users</CardTitle>
          <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Users className="h-4 w-4" /></div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-4xl font-bold text-gray-900">{loading ? '-' : metrics.total}</div>
          <p className="text-sm text-gray-500 mt-2 font-medium">All time registered accounts</p>
          <div className="absolute bottom-2 right-4 w-24 h-12 opacity-30 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/60 backdrop-blur-2xl border-white/50 shadow-lg shadow-blue-900/5 hover:shadow-blue-900/10 transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">New Signups</CardTitle>
          <div className="p-2 bg-green-50 rounded-xl text-green-600"><UserPlus className="h-4 w-4" /></div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-4xl font-bold text-gray-900">{loading ? '-' : metrics.newSignups}</div>
          <p className="text-sm text-gray-500 mt-2 font-medium">Users joined in last 30 days</p>
          <div className="absolute bottom-2 right-4 w-24 h-12 opacity-30 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-white/60 backdrop-blur-2xl border-white/50 shadow-lg shadow-blue-900/5 hover:shadow-blue-900/10 transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Users</CardTitle>
          <div className="p-2 bg-purple-50 rounded-xl text-purple-600"><Activity className="h-4 w-4" /></div>
        </CardHeader>
        <CardContent className="relative">
          <div className="text-4xl font-bold text-gray-900">{loading ? '-' : metrics.activeRecently}</div>
          <p className="text-sm text-gray-500 mt-2 font-medium">Signed in during last 30 days</p>
          <div className="absolute bottom-2 right-4 w-24 h-12 opacity-30 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line type="monotone" dataKey="value" stroke="#9333ea" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
