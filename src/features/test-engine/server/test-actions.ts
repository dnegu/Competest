'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { CandidateContext, TestPayload } from '../types'

export async function validateTokenAndFetchContext(token: string): Promise<{ data?: CandidateContext, error?: string }> {
  if (!token) return { error: 'Token missing' }
  const supabase = createServiceClient()


  const { data, error } = await supabase
    .from('candidates')
    .select(`
      id,
      status,
      persons ( name ),
      processes (
        name,
        client_id,
        combos (
          combo_tests (
            tests (
              id, name, description, duration_minutes,
              questions (
                id, text, type, order_index, active,
                options ( id, text, value )
              )
            )
          )
        )
      )
    `)
    .eq('token', token)
    .single()

  if (error || !data) {
    return { error: 'El enlace de acceso es inválido u ocurrió un error.' }
  }

  if (data.status !== 'pending') {
    return { error: 'Este test ya fue completado o se encuentra inactivo.' }
  }

  // Normalize nested structure safely
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = data as any

    const processData = Array.isArray(raw.processes) ? raw.processes[0] : raw.processes
    const combo = processData?.combos
    const comboArr = Array.isArray(combo) ? combo : (combo ? [combo] : [])
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawTests: any[] = comboArr.flatMap((c: any) => {
      const cts = Array.isArray(c.combo_tests) ? c.combo_tests : (c.combo_tests ? [c.combo_tests] : [])
      return cts.map((ct: any) => ct.tests).filter(Boolean).flat()
    })
    
    const mappedTests: TestPayload[] = rawTests.map((t: any) => {
      const sortedQuestions = (Array.isArray(t.questions) ? t.questions : [t.questions])
        .filter(Boolean)
        .filter((q: any) => q.active === true)  // Only include active questions
        .sort((a: any, b: any) => a.order_index - b.order_index);
        
      return {
        id: t.id,
        name: t.name,
        description: t.description,
        duration_minutes: t.duration_minutes ?? 30,
        questions: sortedQuestions.map((q: any) => ({
          id: q.id,
          test_id: t.id,
          text: q.text,
          type: q.type,
          order_index: q.order_index,
          options: Array.isArray(q.options) ? q.options : [q.options].filter(Boolean)
        }))
      }
    });

    return {
      data: {
        candidateId: raw.id,
        personName: Array.isArray(raw.persons) ? raw.persons[0]?.name : raw.persons?.name || null,
        processName: processData?.name || null,
        clientId: processData?.client_id || null,
        tests: mappedTests
      }
    }
  } catch (err) {
    return { error: 'Error interno estructurando el contexto del examen.' }
  }
}
