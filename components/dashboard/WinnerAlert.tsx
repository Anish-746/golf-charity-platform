// components/dashboard/WinnerAlert.tsx
// Shows at the top of the dashboard when a user has won something.
// 'use client' because the proof upload form needs browser interactions.
'use client'

import { useState, useRef } from 'react'
import type { Winner } from '@/types/database'

// We need draw info alongside winner info for display
type WinnerWithDraw = Winner & {
  draws: { draw_month: string } | null
}

const matchLabels = {
  5: { label: 'Jackpot Winner! 🏆', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  4: { label: '4-Match Winner! 🥈', color: 'text-slate-300', bg: 'bg-slate-400/10 border-slate-400/30' },
  3: { label: '3-Match Winner! 🥉', color: 'text-amber-600', bg: 'bg-amber-700/10 border-amber-700/30' },
}

export default function WinnerAlert({ winners }: { winners: WinnerWithDraw[] }) {
  // Only show wins that need attention (pending verification or recently approved)
  const actionableWins = winners.filter(
    w => w.verification_status === 'pending' || w.payout_status === 'pending'
  )

  if (actionableWins.length === 0) return null

  return (
    <div className="space-y-3 mb-6">
      {actionableWins.map(winner => (
        <WinnerCard key={winner.id} winner={winner} />
      ))}
    </div>
  )
}

function WinnerCard({ winner }: { winner: WinnerWithDraw }) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const matchInfo = matchLabels[winner.match_type]
  const drawMonth = winner.draws?.draw_month
    ? new Date(winner.draws.draw_month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : 'Recent Draw'

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type and size before uploading
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload an image file (JPG, PNG, WebP)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {  // 5MB limit
      setUploadError('File must be under 5MB')
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new globalThis.FormData()
      formData.append('file', file)
      formData.append('winnerId', winner.id)

      const res = await fetch('/api/winners/upload-proof', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setUploadSuccess(true)
      // Refresh the page to show updated status
      window.location.reload()
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={`rounded-xl p-5 border ${matchInfo.bg}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`font-bold text-lg ${matchInfo.color}`}>{matchInfo.label}</p>
          <p className="text-slate-400 text-sm mt-0.5">{drawMonth} Draw</p>
        </div>
        <div className="text-right">
          <p className="text-white text-2xl font-bold">£{winner.prize_amount.toFixed(2)}</p>
          <p className={`text-xs mt-0.5 ${
            winner.payout_status === 'paid' ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            {winner.payout_status === 'paid' ? '✓ Paid' : 'Payment pending'}
          </p>
        </div>
      </div>

      {/* Verification status flow */}
      <div className="mt-4">
        {winner.verification_status === 'pending' && !winner.proof_url && (
          // Step 1: Winner needs to upload proof
          <div>
            <p className="text-slate-300 text-sm mb-3">
              To claim your prize, please upload a screenshot of your scores from your golf app or scorecard.
            </p>
            {uploadError && (
              <p className="text-red-400 text-xs mb-2 bg-red-400/10 px-3 py-2 rounded-lg">
                {uploadError}
              </p>
            )}
            {uploadSuccess ? (
              <p className="text-emerald-400 text-sm">✓ Proof uploaded — awaiting admin review</p>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProofUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isUploading ? 'Uploading...' : '📎 Upload Score Proof'}
                </button>
              </div>
            )}
          </div>
        )}

        {winner.verification_status === 'pending' && winner.proof_url && (
          // Step 2: Proof uploaded, waiting for admin
          <div className="flex items-center gap-2 text-amber-400 text-sm">
            <span>⏳</span>
            <span>Proof submitted — admin review in progress</span>
          </div>
        )}

        {winner.verification_status === 'approved' && winner.payout_status === 'pending' && (
          // Step 3: Approved, waiting for payment
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <span>✓</span>
            <span>Verified! Payment is being processed.</span>
          </div>
        )}

        {winner.verification_status === 'rejected' && (
          // Rejected — they can try re-uploading
          <div>
            <p className="text-red-400 text-sm mb-2">
              ✗ Proof was rejected. Please re-upload a clearer screenshot.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProofUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Re-upload Proof
            </button>
          </div>
        )}
      </div>
    </div>
  )
}