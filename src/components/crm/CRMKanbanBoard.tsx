"use client"

import { useState } from "react"
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { UserData } from "./types"
import { Mail, Clock, MoreVertical, ExternalLink } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { CRMBadgeList } from "./CRMBadge"

// --- SORTABLE CARD COMPONENT ---
function SortableUserCard({ user, onClick }: { user: UserData, onClick: (u: UserData) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: user.id, data: user })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(user)}
      className="bg-white/40 dark:bg-gray-800/40 hover:bg-white/70 dark:hover:bg-gray-800/70 backdrop-blur-xl border border-white/60 dark:border-gray-700/60 p-4 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(37,99,235,0.08)] cursor-grab active:cursor-grabbing transition-all duration-300 mb-3 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex items-center gap-2 mb-2 relative z-10">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/20 border border-white dark:border-gray-700 flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-blue-700 dark:text-blue-400 font-bold text-xs uppercase">{user.email?.charAt(0) || '?'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate tracking-tight" title={user.email}>{user.email}</p>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger className="p-1 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors focus:outline-none">
              <MoreVertical className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl dark:border-gray-800 shadow-xl backdrop-blur-md bg-white/90 dark:bg-gray-900/90">
              <DropdownMenuItem onClick={() => onClick(user)} className="cursor-pointer dark:focus:bg-gray-800 rounded-lg">
                <ExternalLink className="w-4 h-4 mr-2" /> View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = `mailto:${user.email}`} className="cursor-pointer dark:focus:bg-gray-800 rounded-lg">
                <Mail className="w-4 h-4 mr-2" /> Email User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {user.special_skills && (
        <div className="mt-3 relative z-10">
          <CRMBadgeList tagsString={user.special_skills} />
        </div>
      )}
      
      <div className="mt-3 flex items-center justify-between text-xs font-medium text-gray-400 dark:text-gray-500 relative z-10">
        <div className="flex items-center gap-1" title="Joined">
          <Clock className="w-3.5 h-3.5" />
          {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>
        {user.crm_notes && (
          <div className="flex items-center gap-1 text-blue-500" title="Has notes">
            <Mail className="w-3.5 h-3.5" /> Note
          </div>
        )}
      </div>
    </div>
  )
}

// --- COLUMN COMPONENT ---
function KanbanColumn({ id, title, users, openUserProfile }: { id: string, title: string, users: UserData[], openUserProfile: (u: UserData) => void }) {
  return (
    <div className="flex flex-col flex-1 min-w-[280px] max-w-[320px] bg-white/20 dark:bg-gray-900/20 backdrop-blur-2xl border border-white/40 dark:border-gray-700/40 rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)] h-[70vh] overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest text-xs">{title}</h3>
        <span className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md text-gray-600 dark:text-gray-300 text-xs font-extrabold px-2.5 py-1 rounded-lg shadow-sm border border-white/50 dark:border-gray-700/50">{users.length}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto no-scrollbar pb-10 px-1">
        <SortableContext id={id} items={users.map(u => u.id)} strategy={verticalListSortingStrategy}>
          {users.map(user => (
            <SortableUserCard key={user.id} user={user} onClick={openUserProfile} />
          ))}
        </SortableContext>
        {users.length === 0 && (
          <div className="h-full flex items-center justify-center text-center p-4 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
            <p className="text-sm text-gray-400 dark:text-gray-600 font-medium">Drop users here</p>
          </div>
        )}
      </div>
    </div>
  )
}

// --- MAIN BOARD COMPONENT ---
export function CRMKanbanBoard({
  users,
  updateProfileStatus,
  openUserProfile
}: {
  users: UserData[],
  updateProfileStatus: (userId: string, newStatus: string) => Promise<void>,
  openUserProfile: (user: UserData) => void
}) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const COLUMNS = ['Lead', 'Active', 'VIP', 'Inactive', 'Banned']

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const activeUserId = active.id as string
    const overId = over.id as string

    // If dropped on a column or another item in a different column
    // For simplicity, we just trigger an immediate status update when dropped into a new context
    const activeUser = users.find(u => u.id === activeUserId)
    if (!activeUser) return

    const activeContainer = activeUser.status || 'Lead'
    
    // Find the target container (either a column ID directly, or the status of the hovered user)
    let overContainer = overId
    const overUser = users.find(u => u.id === overId)
    if (overUser) {
      overContainer = overUser.status || 'Lead'
    }

    if (activeContainer !== overContainer && COLUMNS.includes(overContainer)) {
      // Optimistically trigger update, the parent state handles the visual move
      updateProfileStatus(activeUserId, overContainer)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
  }

  const activeUser = activeId ? users.find(u => u.id === activeId) : null

  return (
    <div className="flex gap-6 overflow-x-auto pb-8 pt-4 px-2 no-scrollbar">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {COLUMNS.map(col => (
          <KanbanColumn 
            key={col} 
            id={col} 
            title={col} 
            users={users.filter(u => (u.status || 'Lead') === col)} 
            openUserProfile={openUserProfile}
          />
        ))}

        <DragOverlay>
          {activeUser ? (
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-3xl border border-blue-400 dark:border-blue-500 p-4 rounded-2xl shadow-[0_20px_60px_rgb(37,99,235,0.2)] opacity-100 rotate-3 scale-105 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center border border-white dark:border-gray-700 shadow-sm">
                  <span className="text-blue-700 dark:text-blue-400 font-bold text-xs uppercase">{activeUser.email?.charAt(0) || '?'}</span>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate tracking-tight">{activeUser.email}</p>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
