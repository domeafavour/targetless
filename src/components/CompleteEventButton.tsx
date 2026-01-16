import type { ButtonHTMLAttributes } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'

import {
  completeEvent,
  type EventDetail,
  type EventWithCurrentRecord,
} from '@/lib/event-store'

const baseClassName =
  'inline-flex items-center gap-2 rounded-full bg-emerald-500/90 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:bg-white/10'

type CompleteEventButtonProps = {
  event: EventWithCurrentRecord | EventDetail
  disabled?: boolean
  className?: string
  buttonProps?: ButtonHTMLAttributes<HTMLButtonElement>
  onSuccess?: (
    data: Awaited<ReturnType<typeof completeEvent>>,
    variables: Parameters<typeof completeEvent>[0],
  ) => void | Promise<void>
}

export default function CompleteEventButton({
  event,
  disabled,
  className,
  buttonProps,
  onSuccess,
}: CompleteEventButtonProps) {
  const mutation = useMutation({
    mutationFn: completeEvent,
    onSuccess: async (data, variables) => {
      if (onSuccess) {
        await onSuccess(data, variables)
      }
    },
  })

  const isActiveMutation =
    mutation.isPending && mutation.variables?.eventId === event.id

  const computedDisabled =
    disabled || !event.currentRecord || event.completed || isActiveMutation

  const finalClassName = className
    ? `${baseClassName} ${className}`
    : baseClassName

  const handleClick = () => {
    if (computedDisabled || !event.currentRecord) {
      return
    }

    const shouldComplete = window.confirm(`Mark "${event.title}" as completed?`)
    if (!shouldComplete) {
      return
    }

    let createNext = false
    let nextCount: number | undefined

    if (
      event.currentRecord &&
      window.confirm('Create a new record for the next cycle?')
    ) {
      createNext = true
      const response = window.prompt(
        'Starting count for the new record',
        String(event.currentRecord.count),
      )
      if (response === null) {
        return
      }
      const parsed = Number(response)
      if (!Number.isFinite(parsed) || parsed < 0) {
        window.alert('Count must be a non-negative number')
        return
      }
      nextCount = parsed
    }

    mutation.mutate({
      eventId: event.id,
      createNext,
      nextCount,
    })
  }

  return (
    <button
      type="button"
      {...buttonProps}
      disabled={computedDisabled}
      onClick={handleClick}
      className={finalClassName}
    >
      {isActiveMutation ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle2 className="h-4 w-4" />
      )}
      Complete
    </button>
  )
}
