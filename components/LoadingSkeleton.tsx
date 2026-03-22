'use client'

export function LoadingCard() {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        <div className="h-10 bg-slate-700 rounded w-full"></div>
      </div>
    </div>
  )
}

export function LoadingGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  )
}

export function LoadingTableRows({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="border-b border-slate-700 animate-pulse">
          <td className="px-6 py-4">
            <div className="h-4 bg-slate-700 rounded w-full"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-slate-700 rounded w-full"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-slate-700 rounded w-full"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-slate-700 rounded w-24"></div>
          </td>
        </tr>
      ))}
    </>
  )
}
