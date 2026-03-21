// app/admin/charities/page.tsx
import { createClient } from '@/lib/supabase/server'
import CharityManager from '@/components/admin/CharityManager'

export default async function AdminCharitiesPage() {
  const supabase = await createClient()
  const { data: charities } = await supabase
    .from('charities')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Charity Management</h1>
        <p className="text-slate-400 mt-1">Add, edit, and manage charity listings</p>
      </div>
      <CharityManager charities={charities || []} />
    </div>
  )
}