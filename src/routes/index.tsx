import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Plus, Target } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { DashboardEvents } from "@/components/DashboardEvents";
import { DashboardFilter } from "@/components/DashboardFilter";
import { DashboardSorting } from "@/components/DashboardSorting";
import { RefreshEventsButton } from "@/components/RefreshEventsButton";
import { Button } from "@/components/ui/Button";
import { RouteView } from "@/components/ui/RouteView";

export const Route = createFileRoute("/")({
  component: EventDashboard,
  head: () => ({
    meta: [{ title: "Dashboard | Targetless" }],
  }),
});

function EventDashboard() {
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
          <div className="flex flex-wrap gap-3 items-center">
            <Button asChild>
              <Link to="/events/new">
                <Plus className="w-4 h-4" /> Create Event
              </Link>
            </Button>
            <RefreshEventsButton />
            <DashboardSorting />
          </div>
        </div>

        <DashboardFilter />
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-16">
        <ErrorBoundary
          fallback={
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-6 text-rose-100">
              Failed to load events. Please refresh and try again.
            </div>
          }
        >
          <Suspense
            fallback={
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-6">
                <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
                <p className="text-sm text-slate-300">Loading events…</p>
              </div>
            }
          >
            <DashboardEvents />
          </Suspense>
        </ErrorBoundary>
      </section>
    </RouteView>
  );
}
