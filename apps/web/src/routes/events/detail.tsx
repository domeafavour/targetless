import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { EventDetail } from "@targetless/domain";
import { RouteView } from "@targetless/ui/components/RouteView";
import { ArrowLeft, History, Loader2 } from "lucide-react";
import CompleteEventButton from "@/components/CompleteEventButton";
import CompleteRecordButton from "@/components/CompleteRecordButton";
import { DeleteEvent } from "@/components/DeleteEvent";
import EditEventTitleButton from "@/components/EditEventTitleButton";
import EventStatusPill from "@/components/EventStatusPill";
import { EventTitle } from "@/components/EventTitle";
import NewRecordButton from "@/components/NewRecordButton";
import { formatTimestamp } from "@/lib/date-utils";
import { eventsApi } from "@/lib/query/events";

export const Route = createFileRoute("/events/detail")({
  component: EventRecordsPage,
  head: () => ({
    meta: [{ title: "Event Details | Targetless" }],
  }),
  validateSearch: (search: Record<string, unknown>): { id: string } => {
    return {
      id: (search.id as string) || "",
    };
  },
  pendingComponent: () => (
    <RouteView>
      <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-6">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading event…</p>
      </div>
    </RouteView>
  ),
  errorComponent: () => (
    <RouteView>
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-6 text-sm text-destructive">
        Unable to load this event. It may have been deleted.
      </div>
    </RouteView>
  ),
});

function EventHeader({ event }: { event: EventDetail }) {
  const navigate = useNavigate({ from: "/events/detail" });
  const queryClient = useQueryClient();
  return (
    <header className="rounded-xl border bg-card p-6">
      <div className="flex flex-col items-start sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground font-display">
              <EventTitle title={event.title} count={event.currentRecord?.count} />
            </h1>
            <EventStatusPill completed={event.completed} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Updated {event.updatedAt ? formatTimestamp(event.updatedAt) : "N/A"} &middot;{" "}
            {event.records.length} {event.records.length === 1 ? "record" : "records"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {event.records.length > 0 &&
            event.records.every((r) => r.completed) &&
            !event.completed && (
              <NewRecordButton
                event={event}
                onSuccess={async () => {
                  await Promise.all([
                    queryClient.invalidateQueries({
                      queryKey: eventsApi.detail.getKey({
                        eventId: event.id,
                      }),
                    }),
                    queryClient.invalidateQueries({
                      queryKey: eventsApi.list.getKey(),
                    }),
                  ]);
                }}
              />
            )}
          <EditEventTitleButton
            event={event}
            onSuccess={async () => {
              await Promise.all([
                queryClient.invalidateQueries({
                  queryKey: eventsApi.detail.getKey({
                    eventId: event.id,
                  }),
                }),
                queryClient.invalidateQueries({
                  queryKey: eventsApi.list.getKey(),
                }),
              ]);
            }}
          />
          <CompleteEventButton
            event={event}
            disabled={event.completed}
            onSuccess={async () => {
              await Promise.all([
                queryClient.invalidateQueries({
                  queryKey: eventsApi.detail.getKey({
                    eventId: event.id,
                  }),
                }),
                queryClient.invalidateQueries({
                  queryKey: eventsApi.list.getKey(),
                }),
              ]);
            }}
          />
          <DeleteEvent
            id={event.id}
            title={event.title}
            onSuccess={() => {
              queryClient.removeQueries({
                queryKey: eventsApi.detail.getKey({ eventId: event.id }),
              });
              navigate({ to: "/" });
            }}
          />
        </div>
      </div>
    </header>
  );
}

function EventRecordsPage() {
  const queryClient = useQueryClient();
  const { id } = Route.useSearch();
  const { data: event } = eventsApi.detail.useSuspenseQuery({
    variables: { eventId: id },
  });

  return (
    <RouteView>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <EventHeader event={event} />

        <section className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <History className="h-4 w-4 text-muted-foreground" /> Records
          </div>
          {event.records.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">This event has no records yet.</p>
          ) : (
            <ol className="mt-4 space-y-3">
              {event.records.map((record) => (
                <li key={record.id} className="rounded-lg border bg-background/50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <span className="font-display text-2xl font-bold text-foreground">
                        {record.count}
                      </span>
                      <div className="text-sm text-muted-foreground">
                        <p>Created {formatTimestamp(record.createdAt)}</p>
                        {record.note && <p className="mt-0.5">{record.note}</p>}
                      </div>
                    </div>
                    {record.completed ? (
                      <EventStatusPill completed />
                    ) : (
                      <CompleteRecordButton
                        event={event}
                        disabled={!event.currentRecord || event.completed}
                        onSuccess={async (_, variables) => {
                          await Promise.all([
                            queryClient.invalidateQueries({
                              queryKey: eventsApi.detail.getKey({
                                eventId: variables.eventId,
                              }),
                            }),
                            queryClient.invalidateQueries({
                              queryKey: eventsApi.list.getKey(),
                            }),
                          ]);
                        }}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </RouteView>
  );
}
