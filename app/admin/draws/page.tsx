// app/admin/draws/page.tsx
import { createClient } from '@/lib/supabase/server'
import DrawManager from '@/components/admin/DrawManager'

export default async function DrawsPage() {
  const supabase = await createClient()

  const { data: draws } = await supabase
    .from('draws')
    .select('*')
    .order('draw_month', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Draw Management</h1>
        <p className="text-slate-400 mt-1">Create, simulate, and publish monthly draws</p>
      </div>
      <DrawManager draws={draws || []} />
    </div>
  )
}