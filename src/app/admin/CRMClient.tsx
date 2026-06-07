"use client"

import { motion, AnimatePresence } from "framer-motion"

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

export default function CRMClient({ initialUsers }: { initialUsers: UserData[] }) {
  const { state, actions } = useCRM(initialUsers)

  return (
    <div className="flex flex-col gap-8 pb-16 min-h-screen relative text-gray-900 dark:text-gray-100">
      
      <LiquidGlassBackground />

      {state.loading ? (
        <CRMSkeletonLoader />
      ) : (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8 w-full">
            <CRMStatsCards users={state.users} loading={state.loading} />
            
            {state.users.length > 0 && (
              <CRMAnalyticsCharts users={state.users} />
            )}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* Main CRM Area */}
              <div className="xl:col-span-2 bg-white/40 dark:bg-gray-900/40 backdrop-blur-3xl border border-white/60 dark:border-gray-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-3xl overflow-hidden flex flex-col min-h-[600px]">
                
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

                {/* View Container */}
                <div className="flex-1 bg-white/50 dark:bg-gray-900/50 relative">
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

              {/* Side Panel: Composer & Audit Log */}
              <div className="flex flex-col gap-6">
                <CRMEmailComposer selectedIds={state.selectedIds} onSent={() => actions.setSelectedIds(new Set())} />
                <CRMAuditLog logs={state.auditLogs} />
              </div>

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
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
