import { useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { BookOpen, Loader2, Plus, RefreshCw, Target } from "lucide-react";
import { useState } from "react";

import CompleteRecordButton from "@/components/CompleteRecordButton";
import EventStatusPill from "@/components/EventStatusPill";
import { Button } from "@/components/ui/Button";
import { RouteView } from "@/components/ui/RouteView";
import { eventsApi } from "@/lib/api/events";
import { formatTimestamp } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: EventDashboard });

type FilterType = "total" | "active" | "completed";

function EventDashboard() {
  const queryClient = useQueryClient();
  const eventsQuery = eventsApi.list.useQuery();
  const [filter, setFilter] = useState<FilterType>("total");

  const events = eventsQuery.data ?? [];
  const activeEvents = events.filter((event) => !event.completed).length;
  const completedEvents = events.filter((event) => event.completed).length;

  const filteredEvents = events.filter((event) => {
    if (filter === "active") return !event.completed;
    if (filter === "completed") return event.completed;
    return true;
  });

  return (
    <RouteView>
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
                queryClient.invalidateQueries({
                  queryKey: eventsApi.list.getKey(),
                })
              }
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total"
            value={events.length}
            active={filter === "total"}
            onClick={() => setFilter("total")}
          />
          <StatCard
            label="Active"
            value={activeEvents}
            active={filter === "active"}
            onClick={() => setFilter("active")}
          />
          <StatCard
            label="Completed"
            value={completedEvents}
            active={filter === "completed"}
            onClick={() => setFilter("completed")}
          />
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
        ) : filteredEvents.length === 0 ? (
          <EmptyState filter={filter} totalEvents={events.length} />
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => {
              return (
                <article
                  key={event.id}
                  className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 to-slate-900/40 p-6 shadow-lg shadow-black/30"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-semibold">
                          {event.title}
                        </h2>
                        <EventStatusPill completed={event.completed} />
                      </div>
                      <p className="mt-2 text-sm text-slate-400">
                        Updated{" "}
                        {event.updatedAt
                          ? formatTimestamp(event.updatedAt)
                          : "N/A"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 text-right">
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Current Count
                      </span>
                      <span className="text-3xl font-black">
                        {event.currentRecord?.count ?? "—"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild variant="outline">
                      <Link
                        to="/events/$eventId"
                        params={{ eventId: event.id }}
                      >
                        <BookOpen className="h-4 w-4" /> View Records
                      </Link>
                    </Button>
                    <CompleteRecordButton
                      event={event}
                      disabled={!event.currentRecord || event.completed}
                      onSuccess={() =>
                        queryClient.invalidateQueries({
                          queryKey: eventsApi.list.getKey(),
                        })
                      }
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </RouteView>
  );
}

function StatCard({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-6 py-4 text-left transition-all hover:border-cyan-400/50",
        active
          ? "border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-500/20"
          : "border-white/10 bg-white/5",
      )}
    >
      <p
        className={cn(
          "text-xs uppercase tracking-[0.3em]",
          active ? "text-cyan-300" : "text-slate-400",
        )}
      >
        {label}
      </p>
      <p className="text-3xl font-black">{value}</p>
    </button>
  );
}

function EmptyState({
  filter,
  totalEvents,
}: {
  filter: FilterType;
  totalEvents: number;
}) {
  if (totalEvents === 0) {
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
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/20 bg-white/5 px-6 py-12 text-center">
      <p className="text-lg text-slate-200">
        No {filter === "active" ? "active" : "completed"} events.
      </p>
      <p className="text-sm text-slate-400">
        {filter === "active"
          ? "All your events are completed."
          : "No events have been completed yet."}
      </p>
    </div>
  );
}
