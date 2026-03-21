// components/home/DonateClient.tsx
'use client'

import { useState } from 'react'

type SimpleCharity = { id: string; name: string; description: string | null }

const PRESET_AMOUNTS = [5, 10, 25, 50, 100]

export default function DonateClient({ charities }: { charities: SimpleCharity[] }) {
  const [selectedCharity, setSelectedCharity] = useState('')
  const [amount, setAmount] = useState<number | ''>('')
  const [customAmount, setCustomAmount] = useState('')
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const finalAmount = amount || parseFloat(customAmount) || 0

  const handleDonate = async () => {
    setError(null)
    if (!selectedCharity) { setError('Please select a charity'); return }
    if (finalAmount < 1) { setError('Minimum donation is £1'); return }
    if (!donorEmail) { setError('Email is required'); return }

    setIsLoading(true)

    const res = await fetch('/api/donate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        charityId: selectedCharity,
        amount: finalAmount,
        donorName,
        donorEmail,
      }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error); setIsLoading(false); return }

    // Redirect to Stripe checkout
    window.location.href = data.url
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 space-y-6">

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Charity selector */}
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">Choose a charity</label>
        <select
          value={selectedCharity}
          onChange={e => setSelectedCharity(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
        >
          <option value="" disabled>Select a charity...</option>
          {charities.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {selectedCharity && (
          <p className="text-slate-500 text-xs mt-1.5">
            {charities.find(c => c.id === selectedCharity)?.description}
          </p>
        )}
      </div>

      {/* Preset amount buttons */}
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">Donation amount</label>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {PRESET_AMOUNTS.map(preset => (
            <button
              key={preset}
              onClick={() => { setAmount(preset); setCustomAmount('') }}
              className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${
                amount === preset
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              £{preset}
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">£</span>
          <input
            type="number"
            placeholder="Custom amount"
            value={customAmount}
            onChange={e => { setCustomAmount(e.target.value); setAmount('') }}
            min="1"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-7 pr-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Donor details */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">Your name</label>
          <input
            type="text"
            placeholder="Optional"
            value={donorName}
            onChange={e => setDonorName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 placeholder-slate-600"
          />
        </div>
        <div>
          <label className="block text-slate-300 text-sm font-medium mb-2">Email <span className="text-red-400">*</span></label>
          <input
            type="email"
            placeholder="For receipt"
            value={donorEmail}
            onChange={e => setDonorEmail(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 placeholder-slate-600"
          />
        </div>
      </div>

      {/* Summary + submit */}
      {finalAmount > 0 && selectedCharity && (
        <div className="bg-slate-800 rounded-xl px-4 py-3 flex justify-between items-center text-sm">
          <span className="text-slate-400">
            Donating to {charities.find(c => c.id === selectedCharity)?.name}
          </span>
          <span className="text-white font-bold text-lg">£{finalAmount.toFixed(2)}</span>
        </div>
      )}

      <button
        onClick={handleDonate}
        disabled={isLoading || finalAmount < 1 || !selectedCharity}
        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black py-4 rounded-xl transition-all hover:scale-105 active:scale-95 text-base"
      >
        {isLoading ? 'Redirecting...' : `Donate £${finalAmount > 0 ? finalAmount.toFixed(2) : '—'} →`}
      </button>

      <p className="text-center text-slate-600 text-xs">
        Processed securely by Stripe. {"You'll receive a receipt by email."}
      </p>
    </div>
  )
}