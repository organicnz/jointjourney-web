import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function getStatusColor(status?: string) {
  switch (status) {
    case 'VIP': return 'bg-purple-500'
    case 'Active': return 'bg-emerald-500'
    case 'Banned': return 'bg-red-500'
    default: return 'bg-gray-400'
  }
}

interface InlineStatusSelectProps {
  status: string
  onStatusChange: (newStatus: string) => void
}

export function InlineStatusSelect({ status, onStatusChange }: InlineStatusSelectProps) {
  return (
    <Select value={status || 'Lead'} onValueChange={(val) => { if (val) onStatusChange(val) }}>
      <SelectTrigger className="h-8 w-[110px] text-xs font-medium border-transparent hover:border-white/50 dark:hover:border-gray-700/50 bg-transparent hover:bg-white/40 dark:hover:bg-gray-800/40 hover:backdrop-blur-md hover:shadow-sm focus:ring-0 transition-all rounded-lg px-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(status)} shadow-sm`} />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent className="rounded-xl border-white/40 dark:border-gray-800 backdrop-blur-3xl bg-white/80 dark:bg-gray-900/80 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <SelectItem value="Lead" className="text-xs font-semibold rounded-lg focus:bg-gray-100/80 dark:focus:bg-gray-800/80">Lead</SelectItem>
        <SelectItem value="Active" className="text-xs font-semibold rounded-lg focus:bg-gray-100/80 dark:focus:bg-gray-800/80">Active</SelectItem>
        <SelectItem value="VIP" className="text-xs font-semibold rounded-lg focus:bg-gray-100/80 dark:focus:bg-gray-800/80">VIP</SelectItem>
        <SelectItem value="Banned" className="text-xs font-semibold text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 rounded-lg focus:bg-red-50/80 dark:focus:bg-red-900/30">Banned</SelectItem>
      </SelectContent>
    </Select>
  )
}
