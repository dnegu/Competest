'use client'

import { useState } from 'react'

interface CandidateListItemProps {
  candidates: any[]
  onSelect: (id: string) => void
  onViewResponses: (id: string) => void
  selectedId?: string
}

export function CandidateList({ candidates, onSelect, onViewResponses, selectedId }: CandidateListItemProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-2">Candidatos Completados</h3>
      {candidates.length === 0 && (
        <div className="p-4 text-center text-slate-500 bg-slate-800/50 rounded-lg border border-slate-700 dashed">
          No hay candidatos aún.
        </div>
      )}
      {candidates.map((c) => (
        <div
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={`w-full text-left p-4 rounded-xl transition-all border cursor-pointer group relative ${
            selectedId === c.id 
              ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-900/20 text-white' 
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750 hover:border-slate-600'
          }`}
        >
          <div className="font-bold">{c.persons?.name || 'Candidato'}</div>
          <div className={`text-xs ${selectedId === c.id ? 'text-blue-100' : 'text-slate-500'}`}>
            {c.persons?.email}
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block ${
              selectedId === c.id ? 'bg-blue-500 text-white' : 'bg-slate-900 text-slate-400'
            }`}>
              {c.processes?.name || 'Sin Proceso'}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onViewResponses(c.id)
              }}
              className={`text-[10px] font-bold uppercase tracking-tight hover:underline ${
                selectedId === c.id ? 'text-blue-100' : 'text-blue-400'
              }`}
            >
              Ver Respuestas
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

