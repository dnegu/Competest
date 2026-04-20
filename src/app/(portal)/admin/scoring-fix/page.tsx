import { createServiceClient } from '@/lib/supabase/service'
import ScoringRecalculator from './ScoringRecalculator'

export default async function ScoringFixPage() {
  const supabase = createServiceClient()

  // Fetch processes with client and combo info
  const { data: processes, error } = await supabase
    .from('processes')
    .select(`
      id,
      name,
      created_at,
      clients (
        name
      ),
      combos (
        name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return <div>Error loading processes: {error.message}</div>
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Scoring Engine Maintenance</h1>
        <p className="text-gray-600">
          Recalculate scores for all candidates in a process to fix the "5.5" bug and apply norming tables.
        </p>
      </div>

      <div className="grid gap-4">
        {processes?.map((process) => (
          <div key={process.id} className="border p-4 rounded-lg flex justify-between items-center bg-white shadow-sm">
            <div>
              <h3 className="font-semibold text-lg">{process.name}</h3>
              <div className="text-sm text-gray-500">
                <span className="mr-4"><strong>Cliente:</strong> {process.clients?.name}</span>
                <span className="mr-4"><strong>Combo:</strong> {process.combos?.name}</span>
                <span><strong>Fecha:</strong> {new Date(process.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <ScoringRecalculator processId={process.id} />
          </div>
        ))}
      </div>
    </div>
  )
}
