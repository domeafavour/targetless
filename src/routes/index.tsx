import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Plus, RefreshCw, Target } from "lucide-react";
import { useState } from "react";

import { DashboardEmptyState } from "@/components/DashboardEmptyState";
import { DashboardEventItem } from "@/components/DashboardEventItem";
import { DashboardStatCard } from "@/components/DashboardStatCard";
import { Button } from "@/components/ui/Button";
import { RouteView } from "@/components/ui/RouteView";
import { eventsApi } from "@/lib/api/events";
import { EventsFilter } from "@/lib/event-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: EventDashboard,
  head: () => ({
    meta: [{ title: "Dashboard | Targetless" }],
  }),
});

function EventDashboard() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<EventsFilter>("total");
  const eventsQuery = eventsApi.list.useQuery({
    variables: { filter },
  });
  const statsQuery = eventsApi.stats.useQuery();

  const filteredEvents = eventsQuery.data ?? [];

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
              disabled={eventsQuery.isFetching}
            >
              <RefreshCw
                className={cn(
                  "w-4 h-4",
                  eventsQuery.isFetching && "animate-spin",
                )}
              />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DashboardStatCard
            label="Total"
            value={statsQuery.data?.total ?? 0}
            active={filter === "total"}
            onClick={() => setFilter("total")}
          />
          <DashboardStatCard
            label="Active"
            value={statsQuery.data?.active ?? 0}
            active={filter === "active"}
            onClick={() => setFilter("active")}
          />
          <DashboardStatCard
            label="Completed"
            value={statsQuery.data?.completed ?? 0}
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
          <DashboardEmptyState
            filter={filter}
            totalEvents={statsQuery.data?.total ?? 0}
          />
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <DashboardEventItem key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </RouteView>
  );
}
