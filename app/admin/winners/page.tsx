// app/admin/winners/page.tsx
import { createClient } from '@/lib/supabase/server'
import WinnersManager from '@/components/admin/WinnersManager'

export default async function AdminWinnersPage() {
  const supabase = await createClient()

  // Fetch all winners with their user profile and draw info joined
  const { data: winners } = await supabase
    .from('winners')
    .select(`
      *,
      profiles (full_name, email),
      draws (draw_month, winning_numbers)
    `)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Winners Management</h1>
        <p className="text-slate-400 mt-1">Review proofs, verify winners, and track payouts</p>
      </div>
      <WinnersManager winners={winners || []} />
    </div>
  )
}