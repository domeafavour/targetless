import { eventsApi } from "@/lib/query/events";
import { formatTimestamp } from "@/lib/date-utils";
import { EventWithCurrentRecord } from "@targetless/domain";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import CompleteRecordButton from "./CompleteRecordButton";
import EventStatusPill from "./EventStatusPill";
import { EventTitle } from "./EventTitle";
import { Button } from "@targetless/ui";

export function DashboardEventItem({
  event,
}: {
  event: EventWithCurrentRecord;
}) {
  const queryClient = useQueryClient();
  return (
    <article className="flex flex-row max-md:flex-col rounded-2xl border border-white/10 bg-linear-to-br from-slate-900/70 to-slate-900/40 p-6 shadow-lg shadow-black/30">
      <div className="flex flex-col gap-4 md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">
              <EventTitle
                title={event.title}
                count={event.currentRecord?.count}
              />
            </h2>
            <EventStatusPill completed={event.completed} />
          </div>
          <div className="mt-2 grid gap-1 text-sm text-slate-400">
            <p>Created at {formatTimestamp(event.createdAt)}</p>
            <p>Updated at {event.updatedAt ? formatTimestamp(event.updatedAt) : "N/A"}</p>
            {event.currentRecord?.note ? (
              <p className="wrap-break-word">Note: {event.currentRecord.note}</p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <span className="text-3xl font-black">
            {event.currentRecord?.count ?? "—"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 ms-auto self-start max-md:mt-6 max-md:w-full">
        <Button
          asChild
          variant="outline"
          className="max-md:flex-1 max-md:justify-center"
        >
          <Link to="/events/detail" search={{ id: event.id }}>
            <BookOpen className="h-4 w-4" /> View Records
          </Link>
        </Button>
        <CompleteRecordButton
          event={event}
          className="max-md:flex-1 max-md:justify-center"
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
