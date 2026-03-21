// app/page.tsx — full replacement
import { createClient } from '@/lib/supabase/server'
import HomeClient from '@/components/home/HomeClient'

export default async function HomePage() {
  const supabase = await createClient()

  const [
    { count: subscriberCount },
    { data: allCharities },
    { data: latestDraw },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active'),

    // Fetch ALL active charities, sorted so featured ones come first.
    // This way if nothing is featured, we still show the first 3.
    supabase
      .from('charities')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: true }),

    supabase
      .from('draws')
      .select('jackpot_amount, draw_month')
      .eq('status', 'published')
      .order('draw_month', { ascending: false })
      .limit(1)
      .single(),
  ])

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('charity_contribution')
    .eq('status', 'active')

  const totalCharityRaised = subs?.reduce(
    (sum, s) => sum + (s.charity_contribution || 0), 0
  ) || 0

  // Show up to 3 featured charities on the homepage.
  // If none are featured, fall back to first 3 active charities.
  const featuredCharities = (allCharities || []).filter(c => c.is_featured).slice(0, 3)
  const displayCharities = featuredCharities.length > 0
    ? featuredCharities
    : (allCharities || []).slice(0, 3)

  return (
    <HomeClient
      subscriberCount={subscriberCount || 0}
      featuredCharities={displayCharities}
      currentJackpot={latestDraw?.jackpot_amount || 500}
      totalCharityRaised={totalCharityRaised}
      hasMoreCharities={(allCharities || []).length > 3}
    />
  )
}