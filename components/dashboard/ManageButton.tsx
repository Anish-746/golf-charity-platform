'use client'

export default function ManageButton() {
  const handleManage = async () => {
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }
  return (
    <button
      onClick={handleManage}
      className="text-slate-400 hover:text-white text-sm underline transition-colors"
    >
      Manage or cancel subscription →
    </button>
  )
}