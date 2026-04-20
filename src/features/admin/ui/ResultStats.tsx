'use client'

import { Progress } from '@/components/ui/progress'

interface ResultStatsProps {
  results: {
    dimensions: any[]
    competencies: any[]
  } | null
  loading: boolean
}

export function ResultStats({ results, loading }: ResultStatsProps) {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center space-x-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
      </div>
    )
  }

  if (!results) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center">
        <div className="text-6xl mb-4">📈</div>
        <p className="max-w-xs">Selecciona un candidato para ver sus resultados detallados.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Competencias - High Level */}
      <section>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-blue-500 rounded-full" />
          Competencias Calculadas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.competencies.map((c) => (
            <div key={c.name} className="p-4 bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-semibold text-slate-300">{c.name}</span>
                <span className="text-2xl font-black text-blue-400">{c.score}</span>
              </div>
              <Progress value={c.score * 10} className="h-2 bg-slate-900" />
            </div>
          ))}
        </div>
      </section>

      {/* Dimensiones - Detail */}
      <section>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-emerald-500 rounded-full" />
          Dimensiones del Test
        </h3>
        <div className="space-y-4">
          {results.dimensions.map((d) => (
            <div key={d.name} className="flex items-center gap-4">
              <div className="w-32 text-xs font-bold text-slate-400 uppercase truncate">{d.name}</div>
              <div className="flex-1">
                <div className="h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-1000"
                    style={{ width: `${d.score * 10}%` }}
                  />
                </div>
              </div>
              <div className="w-10 text-right text-sm font-bold text-emerald-400">{d.score}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
