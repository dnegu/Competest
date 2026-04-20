'use client'

import { useState, useEffect } from 'react'
import { scoringEngine } from '../scoringEngine'
import { RawResponse } from '../types'

export function FormulaPlayground() {
  const [formula, setFormula] = useState('36 - (Q1 + Q2) + Q3')
  const [result, setResult] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Dummy responses for testing
  const dummyResponses: RawResponse[] = [
    { question_id: '1', order_index: 1, value: 5 },
    { question_id: '2', order_index: 2, value: 4 },
    { question_id: '3', order_index: 3, value: 1 },
  ]

  useEffect(() => {
    const validation = scoringEngine.validateFormula(formula)
    if (!validation.isValid) {
      setError(validation.error || 'Fórmula inválida')
      setResult(null)
    } else {
      setError(null)
      const val = scoringEngine.evaluateFormula(formula, dummyResponses)
      setResult(val)
    }
  }, [formula])

  return (
    <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl max-w-lg">
      <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
         🧪 Formula Playground
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Prueba tus fórmulas del Big Five aquí. <br/>
        Valores de prueba: <span className="text-blue-400">Q1=5, Q2=4, Q3=1</span>
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tu Fórmula</label>
          <input
            type="text"
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            className={`w-full bg-slate-950 border ${error ? 'border-red-500' : 'border-slate-700'} rounded-lg p-3 text-white font-mono outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
            placeholder="Ej: (Q1 + Q2) / 2"
          />
        </div>

        {error ? (
          <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 text-xs">
             ⚠️ {error}
          </div>
        ) : (
          <div className="p-4 bg-blue-600 rounded-xl flex justify-between items-center shadow-lg shadow-blue-900/20">
            <span className="text-sm font-bold text-blue-100">Resultado Calculado:</span>
            <span className="text-3xl font-black text-white">{result}</span>
          </div>
        )}

        <div className="text-[10px] text-slate-600 italic">
          * El motor usa `expr-eval` para asegurar que solo se procesen matemáticas puras.
        </div>
      </div>
    </div>
  )
}
