import type { ButtonHTMLAttributes } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'

import { eventsApi } from '@/lib/api/events'
import {
  type CompleteEventInput,
  type EventDetail,
  type EventWithCurrentRecord,
} from '@/lib/event-store'
import { cn } from '@/lib/utils'

const completeEventButtonStyles = cva(
  'inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-wide disabled:cursor-not-allowed disabled:bg-white/10 transition-colors',
  {
    variants: {
      tone: {
        primary: 'bg-emerald-500/90 text-white hover:bg-emerald-400/90',
        subtle:
          'bg-emerald-500/10 text-emerald-100 border border-emerald-400/40 hover:bg-emerald-500/20',
      },
      fullWidth: {
        true: 'w-full justify-center',
        false: '',
      },
    },
    defaultVariants: {
      tone: 'primary',
      fullWidth: false,
    },
  },
)

type CompleteEventButtonProps = {
  event: EventWithCurrentRecord | EventDetail
  disabled?: boolean
  className?: string
  buttonProps?: ButtonHTMLAttributes<HTMLButtonElement>
  onSuccess?: (
    data: EventWithCurrentRecord,
    variables: CompleteEventInput,
  ) => void | Promise<void>
} & VariantProps<typeof completeEventButtonStyles>

export default function CompleteEventButton({
  event,
  disabled,
  className,
  buttonProps,
  onSuccess,
  tone,
  fullWidth,
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

  const finalClassName = cn(
    completeEventButtonStyles({ tone, fullWidth }),
    className,
  )

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
