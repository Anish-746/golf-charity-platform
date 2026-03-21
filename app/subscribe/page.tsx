// app/subscribe/page.tsx
// This is a CLIENT component because clicking a plan button
// needs to call our API route and redirect to Stripe — that's browser work.
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// The pricing data — kept here rather than in a database
// since pricing rarely changes and doesn't need to be dynamic
const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '£9.99',
    period: 'per month',
    description: 'Full access to all draws, score tracking, and charity giving.',
    features: ['Monthly prize draw entry', 'Score tracking', 'Charity contribution', 'Cancel anytime'],
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '£99.99',
    period: 'per year',
    description: 'Everything in Monthly, with 2 months free.',
    features: ['Everything in Monthly', '2 months free (save £19.89)', 'Priority support'],
    highlighted: true,   // visually distinguish the recommended plan
  },
]

export default function SubscribePage() {
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    setLoadingPlan(planId)
    setError(null)

    try {
      // Call our API route to create the Stripe Checkout Session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect the user to Stripe's hosted checkout page
      // router.push works here but window.location.href is more reliable
      // for cross-origin redirects (Stripe's domain is different from yours)
      window.location.href = data.url
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">Choose your plan</h1>
          <p className="text-slate-400">Every subscription enters you into monthly draws and funds your chosen charity.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-xl p-6 border transition-all ${
                plan.highlighted
                  ? 'bg-emerald-500/10 border-emerald-500/50'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              {plan.highlighted && (
                <span className="inline-block bg-emerald-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full mb-4">
                  BEST VALUE
                </span>
              )}

              <h2 className="text-white text-xl font-bold">{plan.name}</h2>
              <div className="mt-2 mb-4">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-slate-400 text-sm ml-2">{plan.period}</span>
              </div>

              <p className="text-slate-400 text-sm mb-4">{plan.description}</p>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-slate-300 text-sm">
                    <span className="text-emerald-400">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loadingPlan !== null}
                className={`w-full font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  plan.highlighted
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {loadingPlan === plan.id ? 'Redirecting to Stripe...' : `Subscribe ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          Payments processed securely by Stripe. Cancel anytime from your dashboard.
        </p>
      </div>
    </div>
  )
}