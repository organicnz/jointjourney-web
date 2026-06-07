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
      className="bg-white/90 dark:bg-gray-900/90 backdrop-blur border border-gray-100 dark:border-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-shadow mb-3 group"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/20 border border-blue-100 dark:border-blue-800 flex items-center justify-center flex-shrink-0">
          <span className="text-blue-700 dark:text-blue-400 font-bold text-xs uppercase">{user.email?.charAt(0) || '?'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate" title={user.email}>{user.email}</p>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger className="p-1 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none">
              <MoreVertical className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl dark:border-gray-800">
              <DropdownMenuItem onClick={() => onClick(user)} className="cursor-pointer dark:focus:bg-gray-800">
                <ExternalLink className="w-4 h-4 mr-2" /> View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = `mailto:${user.email}`} className="cursor-pointer dark:focus:bg-gray-800">
                <Mail className="w-4 h-4 mr-2" /> Email User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {user.special_skills && (
        <div className="mt-3">
          <CRMBadgeList tagsString={user.special_skills} />
        </div>
      )}
      
      <div className="mt-3 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
        <div className="flex items-center gap-1" title="Joined">
          <Clock className="w-3 h-3" />
          {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </div>
        {user.crm_notes && (
          <div className="flex items-center gap-1 text-blue-500" title="Has notes">
            <Mail className="w-3 h-3" /> Note
          </div>
        )}
      </div>
    </div>
  )
}

// --- COLUMN COMPONENT ---
function KanbanColumn({ id, title, users, openUserProfile }: { id: string, title: string, users: UserData[], openUserProfile: (u: UserData) => void }) {
  return (
    <div className="flex flex-col flex-1 min-w-[280px] max-w-[320px] bg-gray-50/50 dark:bg-gray-900/30 backdrop-blur-xl border border-white/50 dark:border-gray-800/50 rounded-2xl p-4 shadow-sm h-[70vh] overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-sm">{title}</h3>
        <span className="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-bold px-2 py-1 rounded-md shadow-sm border border-gray-100 dark:border-gray-700">{users.length}</span>
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
            <div className="bg-white/90 backdrop-blur border border-blue-500 p-4 rounded-xl shadow-2xl opacity-90 rotate-2 scale-105">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-700 font-bold text-xs uppercase">{activeUser.email?.charAt(0) || '?'}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 truncate">{activeUser.email}</p>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
