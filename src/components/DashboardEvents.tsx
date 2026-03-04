import { eventsApi } from "@/lib/api/events";
import {
  EventsFilter,
  EventsSortField,
  EventsSortOrder,
} from "@/lib/event-store";
import { DashboardEmptyState } from "./DashboardEmptyState";
import { DashboardEventItem } from "./DashboardEventItem";

export function DashboardEvents({
  filter,
  sortField,
  sortOrder,
}: {
  filter: EventsFilter;
  sortField: EventsSortField;
  sortOrder: EventsSortOrder;
}) {
  const { data } = eventsApi.list.useSuspenseQuery({
    variables: { filter, sortField, sortOrder },
  });

  return data.length === 0 ? (
    <DashboardEmptyState filter={filter} />
  ) : (
    <div className="space-y-4">
      {data.map((event) => (
        <DashboardEventItem key={event.id} event={event} />
      ))}
    </div>
  );
}
