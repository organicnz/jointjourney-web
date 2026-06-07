import { useState } from "react"
import { toast } from "sonner"
import { updateUserSkillsAction, deleteUserAction, updateUserProfileDetailsAction, bulkUpdateUserStatusAction } from "@/app/admin/actions"
import { UserData } from "@/components/crm/types"

export function useCRMUsers(initialUsers: UserData[], logActivity: (action: string) => void) {
  const [users, setUsers] = useState<UserData[]>(initialUsers)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [notesValue, setNotesValue] = useState("")
  const [savingProfileId, setSavingProfileId] = useState<string | null>(null)

  const openUserProfile = (user: UserData) => {
    setSelectedUser(user)
    setNotesValue(user.crm_notes || "")
    setIsSheetOpen(true)
  }

  const handleDeleteUser = async (id: string, setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!confirm("Are you sure you want to permanently delete this user?")) return
    try {
      await deleteUserAction(id)
      setUsers(prev => prev.filter(u => u.id !== id))
      setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next })
      if (selectedUser?.id === id) setIsSheetOpen(false)
      toast.success("User deleted successfully")
      logActivity(`Deleted user ${id}`)
    } catch (err: any) { toast.error("Failed to delete user") }
  }

  const saveSkills = async (userId: string, skills: string) => {
    try {
      await updateUserSkillsAction(userId, skills)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, special_skills: skills } : u))
      toast.success("Skills updated")
      logActivity(`Updated skills for user ${userId}`)
    } catch (err) { toast.error("Failed to save skills") }
  }

  const updateProfileStatus = async (userId: string, newStatus: string) => {
    try {
      await updateUserProfileDetailsAction(userId, { status: newStatus })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u))
      if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, status: newStatus })
      toast.success(`Status changed to ${newStatus}`)
      logActivity(`Changed status to ${newStatus} for user ${userId}`)
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
      logActivity(`Saved notes for user ${selectedUser.id}`)
    } catch (err) { toast.error("Failed to save notes") }
    finally { setSavingProfileId(null) }
  }

  const handleBulkStatusUpdate = async (selectedIds: Set<string>, newStatus: string | null, setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    if (!newStatus || selectedIds.size === 0) return
    try {
      await bulkUpdateUserStatusAction(Array.from(selectedIds), newStatus)
      setUsers(prev => prev.map(u => selectedIds.has(u.id) ? { ...u, status: newStatus } : u))
      toast.success(`Successfully updated ${selectedIds.size} users to ${newStatus}`)
      logActivity(`Bulk updated ${selectedIds.size} users to ${newStatus}`)
      setSelectedIds(new Set())
    } catch (err) {
      toast.error("Failed to update user statuses")
    }
  }

  return {
    users, setUsers,
    selectedUser, setSelectedUser,
    isSheetOpen, setIsSheetOpen,
    notesValue, setNotesValue,
    savingProfileId,
    openUserProfile, handleDeleteUser, saveSkills, updateProfileStatus, saveProfileNotes, handleBulkStatusUpdate
  }
}
