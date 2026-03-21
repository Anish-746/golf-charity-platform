// app/api/admin/winners/verify/route.ts
// Handles approve, reject, and mark_paid actions on winner rows.
// Admin only.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { winnerId, action } = await request.json()
  const serviceSupabase = getServiceClient()

  // Build the update payload based on the action
  // Each action represents a valid state transition in the lifecycle
  let update: Record<string, unknown> = {}

  if (action === 'approve') {
    update = { verification_status: 'approved' }
  } else if (action === 'reject') {
    update = { verification_status: 'rejected', proof_url: null }
    // Clearing proof_url forces the winner to re-upload
  } else if (action === 'mark_paid') {
    update = {
      payout_status: 'paid',
      paid_at: new Date().toISOString(),
    }
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  const { error } = await serviceSupabase
    .from('winners')
    .update(update)
    .eq('id', winnerId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}