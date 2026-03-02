import { EventsFilter } from "@/lib/event-store";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "./ui/Button";

export function DashboardEmptyState({
  filter,
  totalEvents,
}: {
  filter: EventsFilter;
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
