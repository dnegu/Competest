import { createServiceClient } from './src/lib/supabase/service'

async function testQuery() {
  const supabase = createServiceClient()
  
  // 1. Get a candidate ID that has status 'completed'
  const { data: candidate } = await supabase
    .from('candidates')
    .select('id')
    .eq('status', 'completed')
    .limit(1)
    .single()

  if (!candidate) {
    console.log('No completed candidates found')
    return
  }

  console.log('Testing candidate:', candidate.id)

  // 2. Test simple responses query
  const { data: resp, error: err } = await supabase
    .from('responses')
    .select('*')
    .eq('candidate_id', candidate.id)
    .limit(5)

  if (err) {
    console.error('Error fetching responses:', err)
  } else {
    console.log('Simple responses:', resp)
  }

  // 3. Test complex query
  const { data: complex, error: complexErr } = await supabase
    .from('responses')
    .select(`
      id,
      value,
      question_id,
      questions (
        text,
        order_index
      )
    `)
    .eq('candidate_id', candidate.id)
    .limit(5)

  if (complexErr) {
    console.error('Error fetching complex responses:', complexErr)
  } else {
    console.log('Complex responses:', complex)
  }
}

testQuery()
