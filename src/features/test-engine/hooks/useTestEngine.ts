'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { CandidateContext, Question } from '../types'
import { useAutosave, SyncStatus } from './useAutosave'
import { completeTestSession } from '../server/completion-actions'

interface UseTestEngineProps {
  context: CandidateContext
}

export function useTestEngine({ context }: UseTestEngineProps) {
  // Flatten all questions across all tests assigned to process
  const allQuestions = useMemo(() => {
    return context.tests.flatMap(t => t.questions)
  }, [context])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({}) // question_id -> option_id
  const [isCompleted, setIsCompleted] = useState(false)
  const completionTriggered = useRef(false)

  const currentQuestion: Question | null = allQuestions[currentIndex] ?? null
  const totalQuestions = allQuestions.length
  const answeredCount = Object.keys(answers).length
  const allAnswered = totalQuestions > 0 && answeredCount >= totalQuestions
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0

  const isFinished = isCompleted
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined

  const { syncStatus, triggerAutosave } = useAutosave(context.candidateId)

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }))
    triggerAutosave(questionId, optionId)
  }

  const nextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  /**
   * Triggered by the "Finalizar Test" button on the last question.
   * Calls the server action to mark the candidate as completed.
   */
  const finishTest = async () => {
    if (completionTriggered.current) return
    completionTriggered.current = true

    const { success } = await completeTestSession(context.candidateId)
    if (success) {
      setIsCompleted(true)
    } else {
      // Reset so user can retry
      completionTriggered.current = false
    }
  }

  /**
   * Force-complete: called by the timer when time expires on the backend.
   */
  const forceComplete = async () => {
    if (completionTriggered.current) return
    completionTriggered.current = true
    await completeTestSession(context.candidateId)
    setIsCompleted(true)
  }

  return {
    currentQuestion,
    currentIndex,
    totalQuestions,
    answeredCount,
    allAnswered,
    progressPercent,
    isFinished,
    currentAnswer,
    handleSelectOption,
    nextQuestion,
    prevQuestion,
    finishTest,
    forceComplete,
    isFirst: currentIndex === 0,
    isLast: currentIndex === totalQuestions - 1,
    syncStatus,
  }
}
