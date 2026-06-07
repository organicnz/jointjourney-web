"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { UserData } from "./types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart as PieChartIcon, TrendingUp } from "lucide-react"

export function CRMAnalyticsCharts({ users }: { users: UserData[] }) {
  // Pie Chart Data: User pipeline breakdown
  const statusData = useMemo(() => {
    const counts: Record<string, number> = { 'Lead': 0, 'Active': 0, 'VIP': 0, 'Inactive': 0, 'Banned': 0 }
    users.forEach(u => {
      const s = u.status || 'Lead'
      if (counts[s] !== undefined) counts[s]++
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value })).filter(item => item.value > 0)
  }, [users])

  const PIE_COLORS = { 'Lead': '#94a3b8', 'Active': '#2563eb', 'VIP': '#8b5cf6', 'Inactive': '#facc15', 'Banned': '#ef4444' }

  // Area Chart Data: Growth over time (last 30 days)
  const growthData = useMemo(() => {
    const data = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      const usersUpToDate = users.filter(u => new Date(u.created_at) <= d).length
      data.push({ date: dateStr, users: usersUpToDate })
    }
    return data
  }, [users])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <Card className="bg-white/60 backdrop-blur-2xl border-white/50 shadow-lg shadow-blue-900/5">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="p-2 bg-purple-50 rounded-xl text-purple-600"><PieChartIcon className="h-4 w-4" /></div>
          <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Pipeline Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS] || '#cbd5e1'} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            <p className="text-xs text-gray-500 font-medium">Total</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/60 backdrop-blur-2xl border-white/50 shadow-lg shadow-blue-900/5">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><TrendingUp className="h-4 w-4" /></div>
          <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider">User Growth (30 Days)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{fontSize: 10}} tickLine={false} axisLine={false} minTickGap={20} />
              <YAxis tick={{fontSize: 10}} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
