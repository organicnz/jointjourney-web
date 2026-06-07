"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { UsersRound, Loader2, Mail, Trash2, Activity } from "lucide-react"
import { UserData } from "./types"
import { AuditLogEntry } from "./CRMAuditLog"

export function CRMUserProfileSheet({
  selectedUser,
  isSheetOpen,
  setIsSheetOpen,
  notesValue,
  setNotesValue,
  savingProfileId,
  updateProfileStatus,
  saveProfileNotes,
  setSelectedIds,
  handleDeleteUser,
  auditLogs
}: {
  selectedUser: UserData | null,
  isSheetOpen: boolean,
  setIsSheetOpen: (open: boolean) => void,
  notesValue: string,
  setNotesValue: (val: string) => void,
  savingProfileId: string | null,
  updateProfileStatus: (userId: string, newStatus: string) => void,
  saveProfileNotes: () => void,
  setSelectedIds: (ids: Set<string>) => void,
  handleDeleteUser: (id: string) => void,
  auditLogs: AuditLogEntry[]
}) {
  const userLogs = selectedUser ? auditLogs.filter(log => log.action.includes(selectedUser.id)) : []
  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetContent className="sm:max-w-md overflow-y-auto bg-white/95 dark:bg-gray-950/95 backdrop-blur-3xl border-l border-white/50 dark:border-gray-800 shadow-2xl">
        <SheetHeader className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
            <UsersRound className="w-10 h-10" />
          </div>
          <SheetTitle className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 truncate" title={selectedUser?.email}>{selectedUser?.email}</SheetTitle>
          <SheetDescription className="font-medium text-gray-500 dark:text-gray-400">
            Manage user profile, status, and CRM notes.
          </SheetDescription>
        </SheetHeader>

        {selectedUser && (
          <div className="space-y-8">
            
            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-gray-300 font-semibold">User Status</Label>
              <Select 
                value={selectedUser.status || "Lead"} 
                onValueChange={(val) => { if (val) updateProfileStatus(selectedUser.id, val) }}
              >
                <SelectTrigger className="w-full h-12 bg-white dark:bg-gray-900 rounded-xl shadow-sm border-gray-200 dark:border-gray-800">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-gray-100 dark:border-gray-800">
                  <SelectItem value="Lead" className="font-medium">Lead</SelectItem>
                  <SelectItem value="Active" className="font-medium">Active</SelectItem>
                  <SelectItem value="VIP" className="font-medium">VIP</SelectItem>
                  <SelectItem value="Inactive" className="font-medium">Inactive</SelectItem>
                  <SelectItem value="Banned" className="font-medium text-red-600">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-gray-50/80 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">Joined Date</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">Last Sign In</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{selectedUser.last_sign_in_at ? new Date(selectedUser.last_sign_in_at).toLocaleDateString() : 'Never'}</p>
              </div>
              <div className="col-span-2 mt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5">User ID</p>
                <p className="text-xs font-mono text-gray-600 dark:text-gray-400 truncate bg-white dark:bg-gray-950 px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg shadow-inner">{selectedUser.id}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-700 dark:text-gray-300 font-semibold">Special Skills</Label>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl min-h-[50px]">
                {selectedUser.special_skills || <span className="text-gray-400 dark:text-gray-600 italic font-normal">No skills listed. Edit in table.</span>}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="flex justify-between items-center text-gray-700 dark:text-gray-300 font-semibold">
                Internal CRM Notes
                {savingProfileId === selectedUser.id && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
              </Label>
              <Textarea 
                placeholder="Write private notes about this user..."
                className="min-h-[160px] resize-y bg-white dark:bg-gray-900 rounded-xl shadow-sm border-gray-200 dark:border-gray-800 focus-visible:ring-blue-500/30"
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                onBlur={saveProfileNotes}
              />
              <p className="text-xs font-medium text-gray-400 text-right">Saved automatically</p>
            </div>

            {userLogs.length > 0 && (
              <div className="space-y-3">
                <Label className="text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" /> Recent Activity
                </Label>
                <div className="bg-gray-50/50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-inner max-h-[200px] overflow-y-auto no-scrollbar space-y-3">
                  {userLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-3 border-l-2 border-blue-200 dark:border-blue-800 pl-3">
                      <div>
                        <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
                          {log.action.replace(selectedUser!.id, 'this user')}
                        </p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                          {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-3">
              <Button 
                variant="outline" 
                className="w-full h-12 rounded-xl text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors"
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
  )
}
