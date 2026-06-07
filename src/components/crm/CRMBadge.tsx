import React from 'react'

const colorPalettes = [
  "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
  "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
  "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
  "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800",
]

function getHashString(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

export function CRMBadgeList({ tagsString }: { tagsString?: string | null }) {
  if (!tagsString) return null
  
  // Split by comma, trim whitespace, filter empty
  const tags = tagsString.split(',').map(t => t.trim()).filter(Boolean)
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag, i) => {
        const palette = colorPalettes[getHashString(tag.toLowerCase()) % colorPalettes.length]
        return (
          <span 
            key={`${tag}-${i}`} 
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shadow-sm ${palette}`}
            title={tag}
          >
            {tag}
          </span>
        )
      })}
    </div>
  )
}
