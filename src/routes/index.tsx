import { Link, createFileRoute } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
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
import { Button } from '@/components/ui/Button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { eventsApi } from '@/lib/api/events'
import { type EventWithCurrentRecord } from '@/lib/event-store'
import { formatTimestamp } from '@/lib/date-utils'

export const Route = createFileRoute('/')({ component: EventDashboard })

function EventDashboard() {
  const queryClient = useQueryClient()
  const eventsQuery = eventsApi.list.useQuery()

  const deleteMutation = eventsApi.delete.useMutation({
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: eventsApi.list.getKey() }),
  })

  const events = eventsQuery.data ?? []
  const activeEvents = events.filter((event) => !event.completed).length
  const completedEvents = events.filter((event) => event.completed).length

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
            <Button asChild>
              <Link to="/events/new">
                <Plus className="w-4 h-4" /> Create Event
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                queryClient.invalidateQueries({ queryKey: eventsApi.list.getKey() })
              }
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
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
                    <Button asChild variant="outline">
                      <Link to="/events/$eventId" params={{ eventId: event.id }}>
                        <BookOpen className="h-4 w-4" /> View Records
                      </Link>
                    </Button>
                    <CompleteEventButton
                      event={event}
                      disabled={!event.currentRecord || event.completed}
                      onSuccess={() =>
                        queryClient.invalidateQueries({
                          queryKey: eventsApi.list.getKey(),
                        })
                      }
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="danger"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">
                            Delete Event
                          </p>
                          <AlertDialogTitle>
                            Remove "{event.title}"?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the event and all of its records.
                            You cannot undo this action.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            variant="danger"
                            onClick={() => deleteMutation.mutate(event.id)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Delete Event
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
      <Button asChild>
        <Link to="/events/new">
          <Plus className="h-4 w-4" /> Create Event
        </Link>
      </Button>
    </div>
  )
}
