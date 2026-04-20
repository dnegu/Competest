'use client'

import { useState } from 'react'
import { calculateProcessResults } from './actions'

interface Props {
  processId: string
}

export default function ScoringRecalculator({ processId }: Props) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean;
    total?: number;
    processed?: number;
    errors?: number;
    error?: string;
    details?: any[];
  } | null>(null)

  const handleRecalculate = async () => {
    if (!confirm('¿Estás seguro de que deseas recalcular todos los puntajes de este proceso? Esto sobrescribirá los datos actuales en la base de datos.')) {
      return
    }

    setLoading(true)
    setResult(null)
    try {
      const res = await calculateProcessResults(processId)
      setResult(res as any)
    } catch (e: any) {
      setResult({ success: false, error: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2 w-full max-w-md">
      <button
        onClick={handleRecalculate}
        disabled={loading}
        className={`px-4 py-2 rounded font-medium text-white transition-colors ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Recalculando...
          </span>
        ) : 'Recalcular Proceso'}
      </button>

      {result && (
        <div className={`text-sm w-full mt-2 p-3 rounded-lg border ${
          result.success && (result.errors ?? 0) === 0
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          <div className="font-bold">
            {result.success ? 'Proceso completado' : 'Error en la ejecución'}
          </div>
          <div className="flex gap-4 mt-1 text-xs">
            <span>Encontrados: {result.total}</span>
            <span className="text-emerald-600">Éxitos: {result.processed}</span>
            <span className={(result.errors ?? 0) > 0 ? 'text-red-600 font-bold' : ''}>Errores: {result.errors}</span>
          </div>

          {result.details && result.details.length > 0 && (
            <div className="mt-2 text-[10px] overflow-auto max-h-40 bg-white/50 p-2 rounded border border-red-100">
              <p className="font-semibold underline mb-1">Detalles de errores:</p>
              {result.details.map((d, i) => (
                <div key={i} className="mb-1 border-b border-red-50 pb-1 last:border-0">
                  <span className="font-mono">ID: {d.id.substring(0,8)}...</span> |
                  <span className="ml-1 text-red-800 italic">{d.error}</span>
                </div>
              ))}
            </div>
          )}

          {result.error && <p className="mt-1 font-bold">{result.error}</p>}
        </div>
      )}
    </div>
  )
}
