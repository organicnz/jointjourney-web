import { useState } from "react"
import { UserData } from "@/components/crm/types"

export function useCRMSelection(paginatedUsers: UserData[], filteredAndSortedUsers: UserData[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

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

  return { selectedIds, setSelectedIds, toggleAll, toggleUser, selectAll }
}
