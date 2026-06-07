"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutDashboard, Users, Mail, Activity } from "lucide-react"

// Hook
import { useCRM } from "@/hooks/useCRM"

// Components
import { LiquidGlassBackground } from "@/components/ui/LiquidGlassBackground"
import { CRMSkeletonLoader } from "@/components/crm/CRMSkeletonLoader"
import { CRMStatsCards } from "@/components/crm/CRMStatsCards"
import { CRMAnalyticsCharts } from "@/components/crm/CRMAnalyticsCharts"
import { CRMToolbar } from "@/components/crm/CRMToolbar"
import { CRMEmailComposer } from "@/components/crm/CRMEmailComposer"
import { CRMAuditLog } from "@/components/crm/CRMAuditLog"
import { CRMUserProfileSheet } from "@/components/crm/CRMUserProfileSheet"
import { CRMUserTable } from "@/components/crm/CRMUserTable"
import { CRMKanbanBoard } from "@/components/crm/CRMKanbanBoard"
import { CRMCommandPalette } from "@/components/crm/CRMCommandPalette"

import { UserData } from "@/components/crm/types"

type Tab = 'overview' | 'contacts' | 'campaigns' | 'activity'

export default function CRMClient({ initialUsers }: { initialUsers: UserData[] }) {
  const { state, actions } = useCRM(initialUsers)
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'contacts', label: 'Contacts & Pipeline', icon: Users },
    { id: 'campaigns', label: 'Campaigns', icon: Mail },
    { id: 'activity', label: 'Activity Logs', icon: Activity },
  ] as const

  return (
    <div className="flex flex-col md:flex-row gap-8 pb-16 min-h-screen relative text-gray-900 dark:text-gray-100 mt-2">
      <LiquidGlassBackground />

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 flex-shrink-0 relative z-20">
        <div className="sticky top-24 bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl border border-white/60 dark:border-gray-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-3xl p-4 flex flex-col gap-2">
          <div className="px-4 pb-4 mb-2 border-b border-white/30 dark:border-gray-700/30">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-gray-500 dark:text-gray-400">Navigation</h3>
          </div>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm ${
                activeTab === tab.id
                  ? 'bg-blue-600/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 shadow-[0_2px_10px_rgb(37,99,235,0.1)] border border-blue-200/50 dark:border-blue-800/50'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-100 border border-transparent'
              }`}
            >
              <tab.icon className={`w-5 h-5 transition-transform duration-300 ${activeTab === tab.id ? 'drop-shadow-sm scale-110' : ''}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 relative z-10">
        {state.loading ? (
          <CRMSkeletonLoader />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-8 w-full"
            >
              {activeTab === 'overview' && (
                <>
                  <CRMStatsCards users={state.users} loading={state.loading} />
                  {state.users.length > 0 && <CRMAnalyticsCharts users={state.users} />}
                </>
              )}

              {activeTab === 'contacts' && (
                <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl border border-white/60 dark:border-gray-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-3xl overflow-hidden flex flex-col h-[calc(100vh-10rem)]">
                  <CRMToolbar 
                    viewMode={state.viewMode} setViewMode={actions.setViewMode}
                    searchQuery={state.searchQuery} setSearchQuery={actions.setSearchQuery}
                    setCurrentPage={actions.setCurrentPage} exportToCSV={actions.exportToCSV}
                    selectedIdsCount={state.selectedIds.size} handleBulkStatusUpdate={actions.handleBulkStatusUpdate}
                    activeSegment={state.activeSegment} setActiveSegment={actions.setActiveSegment}
                    hasNotesFilter={state.hasNotesFilter} setHasNotesFilter={actions.setHasNotesFilter}
                    statusFilters={state.statusFilters} setStatusFilters={actions.setStatusFilters}
                    skillsFilters={state.skillsFilters} setSkillsFilters={actions.setSkillsFilters}
                  />
                  <div className="flex-1 bg-white/50 dark:bg-gray-900/50 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                      {state.viewMode === 'list' ? (
                        <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
                          <CRMUserTable 
                            users={state.users} loading={state.loading} paginatedUsers={state.paginatedUsers} 
                            selectedIds={state.selectedIds} toggleAll={actions.toggleAll} toggleUser={actions.toggleUser} 
                            handleSort={actions.handleSort} openUserProfile={actions.openUserProfile} copyToClipboard={actions.copyToClipboard} 
                            handleDeleteUser={actions.handleDeleteUser} saveSkills={actions.saveSkills} currentPage={state.currentPage} 
                            setCurrentPage={actions.setCurrentPage} totalPages={state.totalPages} filteredCount={state.filteredAndSortedUsers.length} 
                            updateProfileStatus={actions.updateProfileStatus}
                          />
                        </motion.div>
                      ) : (
                        <motion.div key="kanban" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
                          <CRMKanbanBoard 
                            users={state.users} 
                            updateProfileStatus={actions.updateProfileStatus}
                            openUserProfile={actions.openUserProfile}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {activeTab === 'campaigns' && (
                <div className="max-w-4xl w-full">
                  <CRMEmailComposer selectedIds={state.selectedIds} onSent={() => actions.setSelectedIds(new Set())} />
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="max-w-4xl w-full h-[calc(100vh-10rem)]">
                  <CRMAuditLog logs={state.auditLogs} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <CRMUserProfileSheet 
        selectedUser={state.selectedUser} isSheetOpen={state.isSheetOpen} setIsSheetOpen={actions.setIsSheetOpen}
        notesValue={state.notesValue} setNotesValue={actions.setNotesValue} savingProfileId={state.savingProfileId}
        updateProfileStatus={actions.updateProfileStatus} saveProfileNotes={actions.saveProfileNotes}
        setSelectedIds={actions.setSelectedIds} handleDeleteUser={actions.handleDeleteUser}
        auditLogs={state.auditLogs}
      />

      <CRMCommandPalette 
        users={state.users}
        openUserProfile={actions.openUserProfile}
        exportToCSV={actions.exportToCSV}
        setViewMode={actions.setViewMode}
        selectAll={actions.selectAll}
      />
    </div>
  )
}
