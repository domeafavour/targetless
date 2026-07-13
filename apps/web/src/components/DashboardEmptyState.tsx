export function DashboardEmptyState({ filter }: { filter: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-14 text-center">
      <p className="text-sm text-muted-foreground">
        {filter === "total"
          ? "No events yet."
          : filter === "active"
            ? "No active events."
            : "No completed events."}
      </p>
    </div>
  );
}
