'use client'

import { useOptimistic, useTransition } from 'react'

interface UseOptimisticActionResult<T> {
  value: T
  isPending: boolean
  doAction: (newValue: T) => void
}

/**
 * Optimistically updates a value while a server action runs in the background.
 * Reverts to the previous value if the action fails.
 *
 * @param current - The current server-confirmed value (typically from props)
 * @param action  - Async function that takes the new value and returns `{ error?: string }`
 */
export function useOptimisticAction<T>(
  current: T,
  action: (newValue: T) => Promise<{ error?: string }>,
): UseOptimisticActionResult<T> {
  const [optimisticValue, setOptimisticValue] = useOptimistic(current)
  const [isPending, startTransition] = useTransition()

  function doAction(newValue: T) {
    startTransition(async () => {
      setOptimisticValue(newValue)
      await action(newValue)
    })
  }

  return { value: optimisticValue, isPending, doAction }
}
