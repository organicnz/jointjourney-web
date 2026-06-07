"use client"

import { useEffect, useState } from "react"
import { 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList, 
  CommandSeparator,
  CommandShortcut
} from "@/components/ui/command"
import { UserData } from "./types"
import { User, Mail, Download, LayoutList, KanbanSquare, CheckCircle2, LayoutDashboard, Activity, Users } from "lucide-react"

export function CRMCommandPalette({
  users,
  openUserProfile,
  exportToCSV,
  setViewMode,
  selectAll
}: {
  users: UserData[],
  openUserProfile: (user: UserData) => void,
  exportToCSV: () => void,
  setViewMode: (mode: 'list' | 'kanban') => void,
  selectAll: () => void,
  setActiveTab: (tab: 'overview' | 'contacts' | 'campaigns' | 'activity') => void
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 hidden xl:flex items-center gap-1.5 bg-white/40 dark:bg-gray-900/40 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/60 dark:border-gray-800/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-colors hover:bg-white/60 dark:hover:bg-gray-800/60">
        Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-1.5 font-mono text-[10px] font-bold text-gray-600 dark:text-gray-300 shadow-sm"><span className="text-xs">⌘</span>K</kbd> for command palette
      </p>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search users..." />
        <CommandList className="no-scrollbar">
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Users">
            {users.slice(0, 5).map(user => (
              <CommandItem 
                key={user.id} 
                onSelect={() => {
                  openUserProfile(user)
                  setOpen(false)
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <User className="h-4 w-4 text-gray-400" />
                <span>{user.email}</span>
                {user.status && <span className="ml-auto text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">{user.status}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => { exportToCSV(); setOpen(false) }} className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              <span>Export Directory to CSV</span>
            </CommandItem>
            <CommandItem onSelect={() => { selectAll(); setOpen(false) }} className="cursor-pointer">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              <span>Select All Users (for Broadcast)</span>
            </CommandItem>
          </CommandGroup>

          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => { setActiveTab('overview'); setOpen(false) }} className="cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Go to Overview</span>
            </CommandItem>
            <CommandItem onSelect={() => { setActiveTab('contacts'); setOpen(false) }} className="cursor-pointer">
              <Users className="mr-2 h-4 w-4" />
              <span>Go to Contacts & Pipeline</span>
            </CommandItem>
            <CommandItem onSelect={() => { setActiveTab('campaigns'); setOpen(false) }} className="cursor-pointer">
              <Mail className="mr-2 h-4 w-4" />
              <span>Go to Campaigns</span>
            </CommandItem>
            <CommandItem onSelect={() => { setActiveTab('activity'); setOpen(false) }} className="cursor-pointer">
              <Activity className="mr-2 h-4 w-4" />
              <span>Go to Activity Logs</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Views (Contacts)">
            <CommandItem onSelect={() => { setViewMode('list'); setOpen(false) }} className="cursor-pointer">
              <LayoutList className="mr-2 h-4 w-4" />
              <span>Switch to List View</span>
            </CommandItem>
            <CommandItem onSelect={() => { setViewMode('kanban'); setOpen(false) }} className="cursor-pointer">
              <KanbanSquare className="mr-2 h-4 w-4" />
              <span>Switch to Pipeline Kanban</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
