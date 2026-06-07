import { useState, useMemo } from "react"
import { UserData, SortConfig, Segment } from "@/components/crm/types"

export function useCRMFilters(users: UserData[]) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSegment, setActiveSegment] = useState<Segment>('All')
  const [hasNotesFilter, setHasNotesFilter] = useState<boolean | null>(null)
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users]
    const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30))
    
    if (activeSegment === 'New Signups') result = result.filter(u => new Date(u.created_at) > thirtyDaysAgo)
    if (activeSegment === 'Active') result = result.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > thirtyDaysAgo)
    if (activeSegment === 'VIPs') result = result.filter(u => u.status === 'VIP')
    if (activeSegment === 'Leads') result = result.filter(u => !u.status || u.status === 'Lead')
    if (activeSegment === 'Banned') result = result.filter(u => u.status === 'Banned')

    if (hasNotesFilter !== null) {
      if (hasNotesFilter) result = result.filter(u => !!u.crm_notes)
      else result = result.filter(u => !u.crm_notes)
    }

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
  }, [users, searchQuery, activeSegment, sortConfig, hasNotesFilter])

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

  return {
    searchQuery, setSearchQuery,
    activeSegment, setActiveSegment,
    hasNotesFilter, setHasNotesFilter,
    sortConfig, setSortConfig, handleSort,
    currentPage, setCurrentPage,
    filteredAndSortedUsers, paginatedUsers, totalPages
  }
}
