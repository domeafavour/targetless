import { CheckCircle2, CircleDashed } from 'lucide-react'

type EventStatusPillProps = {
  completed: boolean
}

export default function EventStatusPill({ completed }: EventStatusPillProps) {
  if (completed) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
        <CheckCircle2 className="h-3.5 w-3.5" /> Completed
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-200">
      <CircleDashed className="h-3.5 w-3.5" /> Active
    </span>
  )
}
