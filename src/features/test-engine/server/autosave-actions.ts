'use server'

import { createServiceClient } from '@/lib/supabase/service'

interface SaveResponseArgs {
  candidateId: string
  questionId: string
  optionId: string
  value?: number
}

export async function saveCandidateResponse({ candidateId, questionId, optionId, value }: SaveResponseArgs) {
  const supabase = createServiceClient()

  // --- Backend time validation ---
  const { data: candidate, error: candidateError } = await supabase
    .from('candidates')
    .select('started_at, status, processes(combos(combo_tests(tests(duration_minutes))))')
    .eq('id', candidateId)
    .single()

  if (candidateError || !candidate) {
    return { success: false, error: 'Candidato no encontrado.' }
  }

  if (candidate.status === 'completed') {
    return { success: false, error: 'El test ya ha sido finalizado.' }
  }

  if (candidate.started_at) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = candidate as any
    const processes = Array.isArray(raw.processes) ? raw.processes[0] : raw.processes
    const combo = Array.isArray(processes?.combos) ? processes.combos[0] : processes?.combos
    const comboTest = Array.isArray(combo?.combo_tests) ? combo.combo_tests[0] : combo?.combo_tests
    const test = Array.isArray(comboTest?.tests) ? comboTest.tests[0] : comboTest?.tests

    const durationMinutes: number = test?.duration_minutes ?? 30
    const startedAt = new Date(candidate.started_at).getTime()
    const elapsed = (Date.now() - startedAt) / 1000
    
    if (elapsed > durationMinutes * 60) {
      // Auto-close the test
      await supabase.from('candidates').update({ status: 'completed' }).eq('id', candidateId).eq('status', 'pending')
      return { success: false, error: 'Tiempo agotado. No se puede guardar la respuesta.' }
    }
  }
  // --- End validation ---

  const { error } = await supabase
    .from('responses')
    .upsert(
      {
        candidate_id: candidateId,
        question_id: questionId,
        option_id: optionId,
        value: value || null,
        answered_at: new Date().toISOString()
      },
      { onConflict: 'candidate_id, question_id' }
    )

  if (error) {
    console.error('Error saving response:', error)
    return { success: false, error: 'Fallo al guardar la respuesta.' }
  }

  return { success: true }
}

