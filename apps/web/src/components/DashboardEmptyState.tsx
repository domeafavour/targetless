import { EventsFilter } from "@targetless/domain";

export function DashboardEmptyState({ filter }: { filter: EventsFilter }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/20 bg-white/5 px-6 py-12 text-center">
      <p className="text-lg text-slate-200">
        {filter === "total"
          ? "No events yet."
          : filter === "active"
            ? "No active events."
            : "No completed events."}
      </p>
    </div>
  );
}
