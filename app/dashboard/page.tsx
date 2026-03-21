// app/dashboard/page.tsx
// SERVER COMPONENT — fetches all data before sending HTML to browser.
// Uses Promise.all to run all queries in parallel for speed.

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import ScoreModule from '@/components/dashboard/ScoreModule'
import CharityModule from '@/components/dashboard/CharityModule'
import SubscriptionModule from '@/components/dashboard/SubscriptionModule'
import DrawModule from '@/components/dashboard/DrawModule'
import type { Profile, Score, Charity, Draw, Winner } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Run all queries at the same time with Promise.all
  // Think of this like sending 5 letters at once instead of waiting
  // for a reply before sending the next one.
  const [
    { data: profile },
    { data: scores },
    { data: charities },
    { data: draws },
    { data: winnings },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('scores').select('*').eq('user_id', user.id).order('score_date', { ascending: false }),
    supabase.from('charities').select('*').eq('is_active', true).order('is_featured', { ascending: false }),
    supabase.from('draws').select('*').eq('status', 'published').order('draw_month', { ascending: false }).limit(3),
    supabase.from('winners').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  // Find the charity this user has currently selected (for display)
  const selectedCharity = charities?.find(
    (c: Charity) => c.id === profile?.selected_charity_id
  ) || null

  return (
    <div className="min-h-screen bg-slate-950">

      {/* Top navigation bar */}
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-white font-bold text-xl">Tee It Forward</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm">
              {profile?.full_name}
            </span>
            <form action={logout}>
              <button type="submit" className="text-slate-400 hover:text-white text-sm transition-colors">
                Log out
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Main dashboard content */}
      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {profile?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 mt-1">{"Here's your Tee It Forward summary"}</p>
        </div>

        {/* Top row: Subscription + Draw modules side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <SubscriptionModule profile={profile as Profile} />
          <DrawModule draws={(draws || []) as Draw[]} winnings={(winnings || []) as Winner[]} />
        </div>

        {/* Bottom row: Score entry + Charity selection */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score module takes 2/3 of the width on large screens */}
          <div className="lg:col-span-2">
            <ScoreModule scores={(scores || []) as Score[]} />
          </div>
          {/* Charity module takes 1/3 */}
          <div>
            <CharityModule
              charities={(charities || []) as Charity[]}
              selectedCharity={selectedCharity as Charity | null}
              currentPercentage={profile?.charity_percentage || 10}
            />
          </div>
        </div>

      </main>
    </div>
  )
}