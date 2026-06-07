"use client"

export function CRMSkeletonLoader() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-white/40 dark:bg-gray-800/40 rounded-3xl border border-white/50 dark:border-gray-700/50" />
        ))}
      </div>

      {/* Analytics Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="h-64 bg-white/40 dark:bg-gray-800/40 rounded-3xl border border-white/50 dark:border-gray-700/50" />
        ))}
      </div>

      {/* Main CRM Area Skeleton */}
      <div className="h-[600px] bg-white/40 dark:bg-gray-800/40 rounded-3xl border border-white/50 dark:border-gray-700/50 flex flex-col p-6 gap-6">
        {/* Toolbar Skeleton */}
        <div className="flex justify-between items-center pb-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
        {/* Table Rows Skeleton */}
        <div className="space-y-4 mt-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-12 w-full bg-gray-100 dark:bg-gray-700/50 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
