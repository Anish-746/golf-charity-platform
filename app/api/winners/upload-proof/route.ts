// app/api/winners/upload-proof/route.ts
// Accepts a file upload, stores it in Supabase Storage,
// and updates the winner row with the proof URL.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File
  const winnerId = formData.get('winnerId') as string

  if (!file || !winnerId) {
    return NextResponse.json({ error: 'File and winner ID required' }, { status: 400 })
  }

  // Verify this winner row actually belongs to this user
  // This prevents users from submitting proof for other people's wins
  const { data: winner } = await supabase
    .from('winners')
    .select('id, user_id, verification_status')
    .eq('id', winnerId)
    .eq('user_id', user.id)  // ← critical security check
    .single()

  if (!winner) {
    return NextResponse.json({ error: 'Winner record not found' }, { status: 404 })
  }

  if (winner.verification_status === 'approved') {
    return NextResponse.json({ error: 'Already approved — no changes needed' }, { status: 400 })
  }

  // Convert file to buffer for Supabase Storage upload
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Store in a path that includes the user ID and winner ID for easy identification
  const fileExt = file.name.split('.').pop()
  const filePath = `winner-proofs/${user.id}/${winnerId}.${fileExt}`

  // Upload to Supabase Storage — you'll need to create a bucket called 'proofs'
  // in your Supabase dashboard under Storage → New bucket → name: proofs, public: false
  const { error: storageError } = await supabase.storage
    .from('proofs')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: true,   // overwrite if they re-upload
    })

  if (storageError) {
    console.error('Storage error:', storageError)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }

  // Get a signed URL that the admin can view (valid for 1 year)
  const { data: signedUrlData } = await supabase.storage
    .from('proofs')
    .createSignedUrl(filePath, 60 * 60 * 24 * 365)

  // Update the winner row: store the proof URL and reset status to pending
  // (in case they're re-uploading after a rejection)
  const { error: updateError } = await supabase
    .from('winners')
    .update({
      proof_url: signedUrlData?.signedUrl || filePath,
      verification_status: 'pending',
    })
    .eq('id', winnerId)
    .eq('user_id', user.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}