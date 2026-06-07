import { useState } from "react"
import { AuditLogEntry } from "@/components/crm/CRMAuditLog"

export function useCRMAudit() {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])

  const logActivity = (action: string) => {
    setAuditLogs(prev => [{ id: Math.random().toString(), action, timestamp: new Date() }, ...prev].slice(0, 50))
  }

  return { auditLogs, logActivity }
}
