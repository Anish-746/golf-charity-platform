// components/dashboard/DrawModule.tsx
// Shows recent draws and the user's winnings history.
// No interactivity needed — pure display, so no 'use client'.

import type { Draw, Winner } from '@/types/database'

const matchLabels = { 5: 'Jackpot 🏆', 4: '4-Match 🥈', 3: '3-Match 🥉' }
const payoutColors = {
  paid: 'text-emerald-400',
  pending: 'text-amber-400',
}

export default function DrawModule({ draws, winnings }: { draws: Draw[], winnings: Winner[] }) {
  const totalWon = winnings.reduce((sum, w) => sum + w.prize_amount, 0)

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <h2 className="text-white font-semibold text-lg mb-4">Draw Summary</h2>

      {/* Winnings total */}
      <div className="bg-slate-800 rounded-lg px-4 py-3 mb-4">
        <p className="text-slate-400 text-xs uppercase tracking-wide">Total Winnings</p>
        <p className="text-emerald-400 text-2xl font-bold mt-1">
          £{totalWon.toFixed(2)}
        </p>
      </div>

      {/* Recent draws */}
      {draws.length === 0 ? (
        <p className="text-slate-500 text-sm">No published draws yet.</p>
      ) : (
        <div className="space-y-2">
          <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Recent Draws</p>
          {draws.map((draw) => {
            // Check if the user won this draw
            const userWin = winnings.find((w) => w.draw_id === draw.id)
            return (
              <div key={draw.id} className="flex items-center justify-between bg-slate-800 rounded-lg px-3 py-2.5">
                <div>
                  <p className="text-white text-sm font-medium">
                    {new Date(draw.draw_month).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-slate-500 text-xs">{draw.total_entries} entries</p>
                </div>
                <div className="text-right">
                  {userWin ? (
                    <div>
                      <p className="text-emerald-400 text-xs font-medium">
                        {matchLabels[userWin.match_type]}
                      </p>
                      <p className={`text-xs ${payoutColors[userWin.payout_status]}`}>
                        £{userWin.prize_amount.toFixed(2)} · {userWin.payout_status}
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-600 text-xs">No win</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}