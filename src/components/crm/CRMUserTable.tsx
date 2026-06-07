"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Edit2, Check, X, Copy, Trash2, Ghost, Loader2, Users } from "lucide-react"
import { UserData, SortConfig } from "./types"
import { CRMBadgeList } from "./CRMBadge"
import { InlineStatusSelect } from "./InlineStatusSelect"

export function getOnlineStatus(lastSignInAt?: string) {
  if (!lastSignInAt) return 'bg-gray-300'
  const diff = Date.now() - new Date(lastSignInAt).getTime()
  if (diff < 1000 * 60 * 60 * 24) return 'bg-emerald-500'
  if (diff < 1000 * 60 * 60 * 24 * 7) return 'bg-amber-500'
  return 'bg-gray-300'
}

export function CRMUserTable({
  users,
  loading,
  paginatedUsers,
  selectedIds,
  toggleAll,
  toggleUser,
  handleSort,
  openUserProfile,
  copyToClipboard,
  handleDeleteUser,
  saveSkills,
  currentPage,
  setCurrentPage,
  totalPages,
  filteredCount,
  updateProfileStatus
}: {
  users: UserData[],
  loading: boolean,
  paginatedUsers: UserData[],
  selectedIds: Set<string>,
  toggleAll: () => void,
  toggleUser: (id: string) => void,
  handleSort: (key: keyof UserData) => void,
  openUserProfile: (user: UserData) => void,
  copyToClipboard: (text: string) => void,
  handleDeleteUser: (id: string, e?: React.MouseEvent) => void,
  saveSkills: (userId: string, newSkills: string) => Promise<void>,
  currentPage: number,
  setCurrentPage: (p: (prev: number) => number) => void,
  totalPages: number,
  filteredCount: number,
  updateProfileStatus: (id: string, newStatus: string) => void
}) {
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editSkillsValue, setEditSkillsValue] = useState("")
  const [savingSkillsId, setSavingSkillsId] = useState<string | null>(null)

  const getStatusBadgeVariant = (status: string) => {
    switch(status.toLowerCase()) {
      case 'active': return 'default'
      case 'vip': return 'secondary'
      case 'banned': return 'destructive'
      case 'inactive': return 'outline'
      default: return 'outline' // Lead
    }
  }

  const getOnlineStatus = (lastSignIn?: string) => {
    if (!lastSignIn) return 'bg-gray-300'
    const daysSince = (new Date().getTime() - new Date(lastSignIn).getTime()) / (1000 * 3600 * 24)
    if (daysSince < 1) return 'bg-green-500' // < 24h
    if (daysSince < 7) return 'bg-yellow-400' // < 7d
    return 'bg-gray-300'
  }

  const startEditingSkills = (user: UserData) => {
    setEditingUserId(user.id)
    setEditSkillsValue(user.special_skills || "")
  }

  const handleSaveSkills = async (userId: string) => {
    setSavingSkillsId(userId)
    await saveSkills(userId, editSkillsValue)
    setSavingSkillsId(null)
    setEditingUserId(null)
  }

  const MotionTableRow = motion(TableRow)
  const itemsPerPage = 10

  return (
    <div className="flex flex-col flex-1 h-full">
      <div className="overflow-x-auto flex-1 p-2">
        <Table className="border-separate border-spacing-y-2">
          <TableHeader className="bg-transparent">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-14 text-center pb-2">
                <Checkbox 
                  checked={paginatedUsers.length > 0 && paginatedUsers.every(u => selectedIds.has(u.id))}
                  onCheckedChange={toggleAll}
                  className="rounded-md border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
              </TableHead>
              <TableHead className="cursor-pointer hover:text-blue-600 transition-colors pb-2 text-xs font-bold uppercase tracking-wider text-gray-500" onClick={() => handleSort('email')}>
                <div className="flex items-center gap-2">User <ArrowUpDown className="h-3 w-3" /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:text-blue-600 transition-colors pb-2 text-xs font-bold uppercase tracking-wider text-gray-500" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-2">Status <ArrowUpDown className="h-3 w-3" /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:text-blue-600 transition-colors pb-2 text-xs font-bold uppercase tracking-wider text-gray-500" onClick={() => handleSort('special_skills')}>
                <div className="flex items-center gap-2">Special Skills <ArrowUpDown className="h-3 w-3" /></div>
              </TableHead>
              <TableHead className="cursor-pointer hover:text-blue-600 transition-colors pb-2 text-xs font-bold uppercase tracking-wider text-gray-500" onClick={() => handleSort('created_at')}>
                <div className="flex items-center gap-2">Joined <ArrowUpDown className="h-3 w-3" /></div>
              </TableHead>
              <TableHead className="w-16 text-right pb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {loading ? (
                <MotionTableRow exit={{ opacity: 0 }}>
                  <TableCell colSpan={6} className="h-64 border-none">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-500" />
                      <p className="font-medium">Loading user directory...</p>
                    </div>
                  </TableCell>
                </MotionTableRow>
              ) : paginatedUsers.length === 0 ? (
                <MotionTableRow>
                  <TableCell colSpan={6} className="h-96 text-center border-none">
                    <div className="flex flex-col items-center justify-center p-8 bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl border border-white/60 dark:border-gray-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-3xl max-w-md mx-auto">
                      <div className="w-16 h-16 bg-blue-100/50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/50 dark:border-blue-800/50">
                        <Users className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">No Users Found</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium leading-relaxed">We couldn't find anyone matching your current search or filters. Try adjusting your criteria or clear filters to see the full directory.</p>
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
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className="cursor-pointer group bg-white/40 dark:bg-gray-800/40 hover:bg-white/80 dark:hover:bg-gray-800/80 backdrop-blur-md transition-all duration-300 border border-white/60 dark:border-gray-700/60 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(37,99,235,0.06)] rounded-2xl overflow-hidden" 
                    onClick={() => openUserProfile(user)}
                  >
                    <TableCell className="text-center rounded-l-2xl border-none" onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedIds.has(user.id)}
                        onCheckedChange={() => toggleUser(user.id)}
                        className="rounded-md border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                    </TableCell>
                    <TableCell className="font-medium max-w-[180px] truncate border-none" title={user.email}>
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-100 flex items-center justify-center">
                            <span className="text-blue-700 font-bold text-xs uppercase">{user.email?.charAt(0) || '?'}</span>
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white dark:border-gray-900 rounded-full ${getOnlineStatus(user.last_sign_in_at)}`} />
                        </div>
                        <span className="truncate text-gray-900 dark:text-gray-100">{user.email || 'No email'}</span>
                        {user.email && (
                          <button onClick={(e) => { e.stopPropagation(); copyToClipboard(user.email!) }} className="text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" title="Copy Email">
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="border-none" onClick={(e) => e.stopPropagation()}>
                      <InlineStatusSelect 
                        status={user.status || 'Lead'} 
                        onStatusChange={(newStatus) => updateProfileStatus(user.id, newStatus)} 
                      />
                    </TableCell>

                    <TableCell className="min-w-[150px] border-none" onClick={(e) => e.stopPropagation()}>
                      {editingUserId === user.id ? (
                        <div className="flex items-center gap-2">
                          <Input 
                            autoFocus
                            value={editSkillsValue}
                            onChange={(e) => setEditSkillsValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveSkills(user.id)
                              if (e.key === 'Escape') setEditingUserId(null)
                            }}
                            className="h-8 text-sm rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder="e.g. React, Marketing"
                            disabled={savingSkillsId === user.id}
                          />
                          {savingSkillsId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                          ) : (
                            <>
                              <button onClick={() => handleSaveSkills(user.id)} className="text-green-600 hover:text-green-700 bg-green-50 p-1.5 rounded-md">
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
                          className="flex items-center justify-between px-3 py-1.5 -mx-3 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/80 cursor-pointer transition-colors group/edit"
                          onClick={() => startEditingSkills(user)}
                        >
                          {user.special_skills ? (
                            <CRMBadgeList tagsString={user.special_skills} />
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600 italic text-sm">
                              Add tags...
                            </span>
                          )}
                          <Edit2 className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover/edit:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="text-gray-500 text-sm whitespace-nowrap font-medium border-none">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-right rounded-r-2xl border-none">
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
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900/50 mt-auto">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Showing <span className="text-gray-900 dark:text-gray-100">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-gray-900 dark:text-gray-100">{Math.min(currentPage * itemsPerPage, filteredCount)}</span> of <span className="text-gray-900 dark:text-gray-100">{filteredCount}</span>
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
  )
}
