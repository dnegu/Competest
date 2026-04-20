'use server'

import { createServiceClient } from '@/lib/supabase/service'

/**
 * Fetches all candidates who have completed tests, 
 * including their person info and process name.
 */
export async function fetchCompletedCandidates() {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('candidates')
    .select(`
      id,
      status,
      created_at,
      person_id,
      persons ( name, email ),
      process_id,
      processes ( name )
    `)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Fetches the scores for a specific candidate.
 */
export async function fetchCandidateResults(candidateId: string) {
  const supabase = createServiceClient()

  const { data: dimensions, error: dimError } = await supabase
    .from('results')
    .select(`
      score,
      dimension_id,
      dimensions ( name, code )
    `)
    .eq('candidate_id', candidateId)

  if (dimError) throw dimError

  const { data: competencies, error: compError } = await supabase
    .from('competency_results')
    .select(`
      score,
      competency_id,
      competencies ( name )
    `)
    .eq('candidate_id', candidateId)

  if (compError) throw compError

  return {
    dimensions: dimensions.map((d: any) => ({
      name: d.dimensions?.name,
      code: d.dimensions?.code,
      score: Number(d.score)
    })),
    competencies: competencies.map((c: any) => ({
      name: c.competencies?.name,
      score: Number(c.score)
    }))
  }
}

/**
 * Fetches the raw responses for a specific candidate.
 */
export async function fetchCandidateResponses(candidateId: string) {
  const supabase = createServiceClient()

  console.log('Fetching responses for candidate:', candidateId)

  const { data, error } = await supabase
    .from('responses')
    .select(`
      id,
      value,
      question_id,
      options (
        text,
        value
      ),

      questions (
        text,
        order_index,
        tests (
          name
        )
      )

    `)

    .eq('candidate_id', candidateId)


  if (error) {
    console.error('fetchCandidateResponses error:', error)
    throw error
  }

  if (!data || data.length === 0) {
    console.log('No responses found for candidate:', candidateId)
    return []
  }

  // Normalize data and sort by order_index manually to avoid foreignTable order issues
  return data
    .map((r: any) => {
      const q = Array.isArray(r.questions) ? r.questions[0] : r.questions
      const o = Array.isArray(r.options) ? r.options[0] : r.options
      const t = q ? (Array.isArray(q.tests) ? q.tests[0] : q.tests) : null
      
      return {
        id: r.id,
        value: o?.value !== undefined && o?.value !== null ? Number(o.value) : Number(r.value),
        optionText: o?.text || 'Sin texto de opción',
        questionText: q?.text || 'Pregunta sin texto',
        orderIndex: q?.order_index || 0,
        testName: t?.name || 'Evaluación'
      }

    })



    .sort((a, b) => a.orderIndex - b.orderIndex)
}



