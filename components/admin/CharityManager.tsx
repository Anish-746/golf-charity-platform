// components/admin/CharityManager.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Charity } from '@/types/database'

const emptyForm = { name: '', description: '', website: '', is_featured: false }

export default function CharityManager({ charities }: { charities: Charity[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Name is required'); return }
    setLoading(true)
    setError(null)

    const res = await fetch('/api/admin/charities', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, id: editingId }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error) }
    else {
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      router.refresh()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this charity? Users who selected it will keep their selection.')) return
    await fetch('/api/admin/charities', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.refresh()
  }

  const startEdit = (charity: Charity) => {
    setForm({
      name: charity.name,
      description: charity.description || '',
      website: charity.website || '',
      is_featured: charity.is_featured,
    })
    setEditingId(charity.id)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
          <h2 className="text-white font-semibold mb-4">
            {editingId ? 'Edit Charity' : 'Add New Charity'}
          </h2>
          {error && <p className="text-red-400 text-sm mb-4 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}
          <div className="space-y-3">
            <input
              placeholder="Charity name *"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none"
            />
            <input
              placeholder="Website URL"
              value={form.website}
              onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
            />
            <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                className="accent-emerald-500"
              />
              Feature on homepage
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              {loading ? 'Saving...' : editingId ? 'Save Changes' : 'Add Charity'}
            </button>
            <button
              onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm) }}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          + Add Charity
        </button>
      )}

      {/* Charities table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              {['Name', 'Description', 'Featured', 'Status', 'Total Raised', 'Actions'].map(h => (
                <th key={h} className="text-left text-slate-500 text-xs uppercase px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {charities.map(charity => (
              <tr key={charity.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                <td className="px-4 py-3 text-white font-medium">{charity.name}</td>
                <td className="px-4 py-3 text-slate-400 text-xs max-w-xs truncate">{charity.description}</td>
                <td className="px-4 py-3">
                  {charity.is_featured
                    ? <span className="text-emerald-400 text-xs">✓ Featured</span>
                    : <span className="text-slate-600 text-xs">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${charity.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {charity.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300 text-xs">£{(charity.total_raised || 0).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(charity)} className="text-blue-400 hover:text-blue-300 text-xs transition-colors">Edit</button>
                    <button onClick={() => handleDelete(charity.id)} className="text-red-400 hover:text-red-300 text-xs transition-colors">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}