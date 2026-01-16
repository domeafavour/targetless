import type { ComponentProps } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'

import { eventsApi } from '@/lib/api/events'
import {
  type CompleteEventInput,
  type EventDetail,
  type EventWithCurrentRecord,
} from '@/lib/event-store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

type CompleteEventButtonProps = {
  event: EventWithCurrentRecord | EventDetail
  disabled?: boolean
  className?: string
  buttonProps?: ComponentProps<typeof Button>
  onSuccess?: (
    data: EventWithCurrentRecord,
    variables: CompleteEventInput,
  ) => void | Promise<void>
}

export default function CompleteEventButton({
  event,
  disabled,
  className,
  buttonProps,
  onSuccess,
}: CompleteEventButtonProps) {
  const mutation = eventsApi.complete.useMutation({
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

  const { className: buttonClassName, variant, ...restButtonProps } =
    buttonProps ?? {}

  const finalClassName = cn(buttonClassName, className)

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
    <Button
      type="button"
      variant={variant ?? 'success'}
      {...restButtonProps}
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
    </Button>
  )
}
