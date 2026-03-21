// app/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white px-6">
      <div className="text-center">
        <p className="text-red-400 text-sm font-semibold uppercase tracking-widest mb-4">Error</p>
        <h1 className="text-4xl font-black mb-4">Something went wrong</h1>
        <p className="text-slate-400 mb-8 text-sm">{error.message}</p>
        <button
          onClick={reset}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}