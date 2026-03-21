// components/dashboard/ScoreModule.tsx
// This is a CLIENT component because it has interactive state (form inputs,
// optimistic UI updates, delete confirmations).
'use client'

import { useState } from 'react'
import { addScore, deleteScore } from '@/app/actions/scores'
import type { Score } from '@/types/database'

export default function ScoreModule({ scores }: { scores: Score[] }) {
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddScore = async (formData: globalThis.FormData) => {
    setError(null)
    setIsAdding(true)
    try {
      await addScore(formData)
      // After addScore, revalidatePath in the server action refreshes the page data
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async (scoreId: string) => {
    await deleteScore(scoreId)
  }

  // Today's date in YYYY-MM-DD format for the date input's max attribute
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-semibold text-lg">Your Scores</h2>
          <p className="text-slate-400 text-sm">
            Stableford format · Last 5 scores kept · {scores.length}/5 entered
          </p>
        </div>
        {/* Visual indicator of how many slots are filled */}
        <div className="flex gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${i < scores.length ? 'bg-emerald-400' : 'bg-slate-700'}`}
            />
          ))}
        </div>
      </div>

      {/* Score Entry Form */}
      <form action={handleAddScore} className="flex gap-3 mb-6">
        <div className="flex-1">
          <input
            name="score"
            type="number"
            min="1"
            max="45"
            placeholder="Score (1–45)"
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm transition-colors"
          />
        </div>
        <div className="flex-1">
          <input
            name="score_date"
            type="date"
            max={today}
            required
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isAdding}
          className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap"
        >
          {isAdding ? 'Adding...' : '+ Add'}
        </button>
      </form>

      {/* Error display */}
      {error && (
        <p className="text-red-400 text-sm mb-4 bg-red-400/10 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Score List */}
      {scores.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">
          No scores yet. Add your first score above to enter monthly draws.
        </div>
      ) : (
        <div className="space-y-2">
          {/* Header row */}
          <div className="grid grid-cols-12 text-xs text-slate-500 uppercase tracking-wide px-3 mb-1">
            <span className="col-span-1">#</span>
            <span className="col-span-4">Score</span>
            <span className="col-span-5">Date</span>
            <span className="col-span-2"></span>
          </div>

          {scores.map((score, index) => (
            <div
              key={score.id}
              className="grid grid-cols-12 items-center bg-slate-800 rounded-lg px-3 py-3"
            >
              {/* Position badge — newest is #1 */}
              <span className="col-span-1 text-slate-500 text-xs">{index + 1}</span>

              {/* The score number, colour-coded by range */}
              <span className={`col-span-4 text-2xl font-bold ${
                score.score >= 35 ? 'text-emerald-400' :
                score.score >= 20 ? 'text-blue-400' :
                'text-slate-300'
              }`}>
                {score.score}
              </span>

              {/* Formatted date */}
              <span className="col-span-5 text-slate-400 text-sm">
                {new Date(score.score_date).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </span>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(score.id)}
                className="col-span-2 text-slate-600 hover:text-red-400 text-xs transition-colors text-right"
              >
                Remove
              </button>
            </div>
          ))}

          {/* Rolling window warning */}
          {scores.length === 5 && (
            <p className="text-amber-400/70 text-xs mt-3 px-1">
              ⚠ Adding a new score will automatically remove your oldest one.
            </p>
          )}
        </div>
      )}
    </div>
  )
}