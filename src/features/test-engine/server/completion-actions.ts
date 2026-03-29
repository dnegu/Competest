'use server'

import { createServiceClient } from '@/lib/supabase/service'

/**
 * Marks a candidate as 'completed'.
 * This is idempotent - safe to call multiple times.
 */
export async function completeTestSession(candidateId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createServiceClient()

  // Guard: verify candidate exists and is still pending
  const { data: candidate, error: fetchError } = await supabase
    .from('candidates')
    .select('id, status')
    .eq('id', candidateId)
    .single()

  if (fetchError || !candidate) {
    return { success: false, error: 'Candidato no encontrado.' }
  }

  // Already completed - idempotent success
  if (candidate.status === 'completed') {
    return { success: true }
  }

  // Mark as completed
  const { error: updateError } = await supabase
    .from('candidates')
    .update({ status: 'completed' })
    .eq('id', candidateId)
    .eq('status', 'pending') // double-check race condition guard

  if (updateError) {
    return { success: false, error: 'Error al registrar la finalización.' }
  }

  return { success: true }
}
