import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@targetless/ui/components/Button";
import { RouteView } from "@targetless/ui/components/RouteView";
import { Loader2, Plus } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { DashboardEvents } from "@/components/DashboardEvents";
import { DashboardFilter } from "@/components/DashboardFilter";
import { DashboardSorting } from "@/components/DashboardSorting";
import { DashboardTags } from "@/components/DashboardTags";
import { RefreshEventsButton } from "@/components/RefreshEventsButton";

export const Route = createFileRoute("/")({
  component: EventDashboard,
  head: () => ({
    meta: [{ title: "Dashboard | Targetless" }],
  }),
});

function EventDashboard() {
  return (
    <RouteView>
      <section className="mx-auto max-w-5xl px-4 pt-8 pb-16 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <DashboardFilter />
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm">
              <Link to="/events/new">
                <Plus className="h-3.5 w-3.5" /> New Event
              </Link>
            </Button>
            <RefreshEventsButton />
            <DashboardSorting />
          </div>
        </div>

        <DashboardTags />

        <ErrorBoundary
          fallback={
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-6 text-sm text-destructive">
              Failed to load events. Please refresh and try again.
            </div>
          }
        >
          <Suspense
            fallback={
              <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-6">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading events…</p>
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
