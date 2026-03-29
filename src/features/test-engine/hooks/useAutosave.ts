'use client'

import { useMutation } from '@tanstack/react-query'
import { saveCandidateResponse } from '../server/autosave-actions'
import { useRef, useCallback, useState, useEffect } from 'react'

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useAutosave(candidateId: string) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const mutation = useMutation({
    mutationFn: async (vars: { questionId: string; optionId: string }) => {
      const res = await saveCandidateResponse({
        candidateId,
        questionId: vars.questionId,
        optionId: vars.optionId,
      })
      if (!res.success) throw new Error(res.error)
      return res
    },
    onMutate: () => setSyncStatus('saving'),
    onSuccess: () => {
      setSyncStatus('saved')
      // Reset indicator after 2 seconds organically
      setTimeout(() => setSyncStatus('idle'), 2000)
    },
    onError: () => setSyncStatus('error'),
    retry: 3,
    retryDelay: 1000,
  })

  const debouncedSave = useCallback(
    (questionId: string, optionId: string) => {
      setSyncStatus('saving')

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
        mutation.mutate({ questionId, optionId })
      }, 500)
    },
    [mutation]
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return {
    syncStatus,
    triggerAutosave: debouncedSave,
    isError: syncStatus === 'error',
  }
}
