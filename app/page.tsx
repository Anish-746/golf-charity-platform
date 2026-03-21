// app/page.tsx
// Public homepage — server component that fetches live stats for display
import { createClient } from '@/lib/supabase/server'
import HomeClient from '@/components/home/HomeClient'

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch live stats to show on the homepage
  const [
    { count: subscriberCount },
    { data: charities },
    { data: latestDraw },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    supabase.from('charities').select('*').eq('is_active', true).eq('is_featured', true).limit(3),
    supabase.from('draws').select('jackpot_amount, draw_month').eq('status', 'published').order('draw_month', { ascending: false }).limit(1).single(),
  ])

  // Calculate total raised for charity across all subscriptions
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('charity_contribution')
    .eq('status', 'active')

  const totalCharityRaised = subs?.reduce(
    (sum, s) => sum + (s.charity_contribution || 0), 0
  ) || 0

  return (
    <HomeClient
      subscriberCount={subscriberCount || 0}
      featuredCharities={charities || []}
      currentJackpot={latestDraw?.jackpot_amount || 500}
      totalCharityRaised={totalCharityRaised}
    />
  )
}