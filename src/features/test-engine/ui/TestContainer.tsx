'use client'

import { CandidateContext } from '../types'
import { useTestEngine } from '../hooks/useTestEngine'
import { useTestTimer } from '../hooks/useTestTimer'
import { QuestionCard } from './QuestionCard'
import { TimerDisplay } from './TimerDisplay'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { SyncStatus } from '../hooks/useAutosave'

const SyncIndicator = ({ status }: { status: SyncStatus }) => {
  if (status === 'idle') return null;
  if (status === 'saving') return <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-1 rounded-md animate-pulse">Guardando...</span>
  if (status === 'saved') return <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Guardado ✓</span>
  return <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-md">Error de red. Reintentando...</span>
}

export function TestContainer({ context }: { context: CandidateContext }) {
  const engine = useTestEngine({ context })

  const durationMinutes = context.tests[0]?.duration_minutes ?? 30

  const timer = useTestTimer({
    candidateId: context.candidateId,
    durationMinutes,
    onExpired: engine.forceComplete,
  })

  // ── Completed screen (success) ──────────────────────────────────────────────
  if (engine.isFinished) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-emerald-50 to-slate-100">
        <div className="max-w-md w-full p-10 text-center bg-white rounded-2xl shadow-xl border border-emerald-100">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-3">¡Test Completado!</h2>
          <p className="text-slate-500 mb-6">
            Gracias, <span className="font-semibold text-slate-700">{context.personName || 'candidato'}</span>. 
            Tus respuestas han sido guardadas de forma segura.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-400 border border-slate-100">
            Puedes cerrar esta ventana. Ya no podrás volver a acceder a este enlace.
          </div>
        </div>
      </div>
    )
  }

  // ── Time expired screen ─────────────────────────────────────────────────────
  if (timer.isExpired && timer.isStarted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full p-8 text-center bg-white border border-red-200 rounded-xl shadow-lg">
          <div className="text-5xl mb-4">⏰</div>
          <h2 className="text-2xl font-bold text-red-700 mb-2">Tiempo Agotado</h2>
          <p className="text-slate-600">
            El tiempo asignado para este test ha terminado. Las respuestas que guardaste han sido registradas.
          </p>
        </div>
      </div>
    )
  }

  // ── No questions ────────────────────────────────────────────────────────────
  const q = engine.currentQuestion;

  if (!q && engine.totalQuestions === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full p-8 text-center bg-white border border-amber-100 rounded-xl shadow-lg">
          <div className="text-amber-500 mb-4 text-5xl">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Sin preguntas asignadas</h1>
          <p className="text-gray-600 text-sm">
            Verifica que el proceso tenga un combo y que el combo tenga tests con preguntas activas.
          </p>
          <p className="text-gray-400 text-xs mt-4">Proceso: {context.processName || 'N/A'} | Tests: {context.tests.length}</p>
        </div>
      </div>
    )
  }

  if (!q) return null;

  const isDisabled = timer.isExpired

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 w-full">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{context.processName || 'Proceso de Selección'}</h1>
            <SyncIndicator status={engine.syncStatus} />
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Candidato: <span className="text-slate-700">{context.personName || 'Desconocido'}</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <TimerDisplay
            formattedTime={timer.formattedTime}
            urgency={timer.urgency}
            isExpired={timer.isExpired}
            isLoading={!timer.isStarted}
          />
          <div className="w-full md:w-36 space-y-2">
            <div className="flex justify-between text-sm font-bold text-slate-600">
              <span>Progreso</span>
              <span className="text-blue-600">{engine.answeredCount}/{engine.totalQuestions}</span>
            </div>
            <Progress value={engine.progressPercent} className="h-2 bg-slate-100" />
          </div>
        </div>
      </div>

      {/* Expired banner */}
      {isDisabled && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center font-semibold">
          ⏰ El tiempo ha expirado. Las respuestas ya no pueden modificarse.
        </div>
      )}

      {/* Question Card */}
      <div className="mb-6">
        <QuestionCard
          question={q}
          currentAnswer={engine.currentAnswer}
          onSelect={isDisabled ? () => {} : engine.handleSelectOption}
          disabled={isDisabled}
        />
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <Button
          variant="outline"
          onClick={engine.prevQuestion}
          disabled={engine.isFirst || isDisabled}
          className="w-28"
        >
          Anterior
        </Button>
        <div className="text-sm text-slate-500 font-medium">
          Pregunta {engine.currentIndex + 1} de {engine.totalQuestions}
        </div>

        {engine.isLast ? (
          <Button
            onClick={engine.finishTest}
            disabled={!engine.allAnswered || isDisabled}
            className="w-36 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
          >
            ✓ Finalizar Test
          </Button>
        ) : (
          <Button
            onClick={engine.nextQuestion}
            disabled={isDisabled}
            className="w-28"
          >
            Siguiente
          </Button>
        )}
      </div>

      {/* All answered but not on last question - hint */}
      {engine.allAnswered && !engine.isLast && (
        <p className="text-center text-sm text-emerald-600 mt-3 font-medium">
          ✓ Todas las preguntas respondidas. Navega hasta la última para finalizar.
        </p>
      )}
    </div>
  )
}
