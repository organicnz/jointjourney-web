"use client"

import { useEffect, useState, useMemo } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { getUsersAction, sendAdminEmailAction, updateUserSkillsAction, deleteUserAction, updateUserProfileDetailsAction } from "./actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Mail, Send, Search, Download, ArrowUpDown, Edit2, Check, X, Copy, Trash2, Users, UserPlus, Activity, User, UsersRound, Ghost } from "lucide-react"

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
import "react-quill/dist/quill.snow.css"

type UserData = { 
  id: string, 
  email?: string, 
  created_at: string, 
  last_sign_in_at?: string, 
  special_skills?: string,
  status?: string,
  crm_notes?: string
}
type SortConfig = { key: keyof UserData; direction: 'asc' | 'desc' } | null
type Segment = 'All' | 'New Signups' | 'Active' | 'VIPs' | 'Leads' | 'Banned'

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  
  // Search, Sort, Segment and Pagination states
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSegment, setActiveSegment] = useState<Segment>('All')
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Slide-out User Profile State
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [notesValue, setNotesValue] = useState("")
  const [savingProfileId, setSavingProfileId] = useState<string | null>(null)

  // Inline Editing State (Skills)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editSkillsValue, setEditSkillsValue] = useState("")
  const [savingSkillsId, setSavingSkillsId] = useState<string | null>(null)

  // Email State
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = () => {
    getUsersAction()
      .then(data => {
        setUsers(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setFeedback({ type: 'error', text: "Failed to load users" })
        setLoading(false)
      })
  }

  // Analytics Metrics Calculation
  const metrics = useMemo(() => {
    const total = users.length
    const now = new Date()
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
    
    const newSignups = users.filter(u => new Date(u.created_at) > thirtyDaysAgo).length
    const activeRecently = users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > thirtyDaysAgo).length

    return { total, newSignups, activeRecently }
  }, [users])

  // Generate fake sparkline data for UI demo based on real user count
  const sparklineData = useMemo(() => {
    return Array.from({length: 10}, (_, i) => ({
      value: Math.floor(Math.random() * 10) + (metrics.total / 10 * i)
    }))
  }, [metrics.total])

  // Memoized Filtering, Sorting, and Pagination
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users]

    // Apply Segment Filter
    const now = new Date()
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
    
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

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAndSortedUsers.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAndSortedUsers, currentPage])

  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)

  const handleSort = (key: keyof UserData) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' ? { key, direction: 'desc' } : null
      }
      return { key, direction: 'asc' }
    })
  }

  const exportToCSV = () => {
    const targetUsers = selectedIds.size > 0 ? users.filter(u => selectedIds.has(u.id)) : filteredAndSortedUsers
    if (targetUsers.length === 0) return

    const headers = ['ID', 'Email', 'Status', 'Joined', 'Last Sign In', 'Special Skills', 'CRM Notes']
    const rows = targetUsers.map(u => [
      u.id, 
      u.email || '', 
      u.status || '',
      new Date(u.created_at).toISOString(), 
      u.last_sign_in_at ? new Date(u.last_sign_in_at).toISOString() : '',
      `"${(u.special_skills || '').replace(/"/g, '""')}"`,
      `"${(u.crm_notes || '').replace(/"/g, '""')}"`
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "jointjourney_crm_export.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const toggleAll = () => {
    if (selectedIds.size === paginatedUsers.length) {
      setSelectedIds(new Set())
    } else {
      const newSelected = new Set(selectedIds)
      paginatedUsers.forEach(u => newSelected.add(u.id))
      setSelectedIds(newSelected)
    }
  }

  const toggleUser = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleDeleteUser = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!confirm("Are you sure you want to permanently delete this user?")) return
    
    try {
      await deleteUserAction(id)
      setUsers(prev => prev.filter(u => u.id !== id))
      setSelectedIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      if (selectedUser?.id === id) setIsSheetOpen(false)
      setFeedback({ type: 'success', text: "User successfully deleted." })
    } catch (err: any) {
      setFeedback({ type: 'error', text: "Failed to delete user." })
    }
  }

  const startEditingSkills = (user: UserData) => {
    setEditingUserId(user.id)
    setEditSkillsValue(user.special_skills || "")
  }

  const saveSkills = async (userId: string) => {
    setSavingSkillsId(userId)
    try {
      await updateUserSkillsAction(userId, editSkillsValue)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, special_skills: editSkillsValue } : u))
      setEditingUserId(null)
    } catch (err) {
      console.error(err)
      setFeedback({ type: 'error', text: "Failed to update user skills." })
    } finally {
      setSavingSkillsId(null)
    }
  }

  const updateProfileStatus = async (userId: string, newStatus: string) => {
    try {
      await updateUserProfileDetailsAction(userId, { status: newStatus })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u))
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, status: newStatus })
      }
    } catch (err) {
      console.error(err)
      alert("Failed to update status")
    }
  }

  const saveProfileNotes = async () => {
    if (!selectedUser) return
    setSavingProfileId(selectedUser.id)
    try {
      await updateUserProfileDetailsAction(selectedUser.id, { crm_notes: notesValue })
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, crm_notes: notesValue } : u))
      setSelectedUser({ ...selectedUser, crm_notes: notesValue })
    } catch (err) {
      console.error(err)
      alert("Failed to save notes")
    } finally {
      setSavingProfileId(null)
    }
  }

  const openUserProfile = (user: UserData) => {
    setSelectedUser(user)
    setNotesValue(user.crm_notes || "")
    setIsSheetOpen(true)
  }

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedIds.size === 0) {
      setFeedback({ type: 'error', text: "Please select at least one user." })
      return
    }
    if (!subject || !message || message === '<p><br></p>') {
      setFeedback({ type: 'error', text: "Subject and message are required." })
      return
    }

    setSending(true)
    setFeedback(null)
    
    try {
      const res = await sendAdminEmailAction(Array.from(selectedIds), subject, message)
      setFeedback({ type: 'success', text: `Successfully sent email to ${res.count} users!` })
      setSubject("")
      setMessage("")
      setSelectedIds(new Set())
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || "Failed to send email." })
    } finally {
      setSending(false)
    }
  }

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'clean']
    ],
  }

  const getStatusBadgeVariant = (status: string) => {
    switch(status.toLowerCase()) {
      case 'active': return 'default'
      case 'vip': return 'secondary'
      case 'banned': return 'destructive'
      case 'inactive': return 'outline'
      default: return 'outline' // Lead
    }
  }

  const MotionTableRow = motion(TableRow)

  return (
    <div className="flex flex-col gap-8 pb-16 min-h-screen relative">
      
      {/* Liquid Glass Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 blur-3xl rounded-full mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-100/40 blur-3xl rounded-full mix-blend-multiply" />
      </div>

      {/* Analytics KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/60 backdrop-blur-2xl border-white/50 shadow-lg shadow-blue-900/5 hover:shadow-blue-900/10 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Users</CardTitle>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Users className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold text-gray-900">{loading ? '-' : metrics.total}</div>
            <p className="text-sm text-gray-500 mt-2 font-medium">All time registered accounts</p>
            <div className="absolute bottom-2 right-4 w-24 h-12 opacity-30 pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 backdrop-blur-2xl border-white/50 shadow-lg shadow-blue-900/5 hover:shadow-blue-900/10 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">New Signups</CardTitle>
            <div className="p-2 bg-green-50 rounded-xl text-green-600"><UserPlus className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold text-gray-900">{loading ? '-' : metrics.newSignups}</div>
            <p className="text-sm text-gray-500 mt-2 font-medium">Users joined in last 30 days</p>
            <div className="absolute bottom-2 right-4 w-24 h-12 opacity-30 pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/60 backdrop-blur-2xl border-white/50 shadow-lg shadow-blue-900/5 hover:shadow-blue-900/10 transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Users</CardTitle>
            <div className="p-2 bg-purple-50 rounded-xl text-purple-600"><Activity className="h-4 w-4" /></div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold text-gray-900">{loading ? '-' : metrics.activeRecently}</div>
            <p className="text-sm text-gray-500 mt-2 font-medium">Signed in during last 30 days</p>
            <div className="absolute bottom-2 right-4 w-24 h-12 opacity-30 pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line type="monotone" dataKey="value" stroke="#9333ea" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Users Table */}
        <div className="xl:col-span-2 bg-white/70 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-xl shadow-blue-900/5 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-gray-900">User Directory</h3>
              <p className="text-sm text-gray-500 mt-1 font-medium">Manage and segment your user base.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <div className="relative flex-1 w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search directory..." 
                  className="pl-9 bg-white/80 border-gray-200/80 rounded-xl focus-visible:ring-blue-500/30 transition-all shadow-sm h-10"
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                />
              </div>
              <Button variant="outline" className="rounded-xl h-10 w-full sm:w-auto shadow-sm" onClick={exportToCSV} title="Export CSV">
                <Download className="h-4 w-4 mr-2 text-gray-600" /> Export
              </Button>
            </div>
          </div>

          {/* Quick Segments */}
          <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {['All', 'New Signups', 'Active', 'VIPs', 'Leads', 'Banned'].map(seg => (
              <button 
                key={seg}
                onClick={() => {
                  setActiveSegment(seg as Segment)
                  setCurrentPage(1)
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeSegment === seg 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-sm'
                }`}
              >
                {seg}
              </button>
            ))}
          </div>
          
          <div className="overflow-x-auto flex-1">
            <Table>
              <TableHeader className="bg-gray-50/30">
                <TableRow className="hover:bg-transparent border-gray-100">
                  <TableHead className="w-14 text-center">
                    <Checkbox 
                      checked={paginatedUsers.length > 0 && paginatedUsers.every(u => selectedIds.has(u.id))}
                      onCheckedChange={toggleAll}
                      className="rounded-md border-gray-300"
                    />
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-blue-600 transition-colors py-4" onClick={() => handleSort('email')}>
                    <div className="flex items-center gap-2 font-semibold">User <ArrowUpDown className="h-3 w-3" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-blue-600 transition-colors py-4" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-2 font-semibold">Status <ArrowUpDown className="h-3 w-3" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-blue-600 transition-colors py-4" onClick={() => handleSort('special_skills')}>
                    <div className="flex items-center gap-2 font-semibold">Special Skills <ArrowUpDown className="h-3 w-3" /></div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-blue-600 transition-colors py-4" onClick={() => handleSort('created_at')}>
                    <div className="flex items-center gap-2 font-semibold">Joined <ArrowUpDown className="h-3 w-3" /></div>
                  </TableHead>
                  <TableHead className="w-16 text-right font-semibold py-4">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {loading ? (
                    <MotionTableRow exit={{ opacity: 0 }}>
                      <TableCell colSpan={6} className="h-64">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-500" />
                          <p className="font-medium">Loading user directory...</p>
                        </div>
                      </TableCell>
                    </MotionTableRow>
                  ) : paginatedUsers.length === 0 ? (
                    <MotionTableRow 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <TableCell colSpan={6} className="h-64">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                            <Ghost className="h-8 w-8 text-gray-300" />
                          </div>
                          <p className="font-semibold text-gray-900 mb-1">No users found</p>
                          <p className="text-sm">Try adjusting your segment or search query.</p>
                        </div>
                      </TableCell>
                    </MotionTableRow>
                  ) : (
                    paginatedUsers.map((user, index) => (
                      <MotionTableRow 
                        key={user.id} 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className="cursor-pointer group hover:bg-blue-50/40 transition-colors border-gray-100" 
                        onClick={() => openUserProfile(user)}
                      >
                        <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                          <Checkbox 
                            checked={selectedIds.has(user.id)}
                            onCheckedChange={() => toggleUser(user.id)}
                            className="rounded-md border-gray-300"
                          />
                        </TableCell>
                        <TableCell className="font-medium max-w-[180px] truncate" title={user.email}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-700 font-bold text-xs uppercase">{user.email?.charAt(0) || '?'}</span>
                            </div>
                            <span className="truncate">{user.email || 'No email'}</span>
                            {user.email && (
                              <button onClick={(e) => { e.stopPropagation(); copyToClipboard(user.email!) }} className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" title="Copy Email">
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(user.status || 'Lead')} className="pointer-events-none capitalize shadow-sm">
                            {user.status || 'Lead'}
                          </Badge>
                        </TableCell>

                        <TableCell className="min-w-[150px]" onClick={(e) => e.stopPropagation()}>
                          {editingUserId === user.id ? (
                            <div className="flex items-center gap-2">
                              <Input 
                                autoFocus
                                value={editSkillsValue}
                                onChange={(e) => setEditSkillsValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveSkills(user.id)
                                  if (e.key === 'Escape') setEditingUserId(null)
                                }}
                                className="h-8 text-sm rounded-lg"
                                placeholder="e.g. React, Marketing"
                                disabled={savingSkillsId === user.id}
                              />
                              {savingSkillsId === user.id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                              ) : (
                                <>
                                  <button onClick={() => saveSkills(user.id)} className="text-green-600 hover:text-green-700 bg-green-50 p-1.5 rounded-md">
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button onClick={() => setEditingUserId(null)} className="text-gray-500 hover:text-gray-700 bg-gray-100 p-1.5 rounded-md">
                                    <X className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          ) : (
                            <div 
                              className="flex items-center justify-between px-3 py-1.5 -mx-3 rounded-lg hover:bg-gray-100/80 cursor-text transition-colors group/edit"
                              onClick={() => startEditingSkills(user)}
                            >
                              <span className={user.special_skills ? "text-gray-700 text-sm font-medium" : "text-gray-400 italic text-sm"}>
                                {user.special_skills || "Add skills..."}
                              </span>
                              <Edit2 className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover/edit:opacity-100 transition-opacity" />
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="text-gray-500 text-sm whitespace-nowrap font-medium">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>

                        <TableCell className="text-right">
                           <button onClick={(e) => handleDeleteUser(user.id, e)} className="text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg" title="Delete User">
                              <Trash2 className="h-4 w-4" />
                           </button>
                        </TableCell>
                      </MotionTableRow>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
              <p className="text-sm text-gray-500 font-medium">
                Showing <span className="text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-gray-900">{Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)}</span> of <span className="text-gray-900">{filteredAndSortedUsers.length}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg shadow-sm"
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg shadow-sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Email Composer */}
        <div className="bg-white/70 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-xl shadow-blue-900/5 overflow-hidden h-fit sticky top-24">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 via-white/50 to-transparent">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg"><Mail className="w-5 h-5 text-blue-600" /></div>
              Broadcast
            </h3>
            <p className="text-sm text-gray-500 mt-2 font-medium">
              Sending to <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{selectedIds.size}</span> selected users.
            </p>
          </div>
          
          <form onSubmit={handleSendEmail} className="p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-gray-700 font-semibold ml-1">Subject Line</Label>
              <Input 
                id="subject" 
                placeholder="e.g. Welcome to JointJourney Beta" 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="bg-white/80 border-gray-200/80 rounded-xl h-12 shadow-sm focus-visible:ring-blue-500/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message" className="text-gray-700 font-semibold ml-1">Message Body</Label>
              <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500/30 transition-shadow">
                <ReactQuill 
                  theme="snow"
                  value={message} 
                  onChange={setMessage} 
                  modules={quillModules}
                  className="h-[280px] border-none"
                />
              </div>
            </div>

            {feedback && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl text-sm font-medium border shadow-sm ${feedback.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'}`}
              >
                {feedback.text}
              </motion.div>
            )}

            <Button 
              type="submit" 
              className="h-12 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all font-semibold group"
              disabled={sending || selectedIds.size === 0}
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending Broadcast...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  Send Email
                </>
              )}
            </Button>
          </form>
        </div>

      </div>

      {/* Slide-out User Profile Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto bg-white/95 backdrop-blur-3xl border-l border-white/50 shadow-2xl">
          <SheetHeader className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
              <UsersRound className="w-10 h-10" />
            </div>
            <SheetTitle className="text-3xl font-bold tracking-tight text-gray-900 truncate" title={selectedUser?.email}>{selectedUser?.email}</SheetTitle>
            <SheetDescription className="font-medium text-gray-500">
              Manage user profile, status, and CRM notes.
            </SheetDescription>
          </SheetHeader>

          {selectedUser && (
            <div className="space-y-8">
              
              <div className="space-y-3">
                <Label className="text-gray-700 font-semibold">User Status</Label>
                <Select 
                  value={selectedUser.status || "Lead"} 
                  onValueChange={(val) => updateProfileStatus(selectedUser.id, val)}
                >
                  <SelectTrigger className="w-full h-12 bg-white rounded-xl shadow-sm border-gray-200">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl shadow-xl border-gray-100">
                    <SelectItem value="Lead" className="font-medium">Lead</SelectItem>
                    <SelectItem value="Active" className="font-medium">Active</SelectItem>
                    <SelectItem value="VIP" className="font-medium">VIP</SelectItem>
                    <SelectItem value="Inactive" className="font-medium">Inactive</SelectItem>
                    <SelectItem value="Banned" className="font-medium text-red-600">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50/80 p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Joined Date</p>
                  <p className="text-sm font-semibold text-gray-900">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Last Sign In</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedUser.last_sign_in_at ? new Date(selectedUser.last_sign_in_at).toLocaleDateString() : 'Never'}</p>
                </div>
                <div className="col-span-2 mt-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">User ID</p>
                  <p className="text-xs font-mono text-gray-600 truncate bg-white px-3 py-2 border border-gray-200 rounded-lg shadow-inner">{selectedUser.id}</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-gray-700 font-semibold">Special Skills</Label>
                <div className="text-sm font-medium text-gray-900 bg-white p-4 border border-gray-200 shadow-sm rounded-xl min-h-[50px]">
                  {selectedUser.special_skills || <span className="text-gray-400 italic font-normal">No skills listed. Edit in table.</span>}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="flex justify-between items-center text-gray-700 font-semibold">
                  Internal CRM Notes
                  {savingProfileId === selectedUser.id && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                </Label>
                <Textarea 
                  placeholder="Write private notes about this user..."
                  className="min-h-[160px] resize-y bg-white rounded-xl shadow-sm border-gray-200 focus-visible:ring-blue-500/30"
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  onBlur={saveProfileNotes}
                />
                <p className="text-xs font-medium text-gray-400 text-right">Saved automatically</p>
              </div>

              <div className="pt-6 border-t border-gray-100 flex flex-col gap-3">
                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-xl text-blue-700 border-blue-200 bg-blue-50/50 hover:bg-blue-100 hover:text-blue-800 font-semibold transition-colors"
                  onClick={() => {
                    setIsSheetOpen(false)
                    setSelectedIds(new Set([selectedUser.id]))
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" /> Select for Broadcast
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full h-12 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold transition-colors"
                  onClick={() => handleDeleteUser(selectedUser.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Account Permanently
                </Button>
              </div>

            </div>
          )}
        </SheetContent>
      </Sheet>

    </div>
  )
}
