// app/admin/users/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select(`*, subscriptions (plan, status, current_period_end)`)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-slate-400 mt-1">{users?.length || 0} total users</p>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              {['Name', 'Email', 'Role', 'Subscription', 'Plan', 'Renews', 'Joined'].map(h => (
                <th key={h} className="text-left text-slate-500 text-xs uppercase px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(users || []).map((user: any) => {
              const sub = user.subscriptions?.[0]
              return (
                <tr key={user.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                  <td className="px-4 py-3 text-white font-medium">{user.full_name || '—'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-700 text-slate-400'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      user.subscription_status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                      user.subscription_status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                      'bg-slate-700 text-slate-400'
                    }`}>
                      {user.subscription_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs capitalize">{sub?.plan || '—'}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {sub?.current_period_end
                      ? new Date(sub.current_period_end).toLocaleDateString('en-GB')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(user.created_at).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}