"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download, LayoutList, KanbanSquare, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Segment } from "./types"

export function CRMToolbar({
  viewMode, setViewMode,
  searchQuery, setSearchQuery, setCurrentPage,
  exportToCSV, selectedIdsCount, handleBulkStatusUpdate,
  activeSegment, setActiveSegment,
  hasNotesFilter, setHasNotesFilter,
  statusFilters, setStatusFilters,
  skillsFilters, setSkillsFilters
}: {
  viewMode: 'list' | 'kanban'
  setViewMode: (mode: 'list' | 'kanban') => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  setCurrentPage: (p: number) => void
  exportToCSV: () => void
  selectedIdsCount: number
  handleBulkStatusUpdate: (s: string | null) => void
  activeSegment: Segment
  setActiveSegment: (s: Segment) => void
  hasNotesFilter: boolean | null
  setHasNotesFilter: (b: boolean | null) => void
  statusFilters: string[]
  setStatusFilters: (s: string[]) => void
  skillsFilters: string[]
  setSkillsFilters: (s: string[]) => void
}) {
  
  return (
    <>
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">User Directory</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Manage and segment your user base.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="bg-gray-100/50 dark:bg-gray-800/50 p-1.5 rounded-2xl flex items-center shadow-inner backdrop-blur-md border border-white/40 dark:border-gray-700/50">
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2.5 px-4 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md shadow-black/5 scale-105' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
            >
              <LayoutList className="w-4 h-4" /> List
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-2.5 px-4 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 ${viewMode === 'kanban' ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md shadow-black/5 scale-105' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
            >
              <KanbanSquare className="w-4 h-4" /> Pipeline
            </button>
          </div>

          <div className="relative flex-1 w-full sm:w-64 flex items-center gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <Input 
                placeholder="Search directory..." 
                className="pl-10 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-white/80 dark:border-gray-700/80 rounded-2xl focus-visible:ring-2 focus-visible:ring-blue-500/50 transition-all shadow-[0_4px_20px_rgb(0,0,0,0.03)] h-10 font-medium"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger className={`inline-flex items-center justify-center rounded-xl h-10 w-10 p-0 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${hasNotesFilter !== null ? 'bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400' : 'bg-transparent border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <Filter className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuCheckboxItem 
                  checked={hasNotesFilter === true} 
                  onCheckedChange={(c) => { setHasNotesFilter(c ? true : null); setCurrentPage(1) }}
                >
                  Has Notes
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={hasNotesFilter === false} 
                  onCheckedChange={(c) => { setHasNotesFilter(c ? false : null); setCurrentPage(1) }}
                >
                  No Notes
                </DropdownMenuCheckboxItem>
                
                <div className="my-2 border-t border-gray-100 dark:border-gray-800" />
                <div className="px-2 py-1.5 text-sm font-semibold text-gray-500">Filter by Status</div>
                {['Lead', 'Active', 'VIP', 'Inactive', 'Banned'].map(status => (
                  <DropdownMenuCheckboxItem 
                    key={status}
                    checked={statusFilters.includes(status)}
                    onCheckedChange={(c) => {
                      if (c) setStatusFilters([...statusFilters, status])
                      else setStatusFilters(statusFilters.filter(s => s !== status))
                      setCurrentPage(1)
                    }}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Skills Filter Input */}
            <div className="relative w-32 hidden md:block">
              <Input 
                placeholder="Skill..." 
                className="bg-white/80 dark:bg-gray-800/80 border-gray-200/80 dark:border-gray-700 rounded-xl focus-visible:ring-blue-500/30 transition-all shadow-sm h-10 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    const val = e.currentTarget.value.trim()
                    if (val && !skillsFilters.includes(val)) {
                      setSkillsFilters([...skillsFilters, val])
                      e.currentTarget.value = ''
                      setCurrentPage(1)
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Active Skill Badges */}
          {skillsFilters.length > 0 && (
            <div className="flex gap-2 items-center mr-2">
              {skillsFilters.map(skill => (
                <span key={skill} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs rounded-lg flex items-center gap-1 font-medium">
                  {skill}
                  <button onClick={() => {
                    setSkillsFilters(skillsFilters.filter(s => s !== skill))
                    setCurrentPage(1)
                  }} className="hover:text-blue-900 dark:hover:text-blue-100">&times;</button>
                </span>
              ))}
            </div>
          )}

          {selectedIdsCount > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-shrink-0">
              <Select onValueChange={handleBulkStatusUpdate}>
                <SelectTrigger className="h-10 bg-blue-50 border-blue-200 text-blue-700 w-36 shadow-sm font-semibold rounded-xl">
                  <SelectValue placeholder="Bulk Action" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-gray-100">
                  <SelectItem value="Lead">Mark as Lead</SelectItem>
                  <SelectItem value="Active">Mark as Active</SelectItem>
                  <SelectItem value="VIP">Mark as VIP</SelectItem>
                  <SelectItem value="Inactive">Mark as Inactive</SelectItem>
                  <SelectItem value="Banned" className="text-red-600">Ban Users</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          )}

          <Button variant="outline" className="rounded-xl h-10 shadow-sm dark:bg-gray-800 dark:border-gray-700" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>

        </div>
      </div>

      <AnimatePresence>
        {viewMode === 'list' && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="bg-gray-50/50 px-6 py-3 border-b border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar"
          >
            {['All', 'New Signups', 'Active', 'VIPs', 'Leads', 'Banned'].map(seg => (
              <button 
                key={seg}
                onClick={() => { setActiveSegment(seg as Segment); setCurrentPage(1) }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeSegment === seg 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-sm'
                }`}
              >
                {seg}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
