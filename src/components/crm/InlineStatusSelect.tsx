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
      <SelectTrigger className="h-8 w-[110px] text-xs font-medium border-transparent hover:border-gray-200 dark:hover:border-gray-700 bg-transparent hover:bg-white dark:hover:bg-gray-800 shadow-none focus:ring-0 transition-all rounded-md px-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusColor(status)}`} />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent className="rounded-xl border-gray-100 dark:border-gray-800 shadow-xl">
        <SelectItem value="Lead" className="text-xs font-medium">Lead</SelectItem>
        <SelectItem value="Active" className="text-xs font-medium">Active</SelectItem>
        <SelectItem value="VIP" className="text-xs font-medium">VIP</SelectItem>
        <SelectItem value="Banned" className="text-xs font-medium text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300">Banned</SelectItem>
      </SelectContent>
    </Select>
  )
}
