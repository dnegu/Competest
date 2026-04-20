'use client'

import { useEffect, useState } from 'react'
import { fetchTestsWithFormulas, updateDimensionFormula } from '../server/formula-actions'
import { scoringEngine } from '../../scoring/scoringEngine'
import { Button } from '@/components/ui/button'

export function FormulaManager() {
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<{ testId: string, dimId: string, formula: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTests()
  }, [])

  const loadTests = async () => {
    setLoading(true)
    try {
      const data = await fetchTestsWithFormulas()
      setTests(data)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (testId: string, dimId: string, formula: string) => {
    // Validate first
    const validation = scoringEngine.validateFormula(formula)
    if (!validation.isValid) {
      alert(`Fórmula inválida: ${validation.error}`)
      return
    }

    setSaving(true)
    setError(null)
    try {
      await updateDimensionFormula(testId, dimId, formula)
      setEditing(null)
      await loadTests() // Refresh
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-slate-500 animate-pulse p-8">Cargando jerarquía de tests...</div>

  return (
    <div className="space-y-12 pb-20">
      {tests.map((test) => (
        <section key={test.id} className="bg-slate-900/50 rounded-3xl border border-slate-800 p-8">
          <header className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-black text-white">{test.name}</h2>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{test.dimensions.length} Dimensiones</span>
          </header>

          <div className="grid grid-cols-1 gap-4">
            {test.dimensions.map((dim: any) => {
              const currentFormula = dim.scoring_formulas?.[0]?.formula || ''
              const isEditing = editing?.dimId === dim.id

              return (
                <div key={dim.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-slate-200 flex items-center gap-2">
                        {dim.name}
                        <span className="text-blue-500 font-mono text-sm bg-blue-900/20 px-2 py-0.5 rounded">
                          {dim.code}
                        </span>
                      </h3>
                    </div>
                    {!isEditing && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setEditing({ testId: test.id, dimId: dim.id, formula: currentFormula })}
                        className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                      >
                        ✏️ Editar
                      </Button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editing.formula}
                        onChange={(e) => setEditing({...editing, formula: e.target.value})}
                        className="w-full bg-slate-950 border border-blue-500/50 rounded-xl p-3 text-white font-mono text-sm outline-none shadow-lg shadow-blue-500/10"
                        autoFocus
                      />
                      <div className="flex justify-end gap-3">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setEditing(null)}
                          className="text-slate-500 hover:text-white"
                        >
                          Cancelar
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleSave(test.id, dim.id, editing.formula)}
                          disabled={saving}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
                        >
                          {saving ? 'Guardando...' : 'Guardar Fórmula'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-400">
                      {currentFormula || <span className="italic opacity-50">Sin fórmula definida</span>}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ))}
      
      {error && <div className="fixed bottom-8 right-8 bg-red-600 text-white p-4 rounded-xl shadow-2xl animate-bounce">{error}</div>}
    </div>
  )
}
