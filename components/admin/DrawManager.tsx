// components/admin/DrawManager.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Draw } from '@/types/database'

// Status badge colours
const statusColors = {
  draft:      'bg-slate-700 text-slate-300',
  simulated:  'bg-amber-500/20 text-amber-400',
  published:  'bg-emerald-500/20 text-emerald-400',
}

// Simulation result returned from the API
type SimulationResult = {
  winningNumbers: number[]
  pool: {
    jackpotPool: number
    fourMatchPool: number
    threeMatchPool: number
    totalPool: number
  }
  totalEntries: number
  winnerPreview: { userId: string; matchType: 3 | 4 | 5; prizeAmount: number }[]
  hasJackpotWinner: boolean
  jackpotCarryover: number
}

const formatMonth = (dateString: string) => {
  const date = new Date(dateString)
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ]
  return `${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

export default function DrawManager({ draws }: { draws: Draw[] }) {
  const router = useRouter()

  // Form state for creating a new draw
  const [newDrawMonth, setNewDrawMonth] = useState('')
  const [newDrawType, setNewDrawType] = useState<'random' | 'algorithmic'>('random')
  const [isCreating, setIsCreating] = useState(false)

  // Simulation state
  const [simulatingId, setSimulatingId] = useState<string | null>(null)
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [simulationDrawId, setSimulationDrawId] = useState<string | null>(null)

  // Publish state
  const [publishingId, setPublishingId] = useState<string | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // ── Create Draw ─────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newDrawMonth) return
    setIsCreating(true)
    setError(null)

    const formattedMonth = newDrawMonth.slice(0, 7) + '-01'

    const res = await fetch('/api/admin/draw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawMonth: formattedMonth, drawType: newDrawType }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error)
    } else {
      setSuccess('Draw created successfully')
      router.refresh()   // re-fetch the draws list from the server
    }
    setIsCreating(false)
  }

  // ── Simulate Draw ───────────────────────────────────────────────────────────
  const handleSimulate = async (drawId: string) => {
    setSimulatingId(drawId)
    setSimulationResult(null)
    setError(null)

    const res = await fetch(`/api/admin/draw/${drawId}/simulate`, { method: 'POST' })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
    } else {
      setSimulationResult(data)
      setSimulationDrawId(drawId)
      router.refresh()
    }
    setSimulatingId(null)
  }

  // ── Publish Draw ────────────────────────────────────────────────────────────
  const handlePublish = async (drawId: string) => {
    if (!confirm('Publishing is irreversible. Winners will be recorded and notified. Continue?')) return

    setPublishingId(drawId)
    setError(null)

    const res = await fetch(`/api/admin/draw/${drawId}/publish`, { method: 'POST' })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
    } else {
      setSuccess(`Draw published! ${data.totalWinners} winners recorded. ${data.jackpotRolledOver ? 'Jackpot rolled over.' : ''}`)
      setSimulationResult(null)
      router.refresh()
    }
    setPublishingId(null)
  }

  return (
    <div className="space-y-8">

      {/* Feedback messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg p-4 text-sm">
          {success}
        </div>
      )}

      {/* ── Create New Draw ──────────────────────────────────────────────────── */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-white font-semibold text-lg mb-4">Create New Draw</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-slate-400 text-xs uppercase tracking-wide mb-1">
              Draw Month
            </label>
            <input
              type="date"
              value={newDrawMonth}
              onChange={e => setNewDrawMonth(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 color-scheme-dark"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs uppercase tracking-wide mb-1">
              Draw Type
            </label>
            <select
              value={newDrawType}
              onChange={e => setNewDrawType(e.target.value as 'random' | 'algorithmic')}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="random">Random</option>
              <option value="algorithmic">Algorithmic</option>
            </select>
          </div>
          <button
            onClick={handleCreate}
            disabled={!!(isCreating || !newDrawMonth)}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            {isCreating ? 'Creating...' : 'Create Draw'}
          </button>
        </div>
      </div>

      {/* ── Simulation Result Preview ────────────────────────────────────────── */}
      {simulationResult && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
          <h2 className="text-amber-400 font-semibold text-lg mb-4">
            Simulation Preview — Not Yet Published
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide">Total Entries</p>
              <p className="text-white text-2xl font-bold">{simulationResult.totalEntries}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide">Total Pool</p>
              <p className="text-white text-2xl font-bold">£{simulationResult.pool.totalPool.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide">Jackpot</p>
              <p className="text-emerald-400 text-2xl font-bold">£{simulationResult.pool.jackpotPool.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide">Carryover</p>
              <p className="text-white text-2xl font-bold">£{simulationResult.jackpotCarryover.toFixed(2)}</p>
            </div>
          </div>

          {/* Winning numbers display */}
          <div className="mb-6">
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Winning Numbers</p>
            <div className="flex gap-2">
              {simulationResult.winningNumbers.map((num, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 font-bold text-sm flex items-center justify-center"
                >
                  {num}
                </div>
              ))}
            </div>
          </div>

          {/* Winner preview */}
          <div className="mb-6">
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">
              Winners ({simulationResult.winnerPreview.length})
            </p>
            {simulationResult.winnerPreview.length === 0 ? (
              <p className="text-slate-500 text-sm">
                No winners this draw.
                {!simulationResult.hasJackpotWinner && ' Jackpot will roll over.'}
              </p>
            ) : (
              <div className="space-y-1">
                {simulationResult.winnerPreview.map((w, i) => (
                  <div key={i} className="flex justify-between text-sm bg-slate-800 rounded px-3 py-2">
                    <span className="text-slate-300">
                      {w.matchType === 5 ? '🏆 Jackpot' : w.matchType === 4 ? '🥈 4-Match' : '🥉 3-Match'}
                    </span>
                    <span className="text-slate-400 text-xs font-mono">{w.userId.slice(0, 8)}...</span>
                    <span className="text-emerald-400 font-medium">£{w.prizeAmount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {simulationDrawId && (
            <button
              onClick={() => handlePublish(simulationDrawId)}
              disabled={publishingId !== null}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              {publishingId ? 'Publishing...' : 'Publish This Draw →'}
            </button>
          )}
        </div>
      )}

      {/* ── Draws List ───────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-white font-semibold text-lg">All Draws</h2>
        </div>

        {draws.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No draws created yet. Create your first draw above.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-slate-500 text-xs uppercase px-6 py-3">Month</th>
                <th className="text-left text-slate-500 text-xs uppercase px-6 py-3">Type</th>
                <th className="text-left text-slate-500 text-xs uppercase px-6 py-3">Status</th>
                <th className="text-left text-slate-500 text-xs uppercase px-6 py-3">Entries</th>
                <th className="text-left text-slate-500 text-xs uppercase px-6 py-3">Winning #s</th>
                <th className="text-right text-slate-500 text-xs uppercase px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {draws.map(draw => (
                <tr key={draw.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="px-6 py-4 text-white font-medium">
                    {formatMonth(draw.draw_month)}
                  </td>
                  <td className="px-6 py-4 text-slate-400 capitalize">{draw.draw_type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[draw.status]}`}>
                      {draw.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{draw.total_entries || '—'}</td>
                  <td className="px-6 py-4">
                    {draw.winning_numbers ? (
                      <div className="flex gap-1">
                        {draw.winning_numbers.map((n: number, i: number) => (
                          <span key={i} className="w-6 h-6 rounded-full bg-slate-700 text-white text-xs flex items-center justify-center font-bold">
                            {n}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {draw.status === 'draft' && (
                      <button
                        onClick={() => handleSimulate(draw.id)}
                        disabled={simulatingId === draw.id}
                        className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {simulatingId === draw.id ? 'Simulating...' : 'Simulate'}
                      </button>
                    )}
                    {draw.status === 'simulated' && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleSimulate(draw.id)}
                          disabled={simulatingId === draw.id}
                          className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          Re-simulate
                        </button>
                        <button
                          onClick={() => handlePublish(draw.id)}
                          disabled={publishingId === draw.id}
                          className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {publishingId === draw.id ? 'Publishing...' : 'Publish'}
                        </button>
                      </div>
                    )}
                    {draw.status === 'published' && (
                      <span className="text-slate-600 text-xs">Published</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}