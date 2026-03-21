// app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white px-6">
      <div className="text-center">
        <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-4">404</p>
        <h1 className="text-5xl font-black mb-4">Page not found</h1>
        <p className="text-slate-400 mb-8">{"The page you're looking for doesn't exist."}</p>
        <Link
          href="/"
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}