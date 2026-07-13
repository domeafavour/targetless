import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import type { EventWithCurrentRecord } from "@targetless/domain";
import { Button } from "@targetless/ui/components/Button";
import { BookOpen } from "lucide-react";
import { formatTimestamp } from "@/lib/date-utils";
import { eventsApi } from "@/lib/query/events";
import CompleteRecordButton from "./CompleteRecordButton";
import EventStatusPill from "./EventStatusPill";
import { EventTitle } from "./EventTitle";
import { TagChip } from "./TagChip";

export function DashboardEventItem({ event }: { event: EventWithCurrentRecord }) {
  const queryClient = useQueryClient();

  return (
    <article className="rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        {/* Left: event info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-base font-semibold text-foreground">
              <EventTitle title={event.title} count={event.currentRecord?.count} />
            </h2>
            <EventStatusPill completed={event.completed} />
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>Updated {event.updatedAt ? formatTimestamp(event.updatedAt) : "N/A"}</span>
            {event.tags?.map((tag) => (
              <TagChip key={tag.id} label={tag.title} variant="badge" />
            ))}
          </div>

          {event.currentRecord?.note ? (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {event.currentRecord.note}
            </p>
          ) : null}
        </div>

        {/* Right: count + actions */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <span className="font-display text-3xl font-bold tracking-tight text-foreground">
            {event.currentRecord?.count ?? "—"}
          </span>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/events/detail" search={{ id: event.id }}>
                <BookOpen className="h-3.5 w-3.5" /> Details
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
        </div>
      </div>
    </article>
  );
}
