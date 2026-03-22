// app/page.tsx — full replacement
import { createClient } from '@/lib/supabase/server'
import { HOMEPAGE_CHARITIES_LIMIT } from '@/lib/constants'
import HomeClient from '@/components/home/HomeClient'

export default async function HomePage() {
  const supabase = await createClient()

  const [
    { count: subscriberCount },
    { data: allCharities },
    { data: latestDraw },
    { data: subscriptions },
  ] = await Promise.all([
    // Optimize: count only, with limit for safety
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active')
      .limit(999999),

    // Fetch charities with limit to avoid downloading unnecessary data
    supabase
      .from('charities')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(HOMEPAGE_CHARITIES_LIMIT + 1), // +1 to detect if there are more

    supabase
      .from('draws')
      .select('jackpot_amount, draw_month')
      .eq('status', 'published')
      .order('draw_month', { ascending: false })
      .limit(1)
      .single(),

    // Optimize: fetch only charity_contribution for calculation
    supabase
      .from('subscriptions')
      .select('charity_contribution')
      .eq('status', 'active'),
  ])

  const totalCharityRaised = subscriptions?.reduce(
    (sum, s) => sum + (s.charity_contribution || 0), 0
  ) || 0

  // Show up to 3 featured charities on the homepage.
  // If none are featured, fall back to first 3 active charities.
  const charities = allCharities || []
  const featuredCharities = charities.filter(c => c.is_featured).slice(0, 3)
  const displayCharities = featuredCharities.length > 0
    ? featuredCharities
    : charities.slice(0, 3)

  // Check if there are more charities beyond what we're displaying
  const hasMoreCharities = charities.length > HOMEPAGE_CHARITIES_LIMIT

  return (
    <HomeClient
      subscriberCount={subscriberCount || 0}
      featuredCharities={displayCharities}
      currentJackpot={latestDraw?.jackpot_amount || 500}
      totalCharityRaised={totalCharityRaised}
      hasMoreCharities={hasMoreCharities}
    />
  )
}