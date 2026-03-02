import { eventsApi } from "@/lib/api/events";
import { formatTimestamp } from "@/lib/date-utils";
import { EventWithCurrentRecord } from "@/lib/event-store";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import CompleteRecordButton from "./CompleteRecordButton";
import EventStatusPill from "./EventStatusPill";
import { Button } from "./ui/Button";

export function DashboardEventItem({
  event,
}: {
  event: EventWithCurrentRecord;
}) {
  const queryClient = useQueryClient();
  return (
    <article className="rounded-2xl border border-white/10 bg-linear-to-br from-slate-900/70 to-slate-900/40 p-6 shadow-lg shadow-black/30">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold">{event.title}</h2>
            <EventStatusPill completed={event.completed} />
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Created at {formatTimestamp(event.createdAt)}
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
          <Link to="/events/detail" search={{ id: event.id }}>
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
}
