// app/api/stripe/checkout/route.ts
// This Route Handler creates a Stripe Checkout Session.
// It runs on the SERVER — the Stripe secret key never touches the browser.

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

// Initialize Stripe with your secret key.
// The second argument sets the API version — always pin to a specific version
// so Stripe's API changes don't break your code unexpectedly.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Verify the user is logged in — we need their ID to link the Stripe
  // customer back to their Supabase profile after payment
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Fetch their profile to get their name and existing Stripe customer ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, stripe_customer_id')
    .eq('id', user.id)
    .single()

  // Read which plan the user chose from the request body
  const { plan } = await request.json()
  const priceId = plan === 'yearly'
    ? process.env.STRIPE_YEARLY_PRICE_ID!
    : process.env.STRIPE_MONTHLY_PRICE_ID!

  // Stripe Customer logic: we don't want to create a new Stripe customer
  // every time the same user subscribes. So we check if they already have
  // a stripe_customer_id stored in their profile, and reuse it.
  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    // First time subscribing — create a new Stripe Customer object
    const customer = await stripe.customers.create({
      email: user.email!,
      name: profile?.full_name || undefined,
      // We store the Supabase user ID in Stripe's metadata so we can
      // identify this customer when the webhook fires
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id

    // Save the Stripe customer ID back to the user's profile
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  // Create the Checkout Session — this is the actual payment page URL
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',        // as opposed to 'payment' (one-time) or 'setup'
    line_items: [{ price: priceId, quantity: 1 }],
    
    // Where to send the user after successful payment
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?subscribed=true`,
    
    // Where to send them if they abandon the checkout
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/subscribe`,

    // This metadata travels with the session through Stripe's system
    // and arrives in your webhook — how you know WHICH user just paid
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
  })

  // Return the checkout URL to the browser so it can redirect there
  return NextResponse.json({ url: session.url })
}