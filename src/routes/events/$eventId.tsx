import { useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, History, Loader2 } from "lucide-react";

import CompleteEventButton from "@/components/CompleteEventButton";
import CompleteRecordButton from "@/components/CompleteRecordButton";
import { DeleteEvent } from "@/components/DeleteEvent";
import EventStatusPill from "@/components/EventStatusPill";
import NewRecordButton from "@/components/NewRecordButton";
import { RouteView } from "@/components/ui/RouteView";
import { eventsApi } from "@/lib/api/events";
import { formatTimestamp } from "@/lib/date-utils";
import { EventDetail } from "@/lib/event-store";

export const Route = createFileRoute("/events/$eventId")({
  component: EventRecordsPage,
  pendingComponent: RouteView,
});

function EventHeader({ event }: { event: EventDetail }) {
  const navigate = useNavigate({ from: "/events/$eventId" });
  const queryClient = useQueryClient();
  return (
    <header className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-6 shadow-xl shadow-black/30">
      <div className="flex flex-col items-start sm:flex-row">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-4xl font-black">{event.title}</h1>
            <EventStatusPill completed={event.completed} />
          </div>
          <p className="text-sm text-slate-400">
            Updated {event.updatedAt ? formatTimestamp(event.updatedAt) : "N/A"}{" "}
            • {event.records.length}{" "}
            {event.records.length === 1 ? "record" : "records"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 ms-auto max-sm:mt-6">
          {event.records.length > 0 &&
            event.records.every((r) => r.completed) &&
            !event.completed && (
              <NewRecordButton
                event={event}
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
          <CompleteEventButton
            event={event}
            disabled={event.completed}
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
  const { eventId } = Route.useParams();

  const eventQuery = eventsApi.detail.useSuspenseQuery({
    variables: { eventId },
  });

  const event = eventQuery.data;

  return (
    <RouteView>
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-100"
        >
          <ArrowLeft className="h-4 w-4" /> Back to events
        </Link>

        {eventQuery.isLoading ? (
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-6">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
            <p className="text-sm text-slate-300">Loading event…</p>
          </div>
        ) : eventQuery.isError ? (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-6 text-rose-200">
            Unable to load this event. It may have been deleted.
          </div>
        ) : event ? (
          <>
            <EventHeader event={event} />

            <section className="rounded-3xl border border-white/5 bg-white/5 p-6 shadow-inner shadow-black/20">
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.4em] text-slate-300">
                <History className="h-4 w-4" /> Records Timeline
              </div>
              {event.records.length === 0 ? (
                <p className="mt-6 text-slate-400">
                  This event has no records yet.
                </p>
              ) : (
                <ol className="mt-6 space-y-4">
                  {event.records.map((record) => (
                    <li
                      key={record.id}
                      className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                            Count
                          </p>
                          <p className="text-3xl font-black">{record.count}</p>
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
                      <div className="mt-4 grid gap-1 text-sm text-slate-400">
                        <p>Created {formatTimestamp(record.createdAt)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </>
        ) : null}
      </div>
    </RouteView>
  );
}
