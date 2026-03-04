import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  CheckIcon,
  ChevronDown,
  Loader2,
  Plus,
  RefreshCw,
  Target,
} from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { DashboardEvents } from "@/components/DashboardEvents";
import { DashboardStatCard } from "@/components/DashboardStatCard";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RouteView } from "@/components/ui/RouteView";
import { eventsApi } from "@/lib/api/events";
import {
  EventsFilter,
  EventsSortField,
  EventsSortOrder,
} from "@/lib/event-store";
import { cn } from "@/lib/utils";

const FILTER_STORAGE_KEY = "targetless-dashboard-filter";
const SORT_FIELD_STORAGE_KEY = "targetless-dashboard-sort-field";
const SORT_ORDER_STORAGE_KEY = "targetless-dashboard-sort-order";

function getStoredFilter(): EventsFilter {
  const stored = localStorage.getItem(FILTER_STORAGE_KEY);
  if (stored && ["active", "completed", "total"].includes(stored)) {
    return stored as EventsFilter;
  }
  return "active";
}

function getStoredSortField(): EventsSortField {
  const stored = localStorage.getItem(SORT_FIELD_STORAGE_KEY);
  if (stored && ["createdAt", "updatedAt"].includes(stored)) {
    return stored as EventsSortField;
  }
  return "createdAt";
}

function getStoredSortOrder(): EventsSortOrder {
  const stored = localStorage.getItem(SORT_ORDER_STORAGE_KEY);
  if (stored && ["asc", "desc"].includes(stored)) {
    return stored as EventsSortOrder;
  }
  return "desc";
}

function useFilterState() {
  const [filter, setFilter] = useState<EventsFilter>(getStoredFilter);

  useEffect(() => {
    localStorage.setItem(FILTER_STORAGE_KEY, filter);
  }, [filter]);

  return [filter, setFilter] as const;
}

function useSortState() {
  const [sortField, setSortField] =
    useState<EventsSortField>(getStoredSortField);
  const [sortOrder, setSortOrder] =
    useState<EventsSortOrder>(getStoredSortOrder);

  useEffect(() => {
    localStorage.setItem(SORT_FIELD_STORAGE_KEY, sortField);
  }, [sortField]);

  useEffect(() => {
    localStorage.setItem(SORT_ORDER_STORAGE_KEY, sortOrder);
  }, [sortOrder]);

  const toggleSortOrder = () =>
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));

  return { sortField, setSortField, sortOrder, toggleSortOrder } as const;
}

export const Route = createFileRoute("/")({
  component: EventDashboard,
  head: () => ({
    meta: [{ title: "Dashboard | Targetless" }],
  }),
});

const sortFieldOptions: { label: string; value: EventsSortField }[] = [
  { label: "Created Time", value: "createdAt" },
  { label: "Updated Time", value: "updatedAt" },
];

function EventDashboard() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useFilterState();
  const { sortField, setSortField, sortOrder, toggleSortOrder } =
    useSortState();
  const isFetching = useIsFetching({
    queryKey: eventsApi.list.getKey({ filter, sortField, sortOrder }),
  });
  const statsQuery = eventsApi.stats.useQuery();

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
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: eventsApi.list.getKey(),
                })
              }
              disabled={isFetching > 0}
            >
              <RefreshCw
                className={cn("w-4 h-4", isFetching > 0 && "animate-spin")}
              />
              Refresh
            </Button>
            <div className="flex items-center gap-2 md:ms-auto">
              <span className="text-sm text-slate-400">Sort by</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    {sortField === "createdAt"
                      ? "Created Time"
                      : "Updated Time"}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {sortFieldOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSortField(option.value)}
                    >
                      {sortField === option.value ? (
                        <CheckIcon className="w-3.5 h-3.5" />
                      ) : (
                        <span className="inline-block w-4 h-4" />
                      )}
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
              >
                {sortOrder === "desc" ? (
                  <ArrowDown className="w-3.5 h-3.5" />
                ) : (
                  <ArrowUp className="w-3.5 h-3.5" />
                )}
                {sortOrder === "desc" ? "Newest" : "Oldest"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
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
          <DashboardStatCard
            label="Total"
            value={statsQuery.data?.total ?? 0}
            active={filter === "total"}
            onClick={() => setFilter("total")}
          />
        </div>
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
            <DashboardEvents
              filter={filter}
              sortField={sortField}
              sortOrder={sortOrder}
            />
          </Suspense>
        </ErrorBoundary>
      </section>
    </RouteView>
  );
}
