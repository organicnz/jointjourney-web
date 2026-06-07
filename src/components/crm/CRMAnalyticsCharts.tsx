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
      <Card className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl border border-white/60 dark:border-gray-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(147,51,234,0.1)] transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="flex flex-row items-center gap-3 pb-2 relative z-10 border-b border-white/30 dark:border-gray-700/30">
          <div className="p-2.5 bg-purple-100/50 dark:bg-purple-900/30 rounded-2xl text-purple-600 dark:text-purple-400 backdrop-blur-md shadow-sm border border-white/50 dark:border-purple-800/50"><PieChartIcon className="h-4 w-4" /></div>
          <CardTitle className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Pipeline Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center relative z-10 p-6">
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
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={2}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name as keyof typeof PIE_COLORS] || '#cbd5e1'} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.4)', boxShadow: '0 10px 30px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tooltip-bg, rgba(255,255,255,0.7))', backdropFilter: 'blur(16px)', color: 'var(--tooltip-text, #111827)' }}
                itemStyle={{ color: 'var(--tooltip-text, #111827)', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none drop-shadow-sm mt-3">
            <p className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight">{users.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mt-1">Total</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl border border-white/60 dark:border-gray-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgb(37,99,235,0.1)] transition-all duration-300 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="flex flex-row items-center gap-3 pb-2 relative z-10 border-b border-white/30 dark:border-gray-700/30">
          <div className="p-2.5 bg-blue-100/50 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400 backdrop-blur-md shadow-sm border border-white/50 dark:border-blue-800/50"><TrendingUp className="h-4 w-4" /></div>
          <CardTitle className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">User Growth (30 Days)</CardTitle>
        </CardHeader>
        <CardContent className="h-64 relative z-10 p-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{fontSize: 10, fill: '#64748b'}} tickLine={false} axisLine={false} minTickGap={20} />
              <YAxis tick={{fontSize: 10, fill: '#64748b'}} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tooltip-bg, rgba(255,255,255,0.9))', color: 'var(--tooltip-text, #111827)' }}
                itemStyle={{ color: 'var(--tooltip-text, #111827)' }}
              />
              <Area type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" isAnimationActive={true} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
