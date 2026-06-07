"use client"

import { motion, AnimatePresence } from "framer-motion"

// Hook
import { useCRM } from "@/hooks/useCRM"

// Components
import { CRMStatsCards } from "@/components/crm/CRMStatsCards"
import { CRMAnalyticsCharts } from "@/components/crm/CRMAnalyticsCharts"
import { CRMToolbar } from "@/components/crm/CRMToolbar"
import { CRMEmailComposer } from "@/components/crm/CRMEmailComposer"
import { CRMUserProfileSheet } from "@/components/crm/CRMUserProfileSheet"
import { CRMUserTable } from "@/components/crm/CRMUserTable"
import { CRMKanbanBoard } from "@/components/crm/CRMKanbanBoard"
import { CRMCommandPalette } from "@/components/crm/CRMCommandPalette"

export default function AdminDashboard() {
  const { state, actions } = useCRM()

  return (
    <div className="flex flex-col gap-8 pb-16 min-h-screen relative">
      
      {/* Liquid Glass Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 blur-3xl rounded-full mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-100/40 blur-3xl rounded-full mix-blend-multiply" />
      </div>

      <CRMStatsCards users={state.users} loading={state.loading} />
      
      {!state.loading && state.users.length > 0 && (
        <CRMAnalyticsCharts users={state.users} />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main CRM Area */}
        <div className="xl:col-span-2 bg-white/70 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-xl shadow-blue-900/5 overflow-hidden flex flex-col min-h-[600px]">
          
          <CRMToolbar 
            viewMode={state.viewMode} setViewMode={actions.setViewMode}
            searchQuery={state.searchQuery} setSearchQuery={actions.setSearchQuery}
            setCurrentPage={actions.setCurrentPage} exportToCSV={actions.exportToCSV}
            selectedIdsCount={state.selectedIds.size} handleBulkStatusUpdate={actions.handleBulkStatusUpdate}
            activeSegment={state.activeSegment} setActiveSegment={actions.setActiveSegment}
          />

          {/* View Container */}
          <div className="flex-1 bg-white/50 relative">
            <AnimatePresence mode="wait">
              {state.viewMode === 'list' ? (
                <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="h-full flex flex-col">
                  <CRMUserTable 
                    users={state.users} loading={state.loading} paginatedUsers={state.paginatedUsers} 
                    selectedIds={state.selectedIds} toggleAll={actions.toggleAll} toggleUser={actions.toggleUser} 
                    handleSort={actions.handleSort} openUserProfile={actions.openUserProfile} copyToClipboard={actions.copyToClipboard} 
                    handleDeleteUser={actions.handleDeleteUser} saveSkills={actions.saveSkills} currentPage={state.currentPage} 
                    setCurrentPage={actions.setCurrentPage} totalPages={state.totalPages} filteredCount={state.filteredAndSortedUsers.length} 
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

        <CRMEmailComposer selectedIds={state.selectedIds} onSent={() => actions.setSelectedIds(new Set())} />

      </div>

      <CRMUserProfileSheet 
        selectedUser={state.selectedUser} isSheetOpen={state.isSheetOpen} setIsSheetOpen={actions.setIsSheetOpen}
        notesValue={state.notesValue} setNotesValue={actions.setNotesValue} savingProfileId={state.savingProfileId}
        updateProfileStatus={actions.updateProfileStatus} saveProfileNotes={actions.saveProfileNotes}
        setSelectedIds={actions.setSelectedIds} handleDeleteUser={actions.handleDeleteUser}
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
