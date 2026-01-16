import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  BookOpen,
  History,
  Loader2,
  Trash2,
} from 'lucide-react'

import CompleteEventButton from '@/components/CompleteEventButton'
import EventStatusPill from '@/components/EventStatusPill'
import { eventsApi } from '@/lib/api/events'
import { formatTimestamp } from '@/lib/date-utils'
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

export const Route = createFileRoute('/events/$eventId')({
  component: EventRecordsPage,
})

function EventRecordsPage() {
  const { eventId } = Route.useParams()
  const navigate = useNavigate({ from: '/events/$eventId' })
  const queryClient = useQueryClient()

  const eventQuery = eventsApi.detail.useQuery({
    variables: { eventId },
  })

  const deleteMutation = eventsApi.delete.useMutation({
    onSuccess: async (_, deletedId) => {
      await queryClient.invalidateQueries({ queryKey: eventsApi.list.getKey() })
      queryClient.removeQueries({
        queryKey: eventsApi.detail.getKey({ eventId: deletedId }),
      })
      navigate({ to: '/' })
    },
  })

  const event = eventQuery.data

  const handleDelete = () => {
    if (!event) return
    deleteMutation.mutate(event.id)
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-100"
        >
          <ArrowLeft className="h-4 w-4" /> Back to events
        </Link>

        {eventQuery.isLoading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-6">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
            <p className="text-sm text-slate-300">Loading event…</p>
          </div>
        ) : eventQuery.isError ? (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-6 text-rose-200">
            Unable to load this event. It may have been deleted.
          </div>
        ) : event ? (
          <>
            <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-6 shadow-xl shadow-black/30">
              <header className="flex flex-col gap-3">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-cyan-300">
                  <BookOpen className="h-4 w-4" /> Event Records
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <h1 className="text-4xl font-black">{event.title}</h1>
                  <EventStatusPill completed={event.completed} />
                </div>
                <p className="text-sm text-slate-400">
                  Updated {formatTimestamp(event.updatedAt)} • {event.records.length}{' '}
                  {event.records.length === 1 ? 'record' : 'records'}
                </p>
              </header>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <SummaryStat label="Current Count" value={event.currentRecord?.count ?? '—'} />
                <SummaryStat label="Last Updated" value={formatTimestamp(event.updatedAt)} />
                <SummaryStat label="Status" value={event.completed ? 'Completed' : 'Active'} />
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <CompleteEventButton
                  event={event}
                  disabled={!event.currentRecord || event.completed}
                  onSuccess={async (_, variables) => {
                    await Promise.all([
                      queryClient.invalidateQueries({
                        queryKey: eventsApi.detail.getKey({
                          eventId: variables.eventId,
                        }),
                      }),
                      queryClient.invalidateQueries({
                        queryKey: eventsApi.list.getKey(),
                      }),
                    ])
                  }}
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="danger"
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
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
                        This will permanently delete the event and every record in its
                        timeline. You cannot undo this action.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={deleteMutation.isPending}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        variant="danger"
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
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
            </section>

            <section className="rounded-3xl border border-white/5 bg-white/5 p-6 shadow-inner shadow-black/20">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.4em] text-slate-300">
                <History className="h-4 w-4" /> Records Timeline
              </div>
              {event.records.length === 0 ? (
                <p className="mt-6 text-slate-400">This event has no records yet.</p>
              ) : (
                <ol className="mt-6 space-y-4">
                  {event.records.map((record) => (
                    <li
                      key={record.id}
                      className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                            Count
                          </p>
                          <p className="text-3xl font-black">{record.count}</p>
                        </div>
                        <EventStatusPill completed={record.completed} />
                      </div>
                      <div className="mt-4 grid gap-1 text-sm text-slate-400">
                        <p>Created {formatTimestamp(record.createdAt)}</p>
                        <p>Updated {formatTimestamp(record.updatedAt)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </>
        ) : null}
      </div>
    </div>
  )
}

function SummaryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
      <p className="uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  )
}
