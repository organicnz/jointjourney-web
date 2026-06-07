"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Clock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export type AuditLogEntry = {
  id: string
  action: string
  timestamp: Date
}

export function CRMAuditLog({ logs }: { logs: AuditLogEntry[] }) {
  return (
    <Card className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl border-white/50 dark:border-gray-800/50 shadow-lg shadow-blue-900/5 h-[400px] flex flex-col">
      <CardHeader className="flex flex-row items-center gap-3 pb-2 border-b border-gray-100 dark:border-gray-800">
        <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
          <Activity className="h-4 w-4" />
        </div>
        <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <AnimatePresence>
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
              <Clock className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            logs.map((log) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 border-l-2 border-green-200 dark:border-green-800/50 pl-3 py-1"
              >
                <div className="flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200">{log.action}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
