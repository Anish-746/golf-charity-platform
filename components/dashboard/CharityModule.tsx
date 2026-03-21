// components/dashboard/CharityModule.tsx
'use client'

import { useState } from 'react'
import { updateCharity } from '@/app/actions/profile'
import type { Charity } from '@/types/database'

export default function CharityModule({
  charities,
  selectedCharity,
  currentPercentage,
}: {
  charities: Charity[]
  selectedCharity: Charity | null
  currentPercentage: number
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [percentage, setPercentage] = useState(currentPercentage)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (formData: globalThis.FormData) => {
    setIsSaving(true)
    await updateCharity(formData)
    setIsSaving(false)
    setIsEditing(false)
  }

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold text-lg">Your Charity</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
        >
          {isEditing ? 'Cancel' : 'Change'}
        </button>
      </div>

      {!isEditing ? (
        // Display mode
        <div>
          {selectedCharity ? (
            <div>
              <p className="text-white font-medium">{selectedCharity.name}</p>
              <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                {selectedCharity.description}
              </p>
              <div className="mt-4 bg-slate-800 rounded-lg px-4 py-3">
                <p className="text-slate-400 text-xs uppercase tracking-wide">
                  Your contribution
                </p>
                <p className="text-emerald-400 text-2xl font-bold mt-1">
                  {currentPercentage}%
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  of your subscription fee
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-slate-400 text-sm mb-4">
                {"You haven't selected a charity yet. Choose one to direct your contribution."}
              </p>
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-2 rounded-lg text-sm transition-colors"
              >
                Select a Charity
              </button>
            </div>
          )}
        </div>
      ) : (
        // Edit mode
        <form action={handleSave} className="space-y-4">
          {/* Charity picker dropdown */}
          <div>
            <label className="block text-slate-400 text-xs uppercase tracking-wide mb-2">
              Choose a charity
            </label>
            <select
              name="charity_id"
              defaultValue={selectedCharity?.id || ''}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="" disabled>Select a charity...</option>
              {charities.map((charity) => (
                <option key={charity.id} value={charity.id}>
                  {charity.name}
                </option>
              ))}
            </select>
          </div>

          {/* Contribution percentage slider */}
          <div>
            <label className="block text-slate-400 text-xs uppercase tracking-wide mb-2">
              Contribution: <span className="text-emerald-400 font-bold">{percentage}%</span>
              <span className="text-slate-600 ml-1">(min 10%)</span>
            </label>
            {/* Hidden input carries the actual value to the server action */}
            <input type="hidden" name="charity_percentage" value={percentage} />
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={percentage}
              onChange={(e) => setPercentage(parseInt(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-slate-600 text-xs mt-1">
              <span>10%</span>
              <span>100%</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Charity'}
          </button>
        </form>
      )}
    </div>
  )
}