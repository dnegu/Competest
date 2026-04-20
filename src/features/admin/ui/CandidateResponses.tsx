'use client'

interface CandidateResponsesProps {
  responses: any[] | null
  loading: boolean
}

export function CandidateResponses({ responses, loading }: CandidateResponsesProps) {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center space-x-2 p-12">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
      </div>
    )
  }

  if (!responses || responses.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center">
        <div className="text-6xl mb-4">📝</div>
        <p className="max-w-xs">No hay respuestas disponibles para este candidato.</p>
      </div>
    )
  }

  // Group by test name
  const groupedTests: Record<string, any[]> = {}
  responses.forEach(r => {
    const testName = r.testName || 'Test'
    if (!groupedTests[testName]) groupedTests[testName] = []
    groupedTests[testName].push(r)
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <span className="w-1.5 h-7 bg-blue-500 rounded-full" />
          Respuestas del Postulante
        </h3>
      </header>

      <div className="max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
        <div className="space-y-10">
          {Object.entries(groupedTests).map(([testName, testResponses]) => (
            <section key={testName}>
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 px-1">
                {testName}
              </h4>
              <div className="grid grid-cols-1 gap-1">
                {testResponses.sort((a, b) => a.orderIndex - b.orderIndex).map((r, i) => (
                  <div 
                    key={r.id} 
                    className={`flex items-start gap-6 p-4 rounded-xl transition-colors ${
                      i % 2 === 0 ? 'bg-slate-900/50' : 'bg-transparent'
                    } hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50 group`}
                  >
                    <div className="w-8 h-8 flex-shrink-0 bg-slate-800 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:bg-blue-900/30 group-hover:text-blue-400 transition-colors">
                      {r.orderIndex || i + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-slate-300 font-medium leading-relaxed">
                        {r.questionText}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-400 uppercase bg-blue-900/20 px-2 py-0.5 rounded border border-blue-800/30">
                          Respuesta:
                        </span>
                        <span className="text-xs text-slate-400 italic">
                          "{r.optionText}"
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                       <div className="text-[10px] font-bold text-slate-500 uppercase">Valor</div>
                       <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-900/40">
                         {typeof r.value === 'number' ? r.value : '-'}
                       </div>
                    </div>

                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
