'use server'

import { createServiceClient } from '@/lib/supabase/service'

/**
 * Fetches all tests with their dimensions and formulas.
 */
export async function fetchTestsWithFormulas() {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('tests')
    .select(`
      id,
      name,
      dimensions (
        id,
        name,
        code,
        scoring_formulas ( id, formula )
      )
    `)
    .order('name')

  if (error) throw error
  return data
}

/**
 * Updates or creates a formula for a dimension.
 */
export async function updateDimensionFormula(testId: string, dimensionId: string, formula: string) {
  const supabase = createServiceClient()

  // First, check if a formula already exists to get its ID
  const { data: existing } = await supabase
    .from('scoring_formulas')
    .select('id')
    .eq('dimension_id', dimensionId)
    .single()

  if (existing) {
    // Update
    const { error } = await supabase
      .from('scoring_formulas')
      .update({ formula })
      .eq('id', existing.id)
    if (error) throw error
  } else {
    // Insert
    const { error } = await supabase
      .from('scoring_formulas')
      .insert({
        test_id: testId,
        dimension_id: dimensionId,
        formula
      })
    if (error) throw error
  }

  return { success: true }
}
