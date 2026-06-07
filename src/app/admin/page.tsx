"use client"

import { useEffect, useState, useMemo } from "react"
import dynamic from "next/dynamic"
import { getUsersAction, sendAdminEmailAction, updateUserSkillsAction, deleteUserAction } from "./actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Send, Search, Download, ArrowUpDown, Edit2, Check, X, Copy, Trash2 } from "lucide-react"

// Import ReactQuill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
import "react-quill/dist/quill.snow.css"

type UserData = { id: string, email?: string, created_at: string, last_sign_in_at?: string, special_skills?: string }
type SortConfig = { key: keyof UserData; direction: 'asc' | 'desc' } | null

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  
  // Search, Sort, and Pagination states
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Inline Editing State
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editSkillsValue, setEditSkillsValue] = useState("")
  const [savingSkillsId, setSavingSkillsId] = useState<string | null>(null)

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

  // Memoized Filtering, Sorting, and Pagination
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users]

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(u => 
        u.email?.toLowerCase().includes(q) || 
        u.special_skills?.toLowerCase().includes(q)
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
  }, [users, searchQuery, sortConfig])

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

    const headers = ['ID', 'Email', 'Joined', 'Last Sign In', 'Special Skills']
    const rows = targetUsers.map(u => [
      u.id, 
      u.email || '', 
      new Date(u.created_at).toISOString(), 
      u.last_sign_in_at ? new Date(u.last_sign_in_at).toISOString() : '',
      `"${(u.special_skills || '').replace(/"/g, '""')}"` // Escape quotes for CSV
    ])
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "jointjourney_users.csv")
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

  const handleDeleteUser = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to permanently delete this user?")) return
    
    try {
      await deleteUserAction(id)
      setUsers(prev => prev.filter(u => u.id !== id))
      setSelectedIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
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
      // Optimistically update the local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, special_skills: editSkillsValue } : u))
      setEditingUserId(null)
    } catch (err) {
      console.error(err)
      setFeedback({ type: 'error', text: "Failed to update user skills." })
    } finally {
      setSavingSkillsId(null)
    }
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Users Table */}
      <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">User Directory</h3>
            <p className="text-sm text-gray-500 mt-1">Manage users, special skills, and communication.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Search emails or skills..." 
                className="pl-9 bg-white"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" onClick={exportToCSV} title="Export CSV">
              <Download className="h-4 w-4 text-gray-700" />
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto flex-1">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 text-center">
                  <Checkbox 
                    checked={paginatedUsers.length > 0 && paginatedUsers.every(u => selectedIds.has(u.id))}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('email')}>
                  <div className="flex items-center gap-1">Email <ArrowUpDown className="h-3 w-3" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('special_skills')}>
                  <div className="flex items-center gap-1">Special Skills <ArrowUpDown className="h-3 w-3" /></div>
                </TableHead>
                <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort('created_at')}>
                  <div className="flex items-center gap-1">Joined <ArrowUpDown className="h-3 w-3" /></div>
                </TableHead>
                <TableHead className="w-12 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-gray-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-gray-500">
                    No users found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUsers.map(user => (
                  <TableRow key={user.id} className="cursor-pointer group" onClick={() => toggleUser(user.id)}>
                    <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedIds.has(user.id)}
                        onCheckedChange={() => toggleUser(user.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium max-w-[150px] truncate" title={user.email} onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        {user.email || 'No email'}
                        {user.email && (
                          <button onClick={() => copyToClipboard(user.email!)} className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Copy className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="min-w-[200px]" onClick={(e) => e.stopPropagation()}>
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
                            className="h-8 text-sm"
                            placeholder="e.g. React, Marketing"
                            disabled={savingSkillsId === user.id}
                          />
                          {savingSkillsId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                          ) : (
                            <>
                              <button onClick={() => saveSkills(user.id)} className="text-green-600 hover:text-green-700">
                                <Check className="h-4 w-4" />
                              </button>
                              <button onClick={() => setEditingUserId(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <div 
                          className="flex items-center justify-between px-2 py-1 -mx-2 rounded hover:bg-gray-100/50 cursor-text"
                          onClick={() => startEditingSkills(user)}
                        >
                          <span className={user.special_skills ? "text-gray-900" : "text-gray-400 italic"}>
                            {user.special_skills || "Add skills..."}
                          </span>
                          <Edit2 className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-gray-500 text-sm whitespace-nowrap">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-right">
                       <button onClick={(e) => handleDeleteUser(user.id, e)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                          <Trash2 className="h-4 w-4" />
                       </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)} of {filteredAndSortedUsers.length}
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Email Composer */}
      <div className="bg-white/60 backdrop-blur-xl border rounded-2xl shadow-sm overflow-hidden h-fit sticky top-24">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-transparent">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Compose Email
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Sending to <span className="font-bold text-gray-900">{selectedIds.size}</span> selected users.
          </p>
        </div>
        
        <form onSubmit={handleSendEmail} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line</Label>
            <Input 
              id="subject" 
              placeholder="e.g. Welcome to JointJourney Beta" 
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="bg-white"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message Body</Label>
            <div className="bg-white rounded-md border overflow-hidden">
              <ReactQuill 
                theme="snow"
                value={message} 
                onChange={setMessage} 
                modules={quillModules}
                className="h-[250px] border-none"
              />
            </div>
          </div>

          {feedback && (
            <div className={`p-3 rounded-lg text-sm font-medium ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {feedback.text}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-md shadow-blue-500/20"
            disabled={sending || selectedIds.size === 0}
          >
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </form>
      </div>

    </div>
  )
}
