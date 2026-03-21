// app/admin/reports/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function AdminReportsPage() {
  const supabase = await createClient()

  const [
    { count: totalUsers },
    { count: activeSubscribers },
    { data: subscriptions },
    { data: draws },
    { data: winners },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    supabase.from('subscriptions').select('prize_pool_contribution, charity_contribution').eq('status', 'active'),
    supabase.from('draws').select('status, total_entries, jackpot_amount').order('draw_month', { ascending: false }),
    supabase.from('winners').select('prize_amount, payout_status, match_type'),
  ])

  const totalPrizePool = subscriptions?.reduce((s, r) => s + (r.prize_pool_contribution || 0), 0) || 0
  const totalCharity = subscriptions?.reduce((s, r) => s + (r.charity_contribution || 0), 0) || 0
  const totalPaidOut = winners?.filter(w => w.payout_status === 'paid').reduce((s, w) => s + w.prize_amount, 0) || 0
  const publishedDraws = draws?.filter(d => d.status === 'published').length || 0
  const totalEntries = draws?.reduce((s, d) => s + (d.total_entries || 0), 0) || 0

  const stats = [
    { label: 'Total Users', value: totalUsers || 0, color: 'text-white' },
    { label: 'Active Subscribers', value: activeSubscribers || 0, color: 'text-emerald-400' },
    { label: 'Monthly Prize Pool', value: `£${totalPrizePool.toFixed(2)}`, color: 'text-emerald-400' },
    { label: 'Total Charity Raised', value: `£${totalCharity.toFixed(2)}`, color: 'text-blue-400' },
    { label: 'Total Paid to Winners', value: `£${totalPaidOut.toFixed(2)}`, color: 'text-yellow-400' },
    { label: 'Draws Published', value: publishedDraws, color: 'text-white' },
    { label: 'Total Draw Entries', value: totalEntries, color: 'text-white' },
    { label: 'Total Winners', value: winners?.length || 0, color: 'text-white' },
  ]

  // Match type breakdown
  const matchBreakdown = [5, 4, 3].map(type => ({
    label: type === 5 ? 'Jackpot (5-match)' : type === 4 ? '4-Match' : '3-Match',
    count: winners?.filter(w => w.match_type === type).length || 0,
    paid: winners?.filter(w => w.match_type === type && w.payout_status === 'paid').length || 0,
  }))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
        <p className="text-slate-400 mt-1">Platform-wide statistics</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-slate-900 rounded-xl p-4 border border-slate-800">
            <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Winners breakdown */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-white font-semibold mb-4">Winners by Match Type</h2>
        <div className="space-y-3">
          {matchBreakdown.map(row => (
            <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-800/50">
              <span className="text-slate-300 text-sm">{row.label}</span>
              <div className="flex gap-6 text-sm">
                <span className="text-slate-400">{row.count} winners</span>
                <span className="text-emerald-400">{row.paid} paid</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}