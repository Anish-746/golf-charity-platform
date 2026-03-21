// app/api/admin/draw/route.ts
// POST — creates a new draw in 'draft' status
// Admin only — we verify role before doing anything

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { drawMonth, drawType } = await request.json()

  // Check a draw doesn't already exist for this month
  const { data: existing } = await supabase
    .from('draws')
    .select('id')
    .eq('draw_month', drawMonth)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'A draw already exists for this month' }, { status: 409 })
  }

  const { data: draw, error } = await supabase
    .from('draws')
    .insert({
      draw_month: drawMonth,
      draw_type: drawType,
      status: 'draft',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ draw })
}