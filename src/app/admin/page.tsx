"use client"

import { useEffect, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getUsersAction, updateUserSkillsAction, deleteUserAction, updateUserProfileDetailsAction } from "./actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download, LayoutList, KanbanSquare } from "lucide-react"

// Import modular CRM components
import { CRMStatsCards } from "@/components/crm/CRMStatsCards"
import { CRMEmailComposer } from "@/components/crm/CRMEmailComposer"
import { CRMUserProfileSheet } from "@/components/crm/CRMUserProfileSheet"
import { CRMUserTable } from "@/components/crm/CRMUserTable"
import { CRMKanbanBoard } from "@/components/crm/CRMKanbanBoard"
import { UserData, SortConfig, Segment } from "@/components/crm/types"

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  
  // Search, Sort, Segment and Pagination states
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSegment, setActiveSegment] = useState<Segment>('All')
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Slide-out User Profile State
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [notesValue, setNotesValue] = useState("")
  const [savingProfileId, setSavingProfileId] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    getUsersAction()
      .then(data => { setUsers(data); setLoading(false) })
      .catch(err => { console.error(err); setLoading(false) })
  }

  // Filtering Logic
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

  // Actions
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
  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text)

  const handleDeleteUser = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!confirm("Are you sure you want to permanently delete this user?")) return
    try {
      await deleteUserAction(id)
      setUsers(prev => prev.filter(u => u.id !== id))
      setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next })
      if (selectedUser?.id === id) setIsSheetOpen(false)
    } catch (err: any) { alert("Failed to delete user.") }
  }

  const saveSkills = async (userId: string, skills: string) => {
    try {
      await updateUserSkillsAction(userId, skills)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, special_skills: skills } : u))
    } catch (err) { alert("Failed to save skills") }
  }

  const updateProfileStatus = async (userId: string, newStatus: string) => {
    try {
      await updateUserProfileDetailsAction(userId, { status: newStatus })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u))
      if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, status: newStatus })
    } catch (err) { alert("Failed to update status") }
  }

  const saveProfileNotes = async () => {
    if (!selectedUser) return
    setSavingProfileId(selectedUser.id)
    try {
      await updateUserProfileDetailsAction(selectedUser.id, { crm_notes: notesValue })
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, crm_notes: notesValue } : u))
      setSelectedUser({ ...selectedUser, crm_notes: notesValue })
    } catch (err) { alert("Failed to save notes") }
    finally { setSavingProfileId(null) }
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

  return (
    <div className="flex flex-col gap-8 pb-16 min-h-screen relative">
      
      {/* Liquid Glass Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 blur-3xl rounded-full mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-100/40 blur-3xl rounded-full mix-blend-multiply" />
      </div>

      <CRMStatsCards users={users} loading={loading} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main CRM Area */}
        <div className="xl:col-span-2 bg-white/70 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-xl shadow-blue-900/5 overflow-hidden flex flex-col min-h-[600px]">
          
          <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-gray-900">User Directory</h3>
              <p className="text-sm text-gray-500 mt-1 font-medium">Manage and segment your user base.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="bg-gray-100/80 p-1 rounded-xl flex items-center shadow-inner">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <LayoutList className="w-4 h-4" /> List
                </button>
                <button 
                  onClick={() => setViewMode('kanban')}
                  className={`p-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${viewMode === 'kanban' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <KanbanSquare className="w-4 h-4" /> Pipeline
                </button>
              </div>

              <div className="relative flex-1 w-full sm:w-56">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search..." 
                  className="pl-9 bg-white/80 border-gray-200/80 rounded-xl focus-visible:ring-blue-500/30 transition-all shadow-sm h-10"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                />
              </div>
              <Button variant="outline" className="rounded-xl h-10 shadow-sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </div>
          </div>

          {/* Quick Segments (Only show in List Mode) */}
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

          {/* View Container */}
          <div className="flex-1 bg-white/50 relative">
            <AnimatePresence mode="wait">
              {viewMode === 'list' ? (
                <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
                  <CRMUserTable 
                    users={users} loading={loading} paginatedUsers={paginatedUsers} 
                    selectedIds={selectedIds} toggleAll={toggleAll} toggleUser={toggleUser} 
                    handleSort={handleSort} openUserProfile={openUserProfile} copyToClipboard={copyToClipboard} 
                    handleDeleteUser={handleDeleteUser} saveSkills={saveSkills} currentPage={currentPage} 
                    setCurrentPage={setCurrentPage} totalPages={totalPages} filteredCount={filteredAndSortedUsers.length} 
                  />
                </motion.div>
              ) : (
                <motion.div key="kanban" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
                  <CRMKanbanBoard 
                    users={users} 
                    updateProfileStatus={updateProfileStatus}
                    openUserProfile={openUserProfile}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <CRMEmailComposer selectedIds={selectedIds} onSent={() => setSelectedIds(new Set())} />

      </div>

      <CRMUserProfileSheet 
        selectedUser={selectedUser} isSheetOpen={isSheetOpen} setIsSheetOpen={setIsSheetOpen}
        notesValue={notesValue} setNotesValue={setNotesValue} savingProfileId={savingProfileId}
        updateProfileStatus={updateProfileStatus} saveProfileNotes={saveProfileNotes}
        setSelectedIds={setSelectedIds} handleDeleteUser={handleDeleteUser}
      />
    </div>
  )
}
