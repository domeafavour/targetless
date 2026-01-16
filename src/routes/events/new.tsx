import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, PlusCircle, ArrowLeft } from 'lucide-react'
import { useState } from 'react'

import { createEvent } from '@/lib/event-store'

export const Route = createFileRoute('/events/new')({
  component: CreateEventPage,
})

function CreateEventPage() {
  const navigate = useNavigate({ from: '/events/new' })
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [count, setCount] = useState('0')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: createEvent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['events'] })
      navigate({ to: '/' })
    },
    onError: (err: Error) => setError(err.message),
  })

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const trimmedTitle = title.trim()
    const parsedCount = Number(count)

    if (!trimmedTitle) {
      setError('Title is required')
      return
    }

    if (!Number.isFinite(parsedCount) || parsedCount < 0) {
      setError('Count must be a non-negative number')
      return
    }

    mutation.mutate({ title: trimmedTitle, count: parsedCount })
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-950 text-white">
      <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </Link>

        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.4em] text-cyan-300">
            New Event
          </p>
          <h1 className="text-4xl font-black">Create an event</h1>
          <p className="text-slate-300">
            Provide the event name and the current count to open its first record.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30"
        >
          <div className="flex flex-col gap-6">
            <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
              Title
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Morning Run"
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
              Initial Count
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </label>

            {error && (
              <p className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-white/20"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4" />
              )}
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
