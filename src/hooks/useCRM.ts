import { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { getUsersAction, updateUserSkillsAction, deleteUserAction, updateUserProfileDetailsAction, bulkUpdateUserStatusAction } from "@/app/admin/actions"
import { UserData, SortConfig, Segment } from "@/components/crm/types"

export function useCRM() {
  const [users, setUsers] = useState<UserData[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSegment, setActiveSegment] = useState<Segment>('All')
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [notesValue, setNotesValue] = useState("")
  const [savingProfileId, setSavingProfileId] = useState<string | null>(null)

  useEffect(() => {
    getUsersAction()
      .then(data => { setUsers(data); setLoading(false) })
      .catch(err => { console.error(err); setLoading(false) })
  }, [])

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users]
    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30))
    
    if (activeSegment === 'New Signups') result = result.filter(u => new Date(u.created_at) > thirtyDaysAgo)
    if (activeSegment === 'Active') result = result.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > thirtyDaysAgo)
    if (activeSegment === 'VIPs') result = result.filter(u => u.status === 'VIP')
    if (activeSegment === 'Leads') result = result.filter(u => !u.status || u.status === 'Lead')
    if (activeSegment === 'Banned') result = result.filter(u => u.status === 'Banned')

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(u => 
        u.email?.toLowerCase().includes(q) || 
        u.special_skills?.toLowerCase().includes(q) ||
        u.status?.toLowerCase().includes(q)
      )
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key] || ""
        const valB = b[sortConfig.key] || ""
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return result
  }, [users, searchQuery, activeSegment, sortConfig])

  const itemsPerPage = 10
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedUsers.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedUsers, currentPage])
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)

  const handleSort = (key: keyof UserData) => {
    setSortConfig(current => {
      if (current?.key === key) return current.direction === 'asc' ? { key, direction: 'desc' } : null
      return { key, direction: 'asc' }
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === paginatedUsers.length) setSelectedIds(new Set())
    else setSelectedIds(new Set(paginatedUsers.map(u => u.id)))
  }
  const toggleUser = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }
  const selectAll = () => setSelectedIds(new Set(filteredAndSortedUsers.map(u => u.id)))
  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text)

  const handleDeleteUser = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!confirm("Are you sure you want to permanently delete this user?")) return
    try {
      await deleteUserAction(id)
      setUsers(prev => prev.filter(u => u.id !== id))
      setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next })
      if (selectedUser?.id === id) setIsSheetOpen(false)
      toast.success("User deleted successfully")
    } catch (err: any) { toast.error("Failed to delete user") }
  }

  const saveSkills = async (userId: string, skills: string) => {
    try {
      await updateUserSkillsAction(userId, skills)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, special_skills: skills } : u))
      toast.success("Skills updated")
    } catch (err) { toast.error("Failed to save skills") }
  }

  const updateProfileStatus = async (userId: string, newStatus: string) => {
    try {
      await updateUserProfileDetailsAction(userId, { status: newStatus })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u))
      if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, status: newStatus })
      toast.success(`Status changed to ${newStatus}`)
    } catch (err) { toast.error("Failed to update status") }
  }

  const saveProfileNotes = async () => {
    if (!selectedUser) return
    setSavingProfileId(selectedUser.id)
    try {
      await updateUserProfileDetailsAction(selectedUser.id, { crm_notes: notesValue })
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, crm_notes: notesValue } : u))
      setSelectedUser({ ...selectedUser, crm_notes: notesValue })
      toast.success("Notes auto-saved")
    } catch (err) { toast.error("Failed to save notes") }
    finally { setSavingProfileId(null) }
  }

  const handleBulkStatusUpdate = async (newStatus: string | null) => {
    if (!newStatus || selectedIds.size === 0) return
    try {
      await bulkUpdateUserStatusAction(Array.from(selectedIds), newStatus)
      setUsers(prev => prev.map(u => selectedIds.has(u.id) ? { ...u, status: newStatus } : u))
      toast.success(`Successfully updated ${selectedIds.size} users to ${newStatus}`)
      setSelectedIds(new Set())
    } catch (err) {
      toast.error("Failed to update user statuses")
    }
  }

  const openUserProfile = (user: UserData) => {
    setSelectedUser(user)
    setNotesValue(user.crm_notes || "")
    setIsSheetOpen(true)
  }

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
  }

  return {
    state: {
      users, loading, viewMode, searchQuery, activeSegment, currentPage, totalPages,
      filteredAndSortedUsers, paginatedUsers, selectedIds,
      selectedUser, isSheetOpen, notesValue, savingProfileId
    },
    actions: {
      setViewMode, setSearchQuery, setActiveSegment, setCurrentPage,
      toggleAll, toggleUser, selectAll, copyToClipboard, handleSort,
      handleDeleteUser, saveSkills, updateProfileStatus, saveProfileNotes, handleBulkStatusUpdate,
      openUserProfile, exportToCSV, setIsSheetOpen, setNotesValue, setSelectedIds
    }
  }
}
