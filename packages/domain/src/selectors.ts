import type {
  EventEntity,
  EventRecord,
  EventWithCurrentRecord,
  ListEventsParams,
} from "./types.ts";

/**
 * Attach the current record to an event entity.
 */
export function attachCurrentRecord(
  event: EventEntity,
  records: EventRecord[],
): EventWithCurrentRecord {
  const currentRecord = event.currentRecordId
    ? (records.find((r) => r.id === event.currentRecordId) ?? null)
    : null;
  return { ...event, currentRecord };
}

/**
 * Replace `@count` placeholder in an event title with the given count.
 */
export function resolveEventTitle(
  title: string,
  count?: number | null,
): string {
  if (count == null) return title;
  return title.replace(/@count/g, String(count));
}

/**
 * Filter a list of events by the supplied filter value.
 */
export function filterEvents(
  events: EventEntity[],
  filter: ListEventsParams["filter"],
): EventEntity[] {
  if (filter === "active") return events.filter((e) => !e.completed);
  if (filter === "completed") return events.filter((e) => e.completed);
  return events;
}

/**
 * Sort a list of events by the supplied field and order.
 */
export function sortEvents(
  events: EventEntity[],
  sortField: NonNullable<ListEventsParams["sortField"]> = "createdAt",
  sortOrder: NonNullable<ListEventsParams["sortOrder"]> = "desc",
): EventEntity[] {
  return [...events].sort((a, b) => {
    const aVal = new Date(a[sortField] ?? a.createdAt).getTime();
    const bVal = new Date(b[sortField] ?? b.createdAt).getTime();
    return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
  });
}
