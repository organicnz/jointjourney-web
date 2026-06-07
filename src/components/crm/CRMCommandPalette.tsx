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
import { User, Mail, Download, LayoutList, KanbanSquare, CheckCircle2, ShieldAlert } from "lucide-react"

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
  selectAll: () => void
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
      <p className="text-sm text-gray-500 hidden xl:flex items-center gap-1 bg-white/50 px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
        Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100"><span className="text-xs">⌘</span>K</kbd> for command palette
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

          <CommandSeparator />

          <CommandGroup heading="Views">
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
