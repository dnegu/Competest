'use server'

import { createServiceClient } from '@/lib/supabase/service'

/**
 * Called when candidate opens the test for the first time.
 * Sets started_at = now() only if not already set (idempotent).
 * Returns the started_at timestamp for the frontend timer.
 */
export async function startTestSession(candidateId: string): Promise<{
  started_at?: string
  error?: string
}> {
  const supabase = createServiceClient()

  // First, get current started_at
  const { data: existing, error: fetchError } = await supabase
    .from('candidates')
    .select('started_at')
    .eq('id', candidateId)
    .single()

  if (fetchError || !existing) {
    return { error: 'Candidato no encontrado.' }
  }

  // If already started, return existing timestamp (idempotent)
  if (existing.started_at) {
    return { started_at: existing.started_at }
  }

  // Set started_at = now()
  const now = new Date().toISOString()
  const { error: updateError } = await supabase
    .from('candidates')
    .update({ started_at: now })
    .eq('id', candidateId)

  if (updateError) {
    return { error: 'No se pudo iniciar el cronómetro.' }
  }

  return { started_at: now }
}

/**
 * Backend validation: checks if the candidate still has time remaining.
 * Uses the test's duration from the process/combo chain.
 */
export async function validateTimeRemaining(candidateId: string): Promise<{
  isValid: boolean
  remainingSeconds?: number
  error?: string
}> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('candidates')
    .select(`
      started_at,
      status,
      processes (
        combos (
          combo_tests (
            tests ( duration_minutes )
          )
        )
      )
    `)
    .eq('id', candidateId)
    .single()

  if (error || !data) {
    return { isValid: false, error: 'Candidato no encontrado.' }
  }

  if (data.status === 'completed') {
    return { isValid: false, error: 'Test ya finalizado.' }
  }

  if (!data.started_at) {
    return { isValid: true, remainingSeconds: undefined }
  }

  // Get duration from first test in combo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = data as any
  const processes = Array.isArray(raw.processes) ? raw.processes[0] : raw.processes
  const combo = processes?.combos
  const comboArr = Array.isArray(combo) ? combo : (combo ? [combo] : [])
  const firstTest = comboArr
    .flatMap((c: any) => Array.isArray(c.combo_tests) ? c.combo_tests : [c.combo_tests])
    .map((ct: any) => ct?.tests)
    .find(Boolean)

  const durationMinutes: number = firstTest?.duration_minutes ?? 30
  const startedAt = new Date(data.started_at).getTime()
  const now = Date.now()
  const elapsedSeconds = Math.floor((now - startedAt) / 1000)
  const totalSeconds = durationMinutes * 60
  const remaining = totalSeconds - elapsedSeconds

  if (remaining <= 0) {
    // Auto-mark as completed if time expired
    await supabase
      .from('candidates')
      .update({ status: 'completed' })
      .eq('id', candidateId)
      .eq('status', 'pending')

    return { isValid: false, remainingSeconds: 0, error: 'Tiempo agotado.' }
  }

  return { isValid: true, remainingSeconds: remaining }
}
