'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { startTestSession, validateTimeRemaining } from '../server/timer-actions'

const STORAGE_KEY_PREFIX = 'competest_timer_'

interface UseTestTimerProps {
  candidateId: string
  durationMinutes: number
  onExpired?: () => void
}

interface UseTestTimerReturn {
  remainingSeconds: number | null  // null = still loading
  isExpired: boolean
  isStarted: boolean
  formattedTime: string
  urgency: 'normal' | 'warning' | 'critical'
}

export function useTestTimer({ candidateId, durationMinutes, onExpired }: UseTestTimerProps): UseTestTimerReturn {
  const storageKey = `${STORAGE_KEY_PREFIX}${candidateId}`
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null)
  const [isStarted, setIsStarted] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // On mount: start session and calculate remaining time from server started_at
  useEffect(() => {
    let isMounted = true

    async function init() {
      // Try to restore from localStorage first for fast display
      const cached = localStorage.getItem(storageKey)
      if (cached) {
        const { startedAtMs } = JSON.parse(cached)
        const elapsed = Math.floor((Date.now() - startedAtMs) / 1000)
        const remaining = durationMinutes * 60 - elapsed
        if (remaining > 0 && isMounted) {
          setRemainingSeconds(remaining)
          setIsStarted(true)
        }
      }

      // Authoritative: call server to get/set started_at
      const { started_at, error } = await startTestSession(candidateId)
      if (!isMounted || error || !started_at) return

      const startedAtMs = new Date(started_at).getTime()
      // Persist to localStorage for page reload resilience
      localStorage.setItem(storageKey, JSON.stringify({ startedAtMs }))

      const elapsed = Math.floor((Date.now() - startedAtMs) / 1000)
      const remaining = Math.max(0, durationMinutes * 60 - elapsed)
      setRemainingSeconds(remaining)
      setIsStarted(true)
    }

    init()

    return () => { isMounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId, durationMinutes])

  // Countdown interval
  useEffect(() => {
    if (!isStarted || remainingSeconds === null) return

    if (remainingSeconds <= 0) {
      setRemainingSeconds(0)
      return
    }

    intervalRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(intervalRef.current!)
          // Validate on backend and call onExpired callback
          validateTimeRemaining(candidateId).catch(console.error)
          onExpired?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isStarted, candidateId]) // Only restart interval when isStarted changes - intentional

  const isExpired = remainingSeconds !== null && remainingSeconds <= 0

  const formattedTime = useCallback((): string => {
    if (remainingSeconds === null) return '--:--'
    const mins = Math.floor(remainingSeconds / 60)
    const secs = remainingSeconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }, [remainingSeconds])()

  const urgency: 'normal' | 'warning' | 'critical' =
    remainingSeconds === null ? 'normal'
    : remainingSeconds <= 60 ? 'critical'
    : remainingSeconds <= 300 ? 'warning'
    : 'normal'

  return { remainingSeconds, isExpired, isStarted, formattedTime, urgency }
}
