import { Link, createFileRoute } from '@tanstack/react-router'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  BookOpen,
  Loader2,
  Plus,
  RefreshCw,
  Target,
  Trash2,
} from 'lucide-react'

import CompleteEventButton from '@/components/CompleteEventButton'
import EventStatusPill from '@/components/EventStatusPill'
import {
  deleteEvent,
  listEvents,
  type EventWithCurrentRecord,
} from '@/lib/event-store'
import { formatTimestamp } from '@/lib/date-utils'

export const Route = createFileRoute('/')({ component: EventDashboard })

function EventDashboard() {
  const queryClient = useQueryClient()
  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: listEvents,
  })

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (eventId) => deleteEvent(eventId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  })

  const events = eventsQuery.data ?? []
  const activeEvents = events.filter((event) => !event.completed).length
  const completedEvents = events.filter((event) => event.completed).length

  const handleDelete = (event: EventWithCurrentRecord) => {
    const confirmed = window.confirm(
      `Delete "${event.title}" and all of its records? This cannot be undone.`,
    )
    if (!confirmed) {
      return
    }
    deleteMutation.mutate(event.id)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 text-white">
      <section className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="flex items-center gap-2 text-cyan-300 text-sm uppercase tracking-[0.2em]">
            <Target className="w-4 h-4" /> Event Tracker
          </p>
          <h1 className="text-4xl md:text-5xl font-black">
            Stay on top of every recurring commitment
          </h1>
          <p className="text-slate-300 max-w-2xl">
            Track habits, workouts, lessons, and more. Mark the current record
            complete and instantly spin up the next one when you are ready.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/events/new"
              className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white hover:bg-cyan-400"
            >
              <Plus className="w-4 h-4" /> Create Event
            </Link>
            <button
              type="button"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['events'] })}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white hover:border-white/60"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total" value={events.length} />
          <StatCard label="Active" value={activeEvents} />
          <StatCard label="Completed" value={completedEvents} />
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-16">
        {eventsQuery.isLoading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-6">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
            <p className="text-sm text-slate-300">Loading events…</p>
          </div>
        ) : eventsQuery.isError ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-6 text-rose-100">
            Failed to load events. Please refresh and try again.
          </div>
        ) : events.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {events.map((event) => {
              const isDeleting =
                deleteMutation.isPending &&
                deleteMutation.variables === event.id

              return (
                <article
                  key={event.id}
                  className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-900/40 p-6 shadow-lg shadow-black/30"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-semibold">{event.title}</h2>
                        <EventStatusPill completed={event.completed} />
                      </div>
                      <p className="mt-2 text-sm text-slate-400">
                        Updated {formatTimestamp(event.updatedAt)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 text-right">
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Current Count
                      </span>
                      <span className="text-3xl font-black">
                        {event.currentRecord?.count ?? '—'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      to="/events/$eventId"
                      params={{ eventId: event.id }}
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white hover:border-white/60"
                    >
                      <BookOpen className="h-4 w-4" /> View Records
                    </Link>
                    <CompleteEventButton
                      event={event}
                      disabled={!event.currentRecord || event.completed}
                      onSuccess={() =>
                        queryClient.invalidateQueries({ queryKey: ['events'] })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => handleDelete(event)}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-2 rounded-full border border-red-400/50 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-red-200 hover:border-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
        {label}
      </p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/20 bg-white/5 px-6 py-12 text-center">
      <p className="text-lg text-slate-200">No events yet.</p>
      <p className="text-sm text-slate-400">
        Create your first event to start tracking progress over time.
      </p>
      <Link
        to="/events/new"
        className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white"
      >
        <Plus className="h-4 w-4" /> Create Event
      </Link>
    </div>
  )
}
