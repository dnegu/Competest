'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { scoringEngine } from '../scoringEngine'
import { RawResponse, ScoringDimension, ScoringCompetency } from '../types'

/**
 * Recalculates and persists scores for a candidate.
 * Usually called when the test is marked as 'completed'.
 */
export async function calculateAndSaveResults(candidateId: string) {
  const supabase = createServiceClient()

  // 1. Fetch Candidate & Test Context
  const { data: candidate, error: candError } = await supabase
    .from('candidates')
    .select(`
      id,
      process_id,
      processes (
        combos (
          combo_tests (
            test_id,
            tests (
              id,
              scoring_type,
              dimensions (
                id, name, code,
                scoring_formulas ( formula )
              )
            )
          )
        )
      )
    `)
    .eq('id', candidateId)
    .single()

  if (candError || !candidate) {
    throw new Error('Candidate or test context not found')
  }

  // 2. Fetch Responses
  const { data: responses, error: respError } = await supabase
    .from('responses')
    .select(`
      value,
      question_id,
      questions ( order_index, test_id )
    `)
    .eq('candidate_id', candidateId)

  if (respError || !responses) {
    throw new Error('No responses found for candidate')
  }

  // 3. Fetch Competency Mapping
  const { data: compMaps, error: compError } = await supabase
    .from('dimension_competency_map')
    .select(`
      dimension_id,
      weight,
      competencies ( id, name )
    `)

  if (compError) throw compError

  // 4. Transform and Run Scoring
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = candidate as any
  const process = raw.processes
  const combo = process?.combos
  const tests = Array.isArray(combo?.combo_tests) 
    ? combo.combo_tests.map((ct: any) => ct.tests) 
    : [combo?.combo_tests?.tests].filter(Boolean)

  // Map database structures to Scoring Engine inputs
  const allResults = tests.map((test: any) => {
    const testResponses: RawResponse[] = responses
      .filter((r: any) => r.questions?.test_id === test.id)
      .map((r: any) => ({
        question_id: r.question_id,
        order_index: r.questions?.order_index,
        value: Number(r.value)
      }))

    const testDimensions: ScoringDimension[] = (test.dimensions || []).map((d: any) => ({
      id: d.id,
      name: d.name,
      code: d.code,
      formula: d.scoring_formulas?.[0]?.formula, // BIGFIVE uses 1 formula per dimension
      min_score: 12, // TODO: Pull these from interpreting metadata later
      max_score: 60
    }))

    // Collect competencies that use these dimensions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const relevantCompIds = new Set<string>(
      compMaps
        .filter((m: any) => testDimensions.some(td => td.id === m.dimension_id))
        .map((m: any) => {
          const c = Array.isArray(m.competencies) ? m.competencies[0] : m.competencies
          return c?.id
        })
        .filter(Boolean)
    )

    const testCompetencies: ScoringCompetency[] = Array.from(relevantCompIds).map(cid => {
      const mapEntries = compMaps.filter((m: any) => {
        const c = Array.isArray(m.competencies) ? m.competencies[0] : m.competencies
        return c?.id === cid
      })
      
      const firstComp = Array.isArray(mapEntries[0].competencies) 
        ? mapEntries[0].competencies[0] 
        : mapEntries[0].competencies

      return {
        id: cid,
        name: firstComp?.name || 'Unknown',
        dimensions: mapEntries.map((m: any) => ({
          dimension_id: m.dimension_id!,
          weight: Number(m.weight)
        }))
      }
    })

    return scoringEngine.process(testResponses, testDimensions, testCompetencies)
  })

  // 5. Persist Results
  for (const res of allResults) {
    // Save Dimensions results
    const dimInserts = res.dimensions.map((d: any) => ({
      candidate_id: candidateId,
      dimension_id: d.dimension_id,
      score: d.normalizedScore
    }))
    
    if (dimInserts.length > 0) {
      await supabase.from('results').upsert(dimInserts, { onConflict: 'candidate_id, dimension_id' })
    }

    // Save Competency results
    const compInserts = res.competencies.map((c: any) => ({
      candidate_id: candidateId,
      competency_id: c.competency_id,
      score: c.score
    }))

    if (compInserts.length > 0) {
      await supabase.from('competency_results').upsert(compInserts, { onConflict: 'candidate_id, competency_id' })
    }
  }

  return { success: true }
}

