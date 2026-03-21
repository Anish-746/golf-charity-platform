// components/home/CharitiesClient.tsx
'use client'

import { useState } from 'react'
import type { Charity } from '@/types/database'

export default function CharitiesClient({ charities }: { charities: Charity[] }) {
  const [search, setSearch] = useState('')

  const filtered = charities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Search bar */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search charities..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-slate-500">No charities match your search.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(charity => (
            <div
              key={charity.id}
              className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-emerald-500/40 transition-all"
            >
              {charity.is_featured && (
                <span className="inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2 py-0.5 rounded-full mb-3 font-medium">
                  Featured
                </span>
              )}
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-lg mb-4">
                ♥
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{charity.name}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                {charity.description || 'No description available.'}
              </p>
              {charity.website && (
                <a
                  href={charity.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
                >
                  Visit website →
                </a>
              )}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <p className="text-slate-500 text-xs">Total raised through platform</p>
                <p className="text-white font-bold">£{(charity.total_raised || 0).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}