'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { calculateAndSaveResults } from '@/features/scoring/server/scoring-actions'

export async function calculateProcessResults(processId: string) {
  const supabase = createServiceClient()

  // Fetch all candidates for this process
  const { data: candidates, error } = await supabase
    .from('candidates')
    .select('id, status')
    .eq('process_id', processId)

  if (error) throw error

  if (!candidates || candidates.length === 0) {
    return { success: true, total: 0, processed: 0, errors: 0, details: [] }
  }

  let successCount = 0
  let errorCount = 0
  const details = []

  for (const cand of candidates) {
    try {
      // Intentamos recalcular
      const res = await calculateAndSaveResults(cand.id)

      if (res.success) {
        successCount++
      } else {
        errorCount++
        details.push({
          id: cand.id,
          status: cand.status,
          error: res.error || 'Error desconocido en el motor'
        })
      }
    } catch (e: any) {
      errorCount++
      details.push({
        id: cand.id,
        status: cand.status,
        error: e.message || 'Error de excepción'
      })
    }
  }

  return {
    success: true,
    total: candidates.length,
    processed: successCount,
    errors: errorCount,
    details
  }
}
