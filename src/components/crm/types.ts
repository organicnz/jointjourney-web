export type UserData = { 
  id: string, 
  email?: string, 
  created_at: string, 
  last_sign_in_at?: string, 
  special_skills?: string,
  status?: string,
  crm_notes?: string,
  role?: string
}


export type SortConfig = { key: keyof UserData; direction: 'asc' | 'desc' } | null
export type Segment = 'All' | 'New Signups' | 'Active' | 'VIPs' | 'Leads' | 'Banned'
