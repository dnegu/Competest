'use client'

import { useEffect, useState } from 'react'
import { logout } from '@/features/auth/server/auth-actions'
import { Button } from '@/components/ui/button'
import { CandidateList } from '@/features/admin/ui/CandidateList'
import { ResultStats } from '@/features/admin/ui/ResultStats'
import { CandidateResponses } from '@/features/admin/ui/CandidateResponses'
import { FormulaPlayground } from '@/features/scoring/ui/FormulaPlayground'
import { FormulaManager } from '@/features/admin/ui/FormulaManager'
import { fetchCompletedCandidates, fetchCandidateResults, fetchCandidateResponses } from '@/features/admin/server/admin-actions'

export default function AdminPage() {
  const [view, setView] = useState<'results' | 'formulas'>('results')
  const [candidates, setCandidates] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [results, setResults] = useState<any | null>(null)
  const [responses, setResponses] = useState<any[] | null>(null)
  const [detailView, setDetailView] = useState<'stats' | 'responses'>('stats')
  const [loadingResults, setLoadingResults] = useState(false)
  const [loadingResponses, setLoadingResponses] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // 1. Initial Load: Fetch all completed candidates
  useEffect(() => {
    if (view === 'results') {
      fetchCompletedCandidates()
        .then(setCandidates)
        .catch(console.error)
        .finally(() => setInitialLoading(false))
    } else {
      setInitialLoading(false)
    }
  }, [view])

  // 2. Selection Load: Fetch stats/responses when a candidate is clicked
  useEffect(() => {
    if (!selectedId || view !== 'results') return
    
    if (detailView === 'stats') {
      setLoadingResults(true)
      fetchCandidateResults(selectedId)
        .then(setResults)
        .catch(console.error)
        .finally(() => setLoadingResults(false))
    } else {
      setLoadingResponses(true)
      fetchCandidateResponses(selectedId)
        .then(data => {
          console.log('AdminPage: Responses received:', data)
          setResponses(data)
        })
        .catch(console.error)
        .finally(() => setLoadingResponses(false))
    }
  }, [selectedId, view, detailView])


  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-bold animate-pulse">
        Cargando Panel de Administración...
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-200">
      {/* Top Navbar */}
      <header className="h-20 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black">C</div>
            <h1 className="text-xl font-black text-white tracking-tight">Competest</h1>
          </div>
          
          <nav className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button 
              onClick={() => setView('results')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'results' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              📊 Resultados
            </button>
            <button 
              onClick={() => setView('formulas')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'formulas' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              🧪 Fórmulas
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs font-medium text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            Modo: Global Admin
          </span>
          <form action={logout}>
            <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-slate-800">Cerrar Sesión</Button>
          </form>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex flex-1 overflow-hidden">
        {view === 'results' ? (
          <>
            {/* Left Sidebar: Candidate List */}
            <aside className="w-80 border-r border-slate-800 bg-slate-900/30 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-6">
              <CandidateList 
                candidates={candidates} 
                onSelect={(id) => {
                  setSelectedId(id)
                  setDetailView('stats')
                }} 
                onViewResponses={(id) => {
                  setSelectedId(id)
                  setDetailView('responses')
                }}
                selectedId={selectedId || undefined} 
              />
              <div className="mt-auto pt-6 border-t border-slate-800">
                <FormulaPlayground />
              </div>
            </aside>

            <section className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-slate-950 via-slate-950 to-blue-950/20">
              <div className="max-w-4xl mx-auto">
                <div className="flex justify-end mb-6">
                   <div className="bg-slate-900/80 p-1 rounded-lg border border-slate-800 flex gap-1">
                      <button 
                        onClick={() => setDetailView('stats')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${detailView === 'stats' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        Estadísticas
                      </button>
                      <button 
                        onClick={() => setDetailView('responses')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${detailView === 'responses' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        Respuestas
                      </button>
                   </div>
                </div>

                {detailView === 'stats' ? (
                  <ResultStats 
                    results={results} 
                    loading={loadingResults} 
                  />
                ) : (
                  <CandidateResponses 
                    responses={responses}
                    loading={loadingResponses}
                  />
                )}
              </div>
            </section>
          </>
        ) : (
          <section className="flex-1 overflow-y-auto p-12 bg-slate-950">
            <div className="max-w-4xl mx-auto">
              <header className="mb-12">
                <h2 className="text-4xl font-black text-white tracking-tight mb-2">Editor de Fórmulas</h2>
                <p className="text-slate-500">Administra la lógica matemática de cada test y dimensión.</p>
              </header>
              <FormulaManager />
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

