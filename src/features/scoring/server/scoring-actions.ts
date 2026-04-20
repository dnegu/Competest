'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { scoringEngine } from '../scoringEngine'
import { RawResponse, ScoringDimension, ScoringCompetency } from '../types'

/**
 * Recalculates and persists scores for a candidate.
 */
export async function calculateAndSaveResults(candidateId: string) {
  const supabase = createServiceClient()

  // 1. Fetch Candidate & Test Context (Removed 'gender' column as it doesn't exist)
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
    console.error(`Error fetching candidate ${candidateId}:`, candError)
    return {
      success: false,
      error: candError
        ? `Database Error: ${candError.message} (Code: ${candError.code})`
        : 'Candidate record not found in database'
    }
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

  if (respError || !responses || responses.length === 0) {
    console.warn(`No responses for candidate ${candidateId}`)
    return { success: false, error: 'No responses found' }
  }

  // 3. Fetch Competency Mapping
  const { data: compMaps, error: compError } = await supabase
    .from('dimension_competency_map')
    .select(`
      dimension_id,
      weight,
      competencies (
        id, name,
        inter_alejado, inter_cercano, inter_adecuado,
        profile_alejado, profile_cercano, profile_adecuado,
        empathy, areas_for_improvement
      )
    `)

  if (compError) throw compError

  // 4. Transform and Run Scoring
  const raw = candidate as any
  const process = raw.processes
  const combo = process?.combos
  const tests = Array.isArray(combo?.combo_tests) 
    ? combo.combo_tests.map((ct: any) => ct.tests) 
    : [combo?.combo_tests?.tests].filter(Boolean)

  if (!tests || tests.length === 0) {
    return { success: false, error: 'No tests associated' }
  }

  // Detect Gender from responses (In BIG FIVE, it's usually question order_index 0)
  const genderResponse = responses.find(r => r.questions?.order_index === 0);
  const genderValue = genderResponse ? (Number(genderResponse.value) === 1 ? 1 : 0) : 0;
  // 0 = Masculino, 1 = Femenino

  const allResults = tests.map((test: any) => {
    const testResponses: RawResponse[] = responses
      .filter((r: any) => r.questions?.test_id === test.id)
      .map((r: any) => ({
        question_id: r.question_id,
        order_index: r.questions?.order_index,
        value: Number(r.value)
      }))

    if (testResponses.length === 0) return null;

    const testDimensions: ScoringDimension[] = (test.dimensions || []).map((d: any) => ({
      id: d.id,
      name: d.name,
      code: d.code,
      formula: d.scoring_formulas?.[0]?.formula
    }))

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
        inter_adecuado: firstComp?.inter_adecuado,
        inter_cercano: firstComp?.inter_cercano,
        inter_alejado: firstComp?.inter_alejado,
        profile_adecuado: firstComp?.profile_adecuado,
        profile_cercano: firstComp?.profile_cercano,
        profile_alejado: firstComp?.profile_alejado,
        empathy: firstComp?.empathy,
        areas_for_improvement: firstComp?.areas_for_improvement,
        dimensions: mapEntries.map((m: any) => ({
          dimension_id: m.dimension_id!,
          weight: Number(m.weight)
        }))
      }
    })

    return scoringEngine.process(testResponses, testDimensions, testCompetencies, genderValue)
  }).filter(Boolean)

  // 5. Persist Results
  for (const res of allResults) {
    if (!res) continue;

    const dimInserts = res.dimensions.map((d: any) => ({
      candidate_id: candidateId,
      dimension_id: d.dimension_id,
      score: d.normalizedScore
    }))
    
    if (dimInserts.length > 0) {
      await supabase.from('results').upsert(dimInserts, { onConflict: 'candidate_id, dimension_id' })
    }

    const compInserts = res.competencies.map((c: any) => ({
      candidate_id: candidateId,
      competency_id: c.competency_id,
      score: c.score,
      level: c.level,
      interpretation: c.interpretation,
      profile: c.profile
    }))

    if (compInserts.length > 0) {
      await supabase.from('competency_results').upsert(compInserts, { onConflict: 'candidate_id, competency_id' })
    }
  }

  return { success: true }
}

/**
 * Recalculates scores for ALL candidates in the database.
 */
export async function recalculateAllCandidates() {
  const supabase = createServiceClient()

  const { data: candidates, error } = await supabase
    .from('candidates')
    .select('id')

  if (error) throw error

  const results = []
  for (const cand of candidates) {
    try {
      const res = await calculateAndSaveResults(cand.id)
      results.push({ id: cand.id, ...res })
    } catch (e) {
      results.push({ id: cand.id, success: false, error: String(e) })
    }
  }

  return {
    total: candidates.length,
    processed: results.length,
    successes: results.filter(r => r.success).length,
    failures: results.filter(r => !r.success).length
  }
}
