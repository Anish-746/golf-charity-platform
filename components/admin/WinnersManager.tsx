// components/admin/WinnersManager.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type WinnerRow = {
  id: string
  match_type: 3 | 4 | 5
  prize_amount: number
  verification_status: 'pending' | 'approved' | 'rejected'
  payout_status: 'pending' | 'paid'
  proof_url: string | null
  paid_at: string | null
  created_at: string
  profiles: { full_name: string | null; email: string | null } | null
  draws: { draw_month: string; winning_numbers: number[] } | null
}

const verificationColors = {
  pending:  'bg-amber-500/20 text-amber-400',
  approved: 'bg-emerald-500/20 text-emerald-400',
  rejected: 'bg-red-500/20 text-red-400',
}

const matchLabels = { 5: '🏆 Jackpot', 4: '🥈 4-Match', 3: '🥉 3-Match' }

export default function WinnersManager({ winners }: { winners: WinnerRow[] }) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const handleVerify = async (
    winnerId: string,
    action: 'approve' | 'reject' | 'mark_paid'
  ) => {
    setLoadingId(winnerId)

    const res = await fetch('/api/admin/winners/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winnerId, action }),
    })

    const data = await res.json()
    if (!res.ok) {
      alert(data.error)
    } else {
      router.refresh()
    }
    setLoadingId(null)
  }

  const filtered = filterStatus === 'all'
    ? winners
    : winners.filter(w =>
        filterStatus === 'unpaid'
          ? w.payout_status === 'pending' && w.verification_status === 'approved'
          : w.verification_status === filterStatus
      )

  // Summary stats for the top bar
  const pendingReview = winners.filter(w => w.verification_status === 'pending' && w.proof_url).length
  const awaitingPayment = winners.filter(w => w.verification_status === 'approved' && w.payout_status === 'pending').length
  const totalPaid = winners.filter(w => w.payout_status === 'paid').reduce((s, w) => s + w.prize_amount, 0)

  return (
    <div className="space-y-6">

      {/* Proof image preview modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <img src={previewUrl} alt="Winner proof" className="w-full rounded-xl" />
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-3 right-3 bg-black/60 text-white w-8 h-8 rounded-full text-sm hover:bg-black/80"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending Review', value: pendingReview, color: 'text-amber-400' },
          { label: 'Awaiting Payment', value: awaitingPayment, color: 'text-blue-400' },
          { label: 'Total Paid Out', value: `£${totalPaid.toFixed(2)}`, color: 'text-emerald-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-slate-400 text-xs uppercase tracking-wide">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending Review' },
          { key: 'approved', label: 'Approved' },
          { key: 'unpaid', label: 'Awaiting Payment' },
          { key: 'rejected', label: 'Rejected' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterStatus === tab.key
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Winners table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No winners in this category.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                {['Winner', 'Draw', 'Prize', 'Match', 'Proof', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-slate-500 text-xs uppercase px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(winner => (
                <tr key={winner.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">

                  {/* Winner info */}
                  <td className="px-4 py-4">
                    <p className="text-white font-medium text-sm">
                      {winner.profiles?.full_name || 'Unknown'}
                    </p>
                    <p className="text-slate-500 text-xs">{winner.profiles?.email}</p>
                  </td>

                  {/* Draw month */}
                  <td className="px-4 py-4 text-slate-400 text-xs">
                    {winner.draws?.draw_month
                      ? new Date(winner.draws.draw_month).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
                      : '—'}
                  </td>

                  {/* Prize amount */}
                  <td className="px-4 py-4 text-emerald-400 font-bold">
                    £{winner.prize_amount.toFixed(2)}
                  </td>

                  {/* Match type */}
                  <td className="px-4 py-4 text-slate-300 text-xs">
                    {matchLabels[winner.match_type]}
                  </td>

                  {/* Proof thumbnail */}
                  <td className="px-4 py-4">
                    {winner.proof_url ? (
                      <button
                        onClick={() => setPreviewUrl(winner.proof_url!)}
                        className="text-blue-400 hover:text-blue-300 text-xs underline"
                      >
                        View proof
                      </button>
                    ) : (
                      <span className="text-slate-600 text-xs">Not uploaded</span>
                    )}
                  </td>

                  {/* Verification + payout status */}
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${verificationColors[winner.verification_status]}`}>
                        {winner.verification_status}
                      </span>
                      <p className={`text-xs ${winner.payout_status === 'paid' ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {winner.payout_status === 'paid'
                          ? `Paid ${winner.paid_at ? new Date(winner.paid_at).toLocaleDateString('en-GB') : ''}`
                          : 'Not paid'}
                      </p>
                    </div>
                  </td>

                  {/* Action buttons */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      {/* Approve/reject — only when proof uploaded and status pending */}
                      {winner.verification_status === 'pending' && winner.proof_url && (
                        <>
                          <button
                            onClick={() => handleVerify(winner.id, 'approve')}
                            disabled={loadingId === winner.id}
                            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-2 py-1 rounded text-xs transition-colors disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleVerify(winner.id, 'reject')}
                            disabled={loadingId === winner.id}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2 py-1 rounded text-xs transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {/* Mark as paid — only when approved and not yet paid */}
                      {winner.verification_status === 'approved' && winner.payout_status === 'pending' && (
                        <button
                          onClick={() => handleVerify(winner.id, 'mark_paid')}
                          disabled={loadingId === winner.id}
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-2 py-1 rounded text-xs transition-colors disabled:opacity-50"
                        >
                          Mark Paid
                        </button>
                      )}

                      {/* No actions available */}
                      {winner.verification_status === 'approved' && winner.payout_status === 'paid' && (
                        <span className="text-slate-600 text-xs">Complete</span>
                      )}

                      {winner.verification_status === 'pending' && !winner.proof_url && (
                        <span className="text-slate-600 text-xs">Awaiting proof</span>
                      )}
                    </div>
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