// app/api/admin/charities/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorised', supabase, user: null }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Forbidden', supabase, user: null }
  return { error: null, supabase, user }
}

export async function POST(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return NextResponse.json({ error }, { status: 403 })

  const { name, description, website, is_featured } = await request.json()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const { data, error: dbError } = await supabase
    .from('charities')
    .insert({ name, description, website, is_featured, is_active: true })
    .select().single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ charity: data })
}

export async function PATCH(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return NextResponse.json({ error }, { status: 403 })

  const { id, name, description, website, is_featured } = await request.json()

  const { error: dbError } = await supabase
    .from('charities')
    .update({ name, description, website, is_featured })
    .eq('id', id)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const { error, supabase } = await verifyAdmin()
  if (error) return NextResponse.json({ error }, { status: 403 })

  const { id } = await request.json()

  // Soft delete — set inactive rather than destroying the record
  // (existing users who selected this charity keep the reference intact)
  const { error: dbError } = await supabase
    .from('charities')
    .update({ is_active: false })
    .eq('id', id)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}