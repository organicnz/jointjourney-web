import { useState } from "react"
import { UserData } from "@/components/crm/types"
import { useCRMAudit } from "./crm/useCRMAudit"
import { useCRMUsers } from "./crm/useCRMUsers"
import { useCRMFilters } from "./crm/useCRMFilters"
import { useCRMSelection } from "./crm/useCRMSelection"

export function useCRM(initialUsers: UserData[] = []) {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [loading] = useState(false) // Replaced with Server Components, so loading is mostly false initially

  // 1. Audit Logs
  const { auditLogs, logActivity } = useCRMAudit()

  // 2. Users Data & Mutations
  const { 
    users, setUsers, 
    selectedUser, setSelectedUser, 
    isSheetOpen, setIsSheetOpen, 
    notesValue, setNotesValue, 
    savingProfileId, 
    openUserProfile, handleDeleteUser, saveSkills, updateProfileStatus, saveProfileNotes, handleBulkStatusUpdate
  } = useCRMUsers(initialUsers, logActivity)

  // 3. Filters, Sorting & Pagination
  const {
    searchQuery, setSearchQuery,
    activeSegment, setActiveSegment,
    hasNotesFilter, setHasNotesFilter,
    sortConfig, setSortConfig, handleSort,
    currentPage, setCurrentPage,
    filteredAndSortedUsers, paginatedUsers, totalPages
  } = useCRMFilters(users)

  // 4. Selection
  const { selectedIds, setSelectedIds, toggleAll, toggleUser, selectAll } = useCRMSelection(paginatedUsers, filteredAndSortedUsers)

  // Derived Export Action
  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text)
  
  const exportToCSV = () => {
    const targetUsers = selectedIds.size > 0 ? users.filter(u => selectedIds.has(u.id)) : filteredAndSortedUsers
    if (targetUsers.length === 0) return
    const headers = ['ID', 'Email', 'Status', 'Joined', 'Last Sign In', 'Special Skills', 'CRM Notes']
    const rows = targetUsers.map(u => [
      u.id, u.email || '', u.status || '', new Date(u.created_at).toISOString(),
      u.last_sign_in_at ? new Date(u.last_sign_in_at).toISOString() : '',
      `"${(u.special_skills || '').replace(/"/g, '""')}"`,
      `"${(u.crm_notes || '').replace(/"/g, '""')}"`
    ])
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n")
    const link = document.createElement("a")
    link.setAttribute("href", encodeURI(csvContent))
    link.setAttribute("download", "jointjourney_crm_export.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    logActivity(`Exported ${targetUsers.length} users to CSV`)
  }

  // Wrapper functions for dependency injection
  const boundHandleDeleteUser = (id: string, e?: React.MouseEvent) => handleDeleteUser(id, setSelectedIds, e)
  const boundHandleBulkStatusUpdate = (newStatus: string | null) => handleBulkStatusUpdate(selectedIds, newStatus, setSelectedIds)

  return {
    state: {
      users, loading, viewMode, searchQuery, activeSegment, currentPage, totalPages,
      filteredAndSortedUsers, paginatedUsers, selectedIds,
      selectedUser, isSheetOpen, notesValue, savingProfileId, auditLogs,
      hasNotesFilter
    },
    actions: {
      setViewMode, setSearchQuery, setActiveSegment, setCurrentPage,
      toggleAll, toggleUser, selectAll, copyToClipboard, handleSort,
      handleDeleteUser: boundHandleDeleteUser, saveSkills, updateProfileStatus, saveProfileNotes, handleBulkStatusUpdate: boundHandleBulkStatusUpdate,
      openUserProfile, exportToCSV, setIsSheetOpen, setNotesValue, setSelectedIds, logActivity,
      setHasNotesFilter
    }
  }
}
